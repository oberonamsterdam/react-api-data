import { ActionCreator } from 'redux';
import { ApiDataState, Action } from '../reducer';
import { ApiDataBinding, ApiDataEndpointConfig, ApiDataGlobalConfig, EndpointParams, getResultData } from '../index';
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
    const requestProperties = composeConfigFn(endpointConfig.setRequestProperties, globalConfig.setRequestProperties)(defaultProperties, state);
    requestProperties.headers = composeConfigFn(endpointConfig.setHeaders, globalConfig.setHeaders)(defaultProperties.headers, state);

    return requestProperties;
};

const composeConfigFn = (endpointFn?: any, globalFunction?: any): any => {
    const id = (val: any) => val;
    const fnA = endpointFn || id;
    const fnB = globalFunction || id;

    return (value: any, state: ApiDataState) => fnA(fnB(value, state), state);
};

let requestFunction = Request;

const __DEV__ = process.env.NODE_ENV === 'development';

/**
 * Manually trigger an request to an endpoint. Primarily used for any non-GET requests. For get requests it is preferred
 * to use {@link withApiData}.
 * @return {Promise<void>} Always resolves, use request networkStatus to see if call was succeeded or not.
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
        const apiDataRequest = getApiDataRequest(state.apiData, endpointKey, params);
        // don't re-trigger calls when already loading and don't re-trigger succeeded GET calls
        if (apiDataRequest && (
            apiDataRequest.networkStatus === 'loading' ||
            (config.method === 'GET' && apiDataRequest.networkStatus === 'success' && !cacheExpired(config, apiDataRequest))
        )) {
            return Promise.resolve({ data: getResultData(getState().apiData, endpointKey, params), request: getApiDataRequest(getState().apiData, endpointKey, params) });
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

        const onError = (responseBody: any, response?: Response) => {
            if (typeof config.handleErrorResponse === 'function' && config.handleErrorResponse(responseBody, params!, body, dispatch, getState, response) === false) {
                return;
            }

            if (typeof globalConfig.handleErrorResponse === 'function') {
                globalConfig.handleErrorResponse(responseBody, endpointKey, params!, body, dispatch, getState);
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
                        dispatch(apiDataFail(requestKey, error));
                        onError(error);
                        aborted = true;
                        resolve({ data: getResultData(getState().apiData, endpointKey, params), request: getApiDataRequest(getState().apiData, endpointKey, params) });
                    },
                    timeout
                );
            }
            requestFunction(formatUrl(config.url, params), requestProperties).then(
                ({ response, body: responseBody }: HandledResponse) => {
                    if (aborted) {
                        return;
                    }
                    clearTimeout(abortTimeout);
                    const beforeSuccess = config.beforeSuccess || globalConfig.beforeSuccess;
                    if (response.ok && beforeSuccess) {
                        const alteredResp = beforeSuccess({ response, body: responseBody });
                        response = alteredResp.response;
                        responseBody = alteredResp.body;
                    }
                    if (response.ok) {
                        dispatch(apiDataSuccess(requestKey, config, response, responseBody));
                        if (config.afterSuccess || globalConfig.afterSuccess) {
                            const updatedRequest = getApiDataRequest(getState().apiData, endpointKey, params);
                            if (config.afterSuccess && config.afterSuccess(updatedRequest, dispatch, getState) === false) {
                                return;
                            }
                            if (globalConfig.afterSuccess) {
                                globalConfig.afterSuccess(updatedRequest, dispatch, getState);
                            }
                        }
                    } else {
                        dispatch(apiDataFail(requestKey, response, responseBody));
                        onError(response, responseBody);
                    }
                    resolve({ data: getResultData(getState().apiData, endpointKey, params), request: getApiDataRequest(getState().apiData, endpointKey, params) });
                },
                (error: any) => {
                    if (aborted) {
                        return;
                    }
                    clearTimeout(abortTimeout);
                    dispatch(apiDataFail(requestKey, undefined, error));
                    onError(undefined, error);
                    resolve({ data: getResultData(getState().apiData, endpointKey, params), request: getApiDataRequest(getState().apiData, endpointKey, params) });
                }
            );
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