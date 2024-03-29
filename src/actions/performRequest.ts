import { State } from '../reducer';
import {
    Binding,
    ConfigAfterProps,
    ConfigBeforeProps,
    EndpointConfig,
    GlobalConfig,
    EndpointParams,
    DataRequest,
    HandledResponse,
    RequestConfig,
    RequestHandler,
} from '../types';
import { getRequest } from '../selectors/getRequest';
import { fail } from './fail';
import { success } from './success';
import { getRequestKey } from '../helpers/getRequestKey';
import { formatUrl } from '../helpers/formatUrl';
import { BindingsStore } from '../helpers/createBinding';
import Request from '../request';
import { cacheExpired } from '../selectors/cacheExpired';
import { getActions } from '../helpers/getActions';
import { Dispatch } from 'redux';
import { getFailedData } from '../selectors/getFailedData';
import { getResultData } from '../selectors/getResultData';
import { shouldAutoTrigger } from '../withApiData';

export const getRequestProperties = (
    endpointConfig: EndpointConfig,
    globalConfig: GlobalConfig,
    state: any,
    body?: any
): RequestInit => {
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

export const getRequestConfig = (
    endpointConfig: EndpointConfig,
    globalConfig: GlobalConfig,
): RequestConfig => {
    const parseMethod = endpointConfig.parseMethod ?? globalConfig.parseMethod ?? 'json';
    return {
        parseMethod
    };
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

type PerformRequest = (
    endpointKey: string,
    inputParams?: EndpointParams,
    body?: any,
    instanceId?: string,
    bindingsStore?: BindingsStore,
    customConfig?: Partial<EndpointConfig>
) => (dispatch: Dispatch, getState: () => { apiData: State }) => Promise<Binding<any, any>>;

const loadingPromises: { [requestKey: string]: Promise<Binding<any, any>> } = {};

export const getLoadingPromise = (requestKey: string): Promise<Binding<any, any>> | null => {
    return loadingPromises[requestKey] ?? null;
};

/**
 * Manually trigger an request to an endpoint. Prefer to use {@link withApiData} instead of using this function directly.
 * This is an action creator, so make sure to dispatch the return value.
 */
export const performRequest: PerformRequest = (
    endpointKey: string,
    inputParams?: EndpointParams,
    body?: any,
    instanceId: string = '',
    bindingsStore: BindingsStore = new BindingsStore(),
    customConfig?: Partial<EndpointConfig>
) => {
    return (dispatch: Dispatch, getState: () => { apiData: State }): Promise<Binding<any, any>> => {
        const state = getState();
        const endpointConfig = state.apiData.endpointConfig[endpointKey];
        const globalConfig = state.apiData.globalConfig;
        if (!endpointConfig) {
            const errorMsg = `apiData.performRequest: no config with key ${endpointKey} found!`;
            if (__DEV__) {
                console.error(errorMsg);
            }
            throw new Error(errorMsg);
        }

        const config = { ...endpointConfig, ...customConfig };

        // Merge the defaultParams and URL inputParams. This is where any defaultParams get overwritten.
        const params = { ...config.defaultParams, ...inputParams };

        const getCurrentBinding = (request?: DataRequest): Binding<any, any> => {
            return bindingsStore.getBinding(endpointKey, params, dispatch, instanceId, getState().apiData, request);
        };

        const apiDataRequest = getRequest(state.apiData, endpointKey, params, instanceId);
        const requestKey = getRequestKey(endpointKey, params || {}, instanceId);

        if (apiDataRequest && apiDataRequest.networkStatus === 'loading' && loadingPromises[requestKey]) {
            return loadingPromises[requestKey];
        }

        // don't re-trigger calls when already loading and don't re-trigger succeeded GET calls
        // TODO: unit test this scenario
        if (
            apiDataRequest &&
            shouldAutoTrigger(state.apiData, endpointKey) &&
            apiDataRequest.networkStatus === 'success' &&
            !cacheExpired(config, apiDataRequest)
        ) {
            return Promise.resolve(getCurrentBinding(apiDataRequest));
        }

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
        const requestConfig = getRequestConfig(config, globalConfig);
        const promise = new Promise((resolve: (binding: Binding<any, any>) => void, reject: (binding: Binding<any, any>) => void) => {
            const timeout = config.timeout || globalConfig.timeout;
            let abortTimeout: any;
            let aborted = false;

            if (timeout) {
                abortTimeout = setTimeout(() => {
                    aborted = true;
                    handleFail(new Error('Timeout'));
                }, timeout);
            }
            requestFunction(url, requestProperties, requestConfig).then(
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

            function beforeProps(): ConfigBeforeProps {
                return {
                    request: getRequest(getState().apiData, endpointKey, params, instanceId)!, // there should always be a request after dispatching fetch
                    requestBody: body,
                    endpointKey,
                };
            }

            function afterProps(isFailed: boolean): ConfigAfterProps {
                return {
                    ...beforeProps(),
                    resultData: isFailed
                        ? getFailedData(getState().apiData, endpointKey, params, instanceId)
                        : getResultData(getState().apiData, endpointKey, params, instanceId),
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
                dispatch(success(requestKey, config, response, responseBody));

                // after success cb
                if (config.afterSuccess || globalConfig.afterSuccess) {
                    const afterSuccess = composeConfigOverrideFn(config.afterSuccess, globalConfig.afterSuccess);
                    afterSuccess(afterProps(false));
                }

                resolve(getCurrentBinding());
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
                dispatch(fail(requestKey, responseBody, response));

                // after error cb
                if (config.afterFailed || globalConfig.afterFailed) {
                    const afterFailed = composeConfigOverrideFn(config.afterFailed, globalConfig.afterFailed);
                    afterFailed(afterProps(true));
                }
                reject(getCurrentBinding());
            }
        });

        dispatch({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey,
                endpointKey,
                params,
                url
            },
        });

        loadingPromises[requestKey] = promise;
        // .catch(() => null) is added to prevent unhandled promise rejection errors
        promise.catch(() => null).finally(() => delete loadingPromises[requestKey]);
        return promise;
    };
};

/**
 * Use your own request function that calls the api and reads the responseBody response. Make sure it implements the
 * {@link RequestHandler} interface.
 * @param requestHandler
 */
export const setRequestHandler = (requestHandler: RequestHandler) => {
    requestFunction = requestHandler;
};
