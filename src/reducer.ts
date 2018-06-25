/*
 * REDUX API DATA - lib for handling api requests and response data.
 * Consists of the following:
 *
 * Configuration:
 * - Global configuration, see constants/apiDataConfig
 * - Endpoint configuration, see constants/apiDataConfig
 *
 * Getting and using data:
 * - withApiData HOC to bind data from the api to your component. Automatically calls your endpoint if needed.
 *
 * Sending data to endpoints (i.e. POST, PATCH, DELETE)
 * - performApiRequest action creator thunk. Dispatch to manually trigger an endpoint request, i.e. when executing a post or patch
 *
 * Getting specific info from the api data store:
 * - getApiDataRequest - get the Request object to monitor endpoint status
 * - getResultData - get the (de-normalized) result of an endpint
 * - getEntity - get a specific entity from the store
 *
 * Invalidating an endpoint so it will reload:
 * - invalidateApiDataRequest - Use for example to invalidate a get (list) request after a POST or DELETE. withApiData
 * HOC will automatically re-trigger calls to invalidated requests.
 *
 * NOTE: THIS LIB STORES ITS DATA IN state.apiData. NEVER ACCESS THIS PROPERTY FROM ANYWHERE OUTSIDE THIS FILE DIRECTLY.
 * THIS STORE ITSELF IS CONSIDERED PRIVATE TO THIS LIB AND IT'S ARCHITECTURE MIGHT CHANGE. An interface is provided through
 * the HOC and the selectors, use those.
 */

import request from './request';
import { HandledResponse, RequestHandler } from './request';
import { normalize, denormalize } from 'normalizr';
import {
    ApiDataEndpointConfig, ApiDataGlobalConfig, ApiDataRequest, EndpointParams, NetworkStatus,
    NormalizedData,
} from './index';

const __DEV__ = process.env.NODE_ENV === 'development';

// state def

export type Entities = {
    [type: string]: {
        [id: string]: Object
    }
}

export type ApiDataState = {
    globalConfig: ApiDataGlobalConfig,
    endpointConfig: {
        [endpointKey: string]: ApiDataEndpointConfig
    },
    requests: {
        [requestKey: string]: ApiDataRequest
    },
    entities: Entities,
}

const defaultState = {
    globalConfig: {},
    endpointConfig: {},
    requests: {},
    entities: {}
};

// actions

export type ConfigureApiDataAction = {
    type: 'CONFIGURE_API_DATA',
    payload: {
        globalConfig: ApiDataGlobalConfig,
        endpointConfig: {
            [endpointKey: string]: ApiDataEndpointConfig,
        }
    }
}

export type FetchApiDataAction = {
    type: 'FETCH_API_DATA',
    payload: {
        requestKey: string,
        endpointKey: string,
        params?: EndpointParams,
    },
}

export type ApiDataSuccessAction = {
    type: 'API_DATA_SUCCESS',
    payload: {
        requestKey: string,
        response: Response,
        normalizedData?: NormalizedData,
        responseBody?: any,
    }
}

export type ApiDataFailAction = {
    type: 'API_DATA_FAIL',
    payload: {
        requestKey: string,
        response?: Response,
        errorBody: any,
    }
}

export type InvalidateApiDataRequestAction = {
    type: 'INVALIDATE_API_DATA_REQUEST',
    payload: {
        requestKey: string
    }
}

export type ApiDataAfterRehydrateAction = {
    type: 'API_DATA_AFTER_REHYDRATE',
};

export type CleanApiDataAction = {
    type: 'CLEAR_API_DATA'
}

export type Action = ConfigureApiDataAction | FetchApiDataAction | ApiDataSuccessAction | ApiDataFailAction | InvalidateApiDataRequestAction | ApiDataAfterRehydrateAction | CleanApiDataAction;

let requestFunction = request;

// reducer

export default (state: ApiDataState = defaultState, action: Action): ApiDataState => {
    switch (action.type) {
        case 'CONFIGURE_API_DATA':
            return {
                ...state,
                ...action.payload
            };
        case 'FETCH_API_DATA':
            return {
                ...state,
                requests: {
                    ...state.requests,
                    [action.payload.requestKey]: {
                        ...state.requests[action.payload.requestKey],
                        networkStatus: 'loading',
                        lastCall: Date.now(),
                        duration: 0,
                        endpointKey: action.payload.endpointKey,
                        params: action.payload.params,
                    }
                }
            };
        case 'API_DATA_SUCCESS': {
            const request = state.requests[action.payload.requestKey];

            return {
                ...state,
                requests: {
                    ...state.requests,
                    [action.payload.requestKey]: {
                        ...request,
                        networkStatus: 'success',
                        duration: Date.now() - request.lastCall,
                        result: action.payload.normalizedData ? action.payload.normalizedData.result : action.payload.responseBody,
                        response: action.payload.response,
                        errorBody: undefined,
                    }
                },
                entities: {
                    ...(action.payload.normalizedData
                            ? addEntities(state.entities, action.payload.normalizedData.entities)
                            : state.entities
                    )
                }
            };
        }
        case 'API_DATA_FAIL': {
            const request = state.requests[action.payload.requestKey];

            return {
                ...state,
                requests: {
                    ...state.requests,
                    [action.payload.requestKey]: {
                        ...request,
                        networkStatus: 'failed',
                        duration: Date.now() - request.lastCall,
                        response: action.payload.response,
                        errorBody: action.payload.errorBody,
                        result: undefined,
                    }
                }
            };
        }
        case 'INVALIDATE_API_DATA_REQUEST': {
            const request = state.requests[action.payload.requestKey];
            return request ? {
                ...state,
                requests: {
                    ...state.requests,
                    [action.payload.requestKey]: {
                        ...request,
                        networkStatus: 'ready'
                    }
                }
            } : state;
        }
        case 'CLEAR_API_DATA': {
            return defaultState;
        }
        case 'API_DATA_AFTER_REHYDRATE':
            return {
                ...state,
                requests: recoverNetworkStatuses(state.requests),
            };
        default:
            return state;
    }
};

// merges newEntities into entities
const addEntities = (entities: Entities, newEntities: Entities): Entities => Object.keys(newEntities).reduce((result, entityType) => ({
    ...result,
    [entityType]: {
        ...(entities[entityType] || {}),
        ...newEntities[entityType]
    }
}), {...entities});

const formatUrl = (url: string, params?: EndpointParams): string =>
    !params ? url : url.replace(/:[a-zA-Z]+/g, match => params ? String(params[match.substr(1)]) || '' : '');

const getRequestKey = (endpointKey: string, params: EndpointParams = {}): string =>
    endpointKey + '/' + Object.keys(params).sort().map(param => param + '=' + params[param]).join('&');

// resets a networkStatus to ready if it was loading. Use when recovering state from storage to prevent loading states
// when no calls are running.
export const recoverNetworkStatus = (networkStatus: NetworkStatus): NetworkStatus =>
    networkStatus === 'loading' ? 'ready' : networkStatus;

export const recoverNetworkStatuses = (requests: {[requestKey: string]: ApiDataRequest}): {[requestKey: string]: ApiDataRequest} => ({
    ...(Object.keys(requests).reduce((result, key) => ({
        ...result,
        [key]: {
            ...requests[key],
            networkStatus: recoverNetworkStatus(requests[key].networkStatus)
        }
    }), {})),

});

// action creators

/**
 * Register your global and endpoint configurations. Make sure you do this before you mount any components using
 * withApiData.
 */
export const configureApiData = (globalConfig: ApiDataGlobalConfig, endpointConfig: {[endpointKey: string]: ApiDataEndpointConfig}): ConfigureApiDataAction => ({
    type: 'CONFIGURE_API_DATA',
    payload: {
        globalConfig,
        endpointConfig
    }
});

const apiDataSuccess = (requestKey: string, endpointConfig: ApiDataEndpointConfig, response: Response, body: Object): ApiDataSuccessAction => ({
    type: 'API_DATA_SUCCESS',
    payload: {
        requestKey,
        response,
        responseBody: typeof endpointConfig.transformResponseBody === 'function'
            ? endpointConfig.transformResponseBody(body)
            : body,
        normalizedData: endpointConfig.responseSchema
            ? normalize(body, endpointConfig.responseSchema)
            : undefined,
    }
});

const apiDataFail = (requestKey: string, response?: Response, errorBody?: any): ApiDataFailAction => ({
    type: 'API_DATA_FAIL',
    payload: {
        requestKey,
        response,
        errorBody
    }
});

// composes optional functions to work like: value -> globalFn? -> endpointFn? -> result
const composeConfigFn = (endpointFn?: Function, globalFunction?: Function): Function => {
    // eslint-disable-next-line no-unused-vars
    const id = (val: any) => val;
    const fnA = endpointFn || id;
    const fnB = globalFunction || id;

    return (value: any, state: Object) => fnA(fnB(value, state));
};

/**
 * Manually trigger an request to an endpoint. Primarily used for any non-GET requests. For get requests it is preferred
 * to use {@link withApiData}.
 * @return {Promise<void>} Always resolves, use request networkStatus to see if call was succeeded or not.
 */
export const performApiRequest = (endpointKey: string, params?: EndpointParams, body?: any) =>
    (dispatch: Function, getState: () => {apiData: ApiDataState}): Promise<void> => {
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
            return Promise.resolve();
        }

        const requestKey = getRequestKey(endpointKey, params || {});

        dispatch({
            type: 'FETCH_API_DATA',
            payload: {
                requestKey,
                endpointKey,
                params,
            }
        });

        const defaultRequestProperties = {body, headers: {}, method: config.method};
        const requestProperties = composeConfigFn(config.setRequestProperties, globalConfig.setRequestProperties)(defaultRequestProperties, state);
        requestProperties.headers = composeConfigFn(config.setHeaders, globalConfig.setHeaders)(defaultRequestProperties.headers, state);

        const onError = (response?: Response, responseBody?: any) => {
            if (response && typeof config.handleErrorResponse === 'function' && config.handleErrorResponse(response, responseBody, params || {}, body, dispatch, getState) === false) {
                return;
            }

            if (response && typeof globalConfig.handleErrorResponse === 'function') {
                globalConfig.handleErrorResponse(response, responseBody, endpointKey, params || {}, body, dispatch, getState);
            }
        };

        return new Promise((resolve: Function) => {
            const timeout = config.timeout || globalConfig.timeout;

            let abortTimeout: any;
            let aborted = false;

            if (timeout) {
                abortTimeout = setTimeout(() => {
                    const error = new Error('Timeout');

                    dispatch(apiDataFail(requestKey, undefined, error));
                    onError(undefined, error);
                    aborted = true;
                    resolve();
                }, timeout);
            }

            requestFunction(formatUrl(config.url, params), requestProperties).then(
                ({ response, body }: HandledResponse) => {
                    if (aborted) { return; }
                    clearTimeout(abortTimeout);

                    const beforeSuccess = config.beforeSuccess || globalConfig.beforeSuccess;
                    if (response.ok && beforeSuccess) {
                        const alteredResp = beforeSuccess({response, body});
                        response = alteredResp.response;
                        body = alteredResp.body;
                    }

                    if (response.ok) {
                        dispatch(apiDataSuccess(requestKey, config, response, body));

                        if (config.afterSuccess || globalConfig.afterSuccess) {
                            const updatedRequest = getApiDataRequest(getState().apiData, endpointKey, params);
                            if (config.afterSuccess && updatedRequest && config.afterSuccess(updatedRequest, dispatch, getState) === false) {
                                return;
                            }
                            if (globalConfig.afterSuccess && updatedRequest) {
                                globalConfig.afterSuccess(updatedRequest, dispatch, getState);
                            }
                        }
                    } else {
                        dispatch(apiDataFail(requestKey, response, body));
                        onError(response, body);
                    }
                    resolve();
                },
                (error: any) => {
                    if (aborted) { return; }
                    clearTimeout(abortTimeout);
                    dispatch(apiDataFail(requestKey, undefined, error));
                    onError(undefined, error);
                    resolve();
                }
            );
        });
    };

/**
 * Invalidates the result of a request, settings it's status back to 'ready'. Use for example after a POST, to invalidate
 * a GET list request, which might need to include the newly created entity.
 */
export const invalidateApiDataRequest = (endpointKey: string, params?: EndpointParams): InvalidateApiDataRequestAction => ({
    type: 'INVALIDATE_API_DATA_REQUEST',
    payload: {
        requestKey: getRequestKey(endpointKey, params)
    }
});

/**
 * Call this after you've re-hydrated the store when using redux-persist or any other method of persisting and restoring
 * the entire apiData state. This is needed to reset loading statuses.
 * @return {{type: string}}
 */
export const afterRehydrate = (): ApiDataAfterRehydrateAction => ({
    type: 'API_DATA_AFTER_REHYDRATE',
});

// selectors

/**
 * Selector to manually get a {@link ApiDataRequest}. This value is automatically bind when using {@link withApiData}.
 * This selector can be useful for tracking request status when a request is triggered manually, like a POST after a
 * button click.
 */
export const getApiDataRequest = (apiDataState: ApiDataState, endpointKey: string, params?: EndpointParams): ApiDataRequest | void =>
    apiDataState.requests[getRequestKey(endpointKey, params)];

/**
 * Get the de-normalized result data of an endpoint, or undefined if not (yet) available. This value is automatically
 * bind when using {@link withApiData}. This selector can be useful for getting response body values when a request is
 * triggered manually, like a POST after a button click.
 */
export const getResultData = (apiDataState: ApiDataState, endpointKey: string, params?: EndpointParams): Object | Array<Object> | void => {
    const config = apiDataState.endpointConfig[endpointKey];
    const request = getApiDataRequest(apiDataState, endpointKey, params);

    if (!config) {
        if (__DEV__) {
            console.warn(`apiData.getResult: configuration of endpoint ${endpointKey} not found.`);
        }
        return;
    }

    if (!request || !request.result) {
        return;
    }

    return request.result && (
        config.responseSchema
            ? denormalize(request.result, config.responseSchema, apiDataState.entities)
            : request.result
    );
};

/**
 * Selector for getting a single entity from normalized data.
 */
export const getEntity = (apiDataState: ApiDataState, schema: {[key: string]: any}, id: string | number): Object | void => {
    const entity = apiDataState.entities[schema.key] && apiDataState.entities[schema.key][id];
    return entity && denormalize(id, schema, apiDataState.entities);
};

const cacheExpired = (endpointConfig: ApiDataEndpointConfig, request: ApiDataRequest): boolean =>
    Date.now() - request.lastCall > (typeof endpointConfig.cacheDuration === 'number' ? endpointConfig.cacheDuration : Number.POSITIVE_INFINITY);

// other

/**
 * Use your own request function that calls the api and reads the body response. Make sure it implements the
 * {@link RequestHandler} interface.
 * @param requestHandler
 */
export const useRequestHandler = (requestHandler: RequestHandler) => {
    requestFunction = requestHandler;
};