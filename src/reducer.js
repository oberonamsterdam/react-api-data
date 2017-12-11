// @flow
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
import type { HandledResponse } from './request';
import { normalize, denormalize } from 'normalizr';
import type {
    ApiDataEndpointConfig, ApiDataGlobalConfig, ApiDataRequest, EndpointParams,
    NormalizedData,
} from './index';

const __DEV__ = process.env.NODE_ENV === 'development';

// state def

type Entities = {
    [type: string]: {
        [id: string | number]: Object
    }
}

type ApiDataState = {
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

type ConfigureApiDataAction = {
    type: 'CONFIGURE_API_DATA',
    payload: {
        globalConfig: ApiDataGlobalConfig,
        endpointConfig: {
            [endpointKey: string]: ApiDataEndpointConfig,
        }
    }
}

type FetchApiDataAction = {
    type: 'FETCH_API_DATA',
    payload: {
        requestKey: string,
    },
}

type ApiDataSuccessAction = {
    type: 'API_DATA_SUCCESS',
    payload: {
        requestKey: string,
        response: Response,
        normalizedData?: NormalizedData,
        responseBody?: any,
    }
}

type ApiDataFailAction = {
    type: 'API_DATA_FAIL',
    payload: {
        requestKey: string,
        response?: Response,
        errorBody: any,
    }
}

type InvalidateApiDataRequestAction = {
    type: 'INVALIDATE_API_DATA_REQUEST',
    payload: {
        requestKey: string
    }
}

export type Action = ConfigureApiDataAction | FetchApiDataAction | ApiDataSuccessAction | ApiDataFailAction

// reducer

export default (state: ApiDataState = defaultState, action: Action) => {
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
                        lastCall: Date.now()
                    }
                }
            };
        case 'API_DATA_SUCCESS':
            return {
                ...state,
                requests: {
                    ...state.requests,
                    [action.payload.requestKey]: {
                        networkStatus: 'success',
                        lastCall: state.requests[action.payload.requestKey].lastCall,
                        result: action.payload.normalizedData ? action.payload.normalizedData.result : action.payload.responseBody,
                        response: action.payload.response
                    }
                },
                entities: {
                    ...(action.payload.normalizedData
                            ? addEntities(state.entities, action.payload.normalizedData.entities)
                            : state.entities
                    )
                }
            };
        case 'API_DATA_FAIL':
            return {
                ...state,
                requests: {
                    ...state.requests,
                    [action.payload.requestKey]: {
                        networkStatus: 'failed',
                        lastCall: state.requests[action.payload.requestKey].lastCall,
                        response: action.payload.response,
                        errorBody: action.payload.errorBody
                    }
                }
            };
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

const getRequestKey = (endpointKey: string, params?: EndpointParams = {}): string =>
    endpointKey + '/' + Object.keys(params).sort().map(param => param + '=' + params[param]).join('&');

// action creators

/**
 *
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

const apiDataFail = (requestKey: string, response?: Response, errorBody: any): ApiDataFailAction => ({
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
    const id = (val, state) => val;
    const fnA = endpointFn || id;
    const fnB = globalFunction || id;

    return (value: any, state: Object) => fnA(fnB(value, state));
};

export const performApiRequest = (endpointKey: string, params?: EndpointParams, body?: any) =>
    (dispatch: Function, getState: () => Object) => {
        const state = getState();
        const config = state.apiData.endpointConfig[endpointKey];
        const globalConfig = state.apiData.globalConfig;

        if (!config) {
            if (__DEV__) {
                console.error(`apiData.performApiRequest: no config with key ${endpointKey} found!`);
            }
            return;
        }

        const apiDataRequest = getApiDataRequest(state.apiData, endpointKey, params);

        // don't re-trigger calls when already loading and don't re-trigger succeeded GET calls
        if (apiDataRequest && (
            apiDataRequest.networkStatus === 'loading' ||
            (config.method === 'GET' && apiDataRequest.networkStatus === 'success' && !cacheExpired(config, apiDataRequest))
        )) {
            return;
        }

        const requestKey = getRequestKey(endpointKey, params || {});

        dispatch(({
            type: 'FETCH_API_DATA',
            payload: {requestKey}
        }: FetchApiDataAction));

        const defaultRequestProperties = {body, headers: {}, method: config.method};
        const requestProperties = composeConfigFn(config.setRequestProperties, globalConfig.setRequestProperties)(defaultRequestProperties, state);
        requestProperties.headers = composeConfigFn(config.setHeaders, globalConfig.setHeaders)(defaultRequestProperties.headers, state);

        const onError = (response, body) => {
            if (typeof config.handleErrorResponse === 'function' && config.handleErrorResponse(response, body, dispatch) === false) {
                return;
            }

            if (typeof globalConfig.handleErrorResponse === 'function') {
                globalConfig.handleErrorResponse(response, body, dispatch);
            }
        };

        return request(formatUrl(config.url, params), requestProperties).then(
            (response: HandledResponse) => {
                if (response.response.ok) {
                    dispatch(apiDataSuccess(requestKey, config, response.response, response.body));
                } else {
                    dispatch(apiDataFail(requestKey, response.response, response.body));
                    onError(response.response, response.body);
                }
            },
            (error: any) => {
                dispatch(apiDataFail(requestKey, undefined, error));
                onError(undefined, error);
            }
        );
    };

// Invalidates the result of a request, settings it's status back to 'ready'. Use for example after a POST, to invalidate
// a GET list request, which might need to include the newly created entity.
export const invalidateApiDataRequest = (endpointKey: string, params?: EndpointParams): InvalidateApiDataRequestAction => ({
    type: 'INVALIDATE_API_DATA_REQUEST',
    payload: {
        requestKey: getRequestKey(endpointKey, params)
    }
});

// selectors

export const getApiDataRequest = (apiDataState: ApiDataState, endpointKey: string, params?: EndpointParams): ApiDataRequest | void =>
    apiDataState.requests[getRequestKey(endpointKey, params)];

// Get the de-normalized result data of an endpoint, or undefined if not (yet) available
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

export const getEntity = (apiDataState: ApiDataState, schema: Object, id: string | number): Object | void => {
    const entity = apiDataState.entities[schema.key] && apiDataState.entities[schema.key][id];
    return entity && denormalize(id, schema, apiDataState.entities);
};

const cacheExpired = (endpointConfig: ApiDataEndpointConfig, request: ApiDataRequest): boolean =>
    Date.now() - request.lastCall > (typeof endpointConfig.cacheDuration === 'number' ? endpointConfig.cacheDuration : Number.POSITIVE_INFINITY);
