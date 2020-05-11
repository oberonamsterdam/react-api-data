import { ApiDataState } from '../reducer';
import {
    ApiDataBinding,
    ApiDataConfigAfterProps,
    ApiDataConfigBeforeProps,
    ApiDataEndpointConfig,
    ApiDataGlobalConfig,
    EndpointParams,
    ApiDataRequest,
} from '../types';
import { getApiDataRequest } from '../selectors/getApiDataRequest';
import { apiDataFail } from './apiDataFail';
import { apiDataSuccess } from './apiDataSuccess';
import { getRequestKey } from '../helpers/getRequestKey';
import { formatUrl } from '../helpers/formatUrl';
import { BindingsStore } from '../helpers/createApiDataBinding';
import Request, { HandledResponse } from '../request';
import { cacheExpired } from '../selectors/cacheExpired';
import { RequestHandler } from '../request';
import { getActions } from '../helpers/getActions';
import { Dispatch } from 'redux';
import { getResultData } from '../selectors/getResultData';

export const getRequestProperties = (
    endpointConfig: ApiDataEndpointConfig,
    globalConfig: ApiDataGlobalConfig,
    state: any,
    body?: any
) => {
    const defaultProperties = { body, headers: {}, method: endpointConfig.method };
    const requestProperties = composeConfigPipeFn(
        endpointConfig.setRequestProperties,
        globalConfig.setRequestProperties
    )(defaultProperties, state);
    requestProperties.headers = composeConfigPipeFn(endpointConfig.setHeaders, globalConfig.setHeaders)(
        defaultProperties.headers,
        state
    );

    return requestProperties;
};

// passes return value from endpoint function to global function
const composeConfigPipeFn = (endpointFn?: any, globalFunction?: any): any => {
    const id = (val: any) => val;
    const fnA = endpointFn || id;
    const fnB = globalFunction || id;

    return (value: any, ...args: any[]) => fnA(fnB(value, ...args), ...args);
};

// calls global function after endpoint function if endpoint function does not return false
const composeConfigOverrideFn = (endpointFn?: any, globalFn?: any): any => {
    const fallback = (val: any) => undefined;
    const fnA = endpointFn || fallback;
    const fnB = globalFn || fallback;

    return (...args: any[]) => fnA(...args) !== false && fnB(...args);
};

let requestFunction = Request;

const __DEV__ = process.env.NODE_ENV === 'development';

type PerformApiRequest = (
    endpointKey: string,
    inputParams?: EndpointParams,
    body?: any,
    instanceId?: string,
    bindingsStore?: BindingsStore
) => (dispatch: Dispatch, getState: () => { apiData: ApiDataState }) => Promise<ApiDataBinding<any>>;

/**
 * Manually trigger an request to an endpoint. Prefer to use {@link withApiData} instead of using this function directly.
 * This is an action creator, so make sure to dispatch the return value.
 */
export const performApiRequest: PerformApiRequest = (
    endpointKey: string,
    inputParams?: EndpointParams,
    body?: any,
    instanceId: string = '',
    bindingsStore: BindingsStore = new BindingsStore()
) => {
    return (dispatch: Dispatch, getState: () => { apiData: ApiDataState }): Promise<ApiDataBinding<any>> => {
        const state = getState();
        const config = state.apiData.endpointConfig[endpointKey];
        const globalConfig = state.apiData.globalConfig;
        if (!config) {
            const errorMsg = `apiData.performApiRequest: no config with key ${endpointKey} found!`;
            if (__DEV__) {
                console.error(errorMsg);
            }
            return Promise.reject(errorMsg);
        }

        // Merge the defaultParams and URL inputParams. This is where any defaultParams get overwritten.
        const params = { ...config.defaultParams, ...inputParams };

        const getCurrentApiDataBinding = (request?: ApiDataRequest): ApiDataBinding<any> => {
            return bindingsStore.getBinding(endpointKey, params, dispatch, instanceId, getState().apiData, request);
        };

        const apiDataRequest = getApiDataRequest(state.apiData, endpointKey, params, instanceId);
        // don't re-trigger calls when already loading and don't re-trigger succeeded GET calls
        if (
            apiDataRequest &&
            (apiDataRequest.networkStatus === 'loading' ||
                (config.method === 'GET' &&
                    apiDataRequest.networkStatus === 'success' &&
                    !cacheExpired(config, apiDataRequest)))
        ) {
            return Promise.resolve(getCurrentApiDataBinding(apiDataRequest));
        }

        const requestKey = getRequestKey(endpointKey, params || {}, instanceId);
        const url = formatUrl(config.url, params, config.queryStringOpts);

        dispatch({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey,
                endpointKey,
                params,
                url,
            },
        });
        
        const requestProperties = getRequestProperties(config, globalConfig, state, body);

        return new Promise((resolve: (ApiDataBinding: ApiDataBinding<any>) => void) => {
            const timeout = config.timeout || globalConfig.timeout;
            let abortTimeout: any;
            let aborted = false;

            if (timeout) {
                abortTimeout = setTimeout(() => {
                    aborted = true;
                    handleFail(new Error('Timeout'));
                }, timeout);
            }
            requestFunction(url, requestProperties).then(
                (handledResponse: HandledResponse) => {
                    if (aborted) {
                        return;
                    }
                    clearTimeout(abortTimeout);

                    if (handledResponse.response.ok) {
                        handleSuccess(handledResponse);
                    } else {
                        handleFail(handledResponse.body, handledResponse.response);
                    }
                },
                (error: any) => {
                    if (aborted) {
                        return;
                    }
                    clearTimeout(abortTimeout);
                    handleFail(error);
                }
            );

            function beforeProps(): ApiDataConfigBeforeProps {
                return {
                    request: getApiDataRequest(getState().apiData, endpointKey, params, instanceId)!, // there should always be a request after dispatching fetch
                    requestBody: body,
                    endpointKey,
                };
            }

            function afterProps(): ApiDataConfigAfterProps {
                return {
                    ...beforeProps(),
                    resultData: getResultData(getState().apiData, endpointKey, params, instanceId),
                    getState,
                    dispatch,
                    actions: getActions(dispatch),
                };
            }

            function handleSuccess({ response, body: responseBody }: HandledResponse, skipBefore: boolean = false) {
                if (!skipBefore) {
                    // before success cb, allows turning this into fail by altering ok value
                    const beforeSuccess = composeConfigPipeFn(config.beforeSuccess, globalConfig.beforeSuccess);
                    const alteredResp = beforeSuccess({ response, body: responseBody }, beforeProps());
                    response = alteredResp.response;
                    responseBody = alteredResp.body;

                    if (!response.ok) {
                        handleFail(responseBody, response, true);
                        return;
                    }
                }
                // dispatch success
                dispatch(apiDataSuccess(requestKey, config, response, responseBody));

                // after success cb
                if (config.afterSuccess || globalConfig.afterSuccess) {
                    const afterSuccess = composeConfigOverrideFn(config.afterSuccess, globalConfig.afterSuccess);
                    afterSuccess(afterProps());
                }

                resolve(getCurrentApiDataBinding());
            }

            function handleFail(responseBody: any, response?: Response, skipBefore: boolean = false) {
                if (!skipBefore) {
                    // before error cb, allows turning this into success by altering ok value
                    const beforeFailed = composeConfigPipeFn(config.beforeFailed, globalConfig.beforeFailed);
                    const alteredResp = beforeFailed({ response, body: responseBody }, beforeProps());
                    response = alteredResp.response;
                    responseBody = alteredResp.body;

                    if (response && response.ok) {
                        handleSuccess({ response, body: responseBody }, true);
                        return;
                    }
                }

                // dispatch fail
                dispatch(apiDataFail(requestKey, responseBody, response));

                // after error cb
                if (config.afterFailed || globalConfig.afterFailed) {
                    const afterFailed = composeConfigOverrideFn(config.afterFailed, globalConfig.afterFailed);
                    afterFailed(afterProps());
                }

                resolve(getCurrentApiDataBinding());
            }
        });
    };
};

/**
 * Use your own request function that calls the api and reads the responseBody response. Make sure it implements the
 * {@link RequestHandler} interface.
 * @param requestHandler
 */
export const useRequestHandler = (requestHandler: RequestHandler) => {
    requestFunction = requestHandler;
};
