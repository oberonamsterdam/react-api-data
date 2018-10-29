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
import { Action } from './actions/index';
import {
    ApiDataEndpointConfig,
    ApiDataGlobalConfig,
    ApiDataRequest,
    NetworkStatus,
} from './index';

// state def

interface Entities {
    [type: string]: {
        [id: string]: any
    };
}

export interface ApiDataState {
    globalConfig: ApiDataGlobalConfig;
    endpointConfig: {
        [endpointKey: string]: ApiDataEndpointConfig
    };
    requests: {
        [requestKey: string]: ApiDataRequest
    };
    entities: Entities;
}

const defaultState = {
    globalConfig: {},
    endpointConfig: {},
    requests: {},
    entities: {}
};

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
                        params: action.payload.params
                    }
                }
            };
        case 'API_DATA_SUCCESS': {
            const request = state.requests[action.payload.requestKey];

            if (!request) {
                // for security reasons reject the response if the request has been removed since the call was initiated.
                // this might be due to a logout between start and end of call
                return state;
            }

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
                        errorBody: undefined
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

            if (!request) {
                return state;
            }

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
                        result: undefined
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
        case 'PURGE_API_DATA': {
            return {
                ...defaultState,
                endpointConfig: state.endpointConfig,
                globalConfig: state.globalConfig,
            };
        }
        case 'API_DATA_AFTER_REHYDRATE':
            return {
                ...state,
                requests: recoverNetworkStatuses(state.requests)
            };
        default:
            return state;
    }
};

// merges newEntities into entities
const addEntities = (entities: Entities, newEntities: Entities): Entities => Object.keys(newEntities).reduce(
    (result, entityType) => ({
        ...result,
        [entityType]: {
            ...(entities[entityType] || {}),
            ...newEntities[entityType]
        }
    }),
    { ...entities }
);

// resets a networkStatus to ready if it was loading. Use when recovering state from storage to prevent loading states
// when no calls are running.
export const recoverNetworkStatus = (networkStatus: NetworkStatus): NetworkStatus =>
    networkStatus === 'loading' ? 'ready' : networkStatus;

export const recoverNetworkStatuses = (requests: { [requestKey: string]: ApiDataRequest }): { [requestKey: string]: ApiDataRequest } => ({
    ...(Object.keys(requests).reduce(
            (result, key) => ({
                ...result,
                [key]: {
                    ...requests[key],
                    networkStatus: recoverNetworkStatus(requests[key].networkStatus)
                }
            }),
            {})
    )
});
