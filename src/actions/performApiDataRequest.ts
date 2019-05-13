import { ActionCreator } from 'redux';
import { ApiDataState, Action } from '../reducer';
import {
    ApiDataBinding,
    ApiDataEndpointConfig,
    ApiDataGlobalConfig,
    ApiDataRequest,
    EndpointParams,
    getResultData
} from '../index';
import { getApiDataRequest } from '../selectors/getApiDataRequest';
import { apiDataFail } from './apiDataFail';
import { apiDataSuccess } from './apiDataSuccess';
import { getRequestKey } from '../helpers/getRequestKey';
import { formatUrl } from '../helpers/formatUrl';
import Request, { HandledResponse } from '../request';
import { cacheExpired } from '../selectors/cacheExpired';
import { RequestHandler } from '../request';

export const getRequestProperties = (endpointConfig: ApiDataEndpointConfig, globalConfig: ApiDataGlobalConfig, state: any, body?: any) => {
    const defaultProperties = { body, headers: {}, method: endpointConfig.method };
    const requestProperties = composeConfigPipeFn(endpointConfig.setRequestProperties, globalConfig.setRequestProperties)(defaultProperties, state);
    requestProperties.headers = composeConfigPipeFn(endpointConfig.setHeaders, globalConfig.setHeaders)(defaultProperties.headers, state);

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

/**
 * Manually trigger an request to an endpoint. Primarily used for any non-GET requests. For get requests it is preferred
 * to use {@link withApiData}.
 */
export const performApiRequest = (endpointKey: string, params?: EndpointParams, body?: any) => {
    return (dispatch: ActionCreator<Action>, getState: () => { apiData: ApiDataState }): Promise<ApiDataBinding<any>> => {
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

        // promise resolve value, get it at the end to get up to date values
        const getApiDataBinding = (request?: ApiDataRequest): ApiDataBinding<any> => ({
            data: getResultData(getState().apiData, endpointKey, params),
            request: request || getApiDataRequest(getState().apiData, endpointKey, params)!,
        });

        const apiDataRequest = getApiDataRequest(state.apiData, endpointKey, params);
        // don't re-trigger calls when already loading and don't re-trigger succeeded GET calls
        if (apiDataRequest && (
            apiDataRequest.networkStatus === 'loading' ||
            (config.method === 'GET' && apiDataRequest.networkStatus === 'success' && !cacheExpired(config, apiDataRequest))
        )) {
            return Promise.resolve(getApiDataBinding(apiDataRequest));
        }

        const requestKey = getRequestKey(endpointKey, params || {});

        dispatch(({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey,
                endpointKey,
                params
            }
        }));
        const requestProperties = getRequestProperties(config, globalConfig, state, body);

        const onError = () => {
            const updatedRequest = getApiDataRequest(getState().apiData, endpointKey, params);

            if (typeof config.afterError === 'function' && config.afterError(updatedRequest, dispatch, getState) === false) {
                return;
            }

            if (typeof globalConfig.afterError === 'function') {
                globalConfig.afterError(updatedRequest, dispatch, getState);
            }
        };

        return new Promise((resolve: (ApiDataBinding: ApiDataBinding<any>) => void) => {
            const timeout = config.timeout || globalConfig.timeout;
            let abortTimeout: any;
            let aborted = false;

            if (timeout) {
                abortTimeout = setTimeout(
                    () => {
                        const error = new Error('Timeout');
                        // todo: call handleError instead
                        dispatch(apiDataFail(requestKey, error));
                        onError();
                        aborted = true;
                        resolve(getApiDataBinding());
                    },
                    timeout
                );
            }
            requestFunction(formatUrl(config.url, params), requestProperties).then(
                (handledResponse: HandledResponse) => {
                    if (aborted) {
                        return;
                    }
                    clearTimeout(abortTimeout);

                    if (handledResponse.response.ok) {
                        handleSuccess(handledResponse)
                    } else {
                        handleFail(handledResponse);
                    }
                },
                (error: any) => {
                    if (aborted) {
                        return;
                    }
                    clearTimeout(abortTimeout);
                    // todo: call handleError instead
                    dispatch(apiDataFail(requestKey, error));
                    onError();
                    resolve(getApiDataBinding());
                }
            );

            const handleSuccess = ({ response, body: responseBody }: HandledResponse) => {
                // before success cb
                const beforeSuccess = composeConfigPipeFn(config.beforeSuccess, globalConfig.beforeSuccess);
                const alteredResp = beforeSuccess({ response, body: responseBody });
                response = alteredResp.response;
                responseBody = alteredResp.body;

                // dispatch success
                dispatch(apiDataSuccess(requestKey, config, response, responseBody));
                const updatedRequest = getApiDataRequest(getState().apiData, endpointKey, params);

                // after success cb
                const afterSuccess = composeConfigOverrideFn(config.afterSuccess, globalConfig.afterSuccess);
                afterSuccess(updatedRequest, dispatch, getState);

                resolve(getApiDataBinding(updatedRequest));
            };

            const handleFail = (responseBody: any, response?: Response) => {
                // before error cb
                const beforeError = composeConfigPipeFn(config.beforeError, globalConfig.beforeError);
                const alteredResp = beforeError({ response, body: responseBody });
                response = alteredResp.response;
                responseBody = alteredResp.body;

                // dispatch fail
                dispatch(apiDataFail(requestKey, responseBody, response));
                const updatedRequest = getApiDataRequest(getState().apiData, endpointKey, params);

                // after error cb
                const afterError = composeConfigOverrideFn(config.afterError, globalConfig.afterError);
                afterError(updatedRequest, dispatch, getState);

                resolve(getApiDataBinding());
            };
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