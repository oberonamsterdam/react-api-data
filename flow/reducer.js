// @flow

import {
    type ApiDataEndpointConfig,
    type ApiDataGlobalConfig,
    type ApiDataRequest,
    type EndpointParams,
    type NetworkStatus,
    type NormalizedData
} from './';
import { type RequestHandler } from './request';
import { type ActionCreator } from 'redux';

declare interface Entities {
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

declare interface ConfigureApiDataAction {
    type: 'CONFIGURE_API_DATA';
    payload: {
        globalConfig: ApiDataGlobalConfig,
        endpointConfig: {
            [endpointKey: string]: ApiDataEndpointConfig
        }
    };
}

declare interface FetchApiDataAction {
    type: 'FETCH_API_DATA';
    payload: {
        requestKey: string,
        endpointKey: string,
        params?: EndpointParams
    };
}

declare interface ApiDataSuccessAction {
    type: 'API_DATA_SUCCESS';
    payload: {
        requestKey: string,
        response: Response,
        normalizedData?: NormalizedData,
        responseBody?: any
    };
}

declare interface ApiDataFailAction {
    type: 'API_DATA_FAIL';
    payload: {
        requestKey: string,
        response?: Response,
        errorBody: any
    };
}

declare interface InvalidateApiDataRequestAction {
    type: 'INVALIDATE_API_DATA_REQUEST';
    payload: {
        requestKey: string
    };
}

declare interface ClearApiData {
    type: 'CLEAR_API_DATA';
}

declare interface ApiDataAfterRehydrateAction {
    type: 'API_DATA_AFTER_REHYDRATE';
}

declare interface PurgeApiDataAction {
    type: 'PURGE_API_DATA';
}

export type Action =
    | ConfigureApiDataAction
    | FetchApiDataAction
    | ApiDataSuccessAction
    | ApiDataFailAction
    | InvalidateApiDataRequestAction
    | ClearApiData
    | ApiDataAfterRehydrateAction
    | PurgeApiDataAction;
declare export var recoverNetworkStatus: (
    networkStatus: NetworkStatus
) => NetworkStatus;
declare export var recoverNetworkStatuses: (requests: {
    [requestKey: string]: ApiDataRequest
}) => {
    [requestKey: string]: ApiDataRequest
};
declare export var configureApiData: (
    globalConfig: ApiDataGlobalConfig,
    endpointConfig: {
        [endpointKey: string]: ApiDataEndpointConfig
    }
) => ConfigureApiDataAction;
declare export var performApiRequest: (
    endpointKey: string,
    params?: EndpointParams | void,
    body?: any
) => (
    dispatch: ActionCreator<Action>,
    getState: () => {
        apiData: ApiDataState
    }
) => Promise<void>;
declare export var invalidateApiDataRequest: (
    endpointKey: string,
    params?: EndpointParams | void
) => InvalidateApiDataRequestAction;
declare export var afterRehydrate: () => ApiDataAfterRehydrateAction;
declare export var purgeApiData: () => PurgeApiDataAction;
declare export var getApiDataRequest: (
    apiDataState: ApiDataState,
    endpointKey: string,
    params?: EndpointParams | void
) => ApiDataRequest;
declare export var getResultData: (
    apiDataState: ApiDataState,
    endpointKey: string,
    params?: EndpointParams | void
) => any;
declare export var getEntity: (
    apiDataState: ApiDataState,
    schema: any,
    id: string | number
) => any;
declare export var useRequestHandler: (
    requestHandler: RequestHandler
) => void;

declare var _default: (state: ?ApiDataState, action: Action) => ApiDataState;
declare export default typeof _default;