import { ApiDataEndpointConfig, ApiDataGlobalConfig, EndpointParams, NormalizedData } from '../index';

export interface ConfigureApiDataAction {
    type: 'CONFIGURE_API_DATA';
    payload: {
        globalConfig: ApiDataGlobalConfig,
        endpointConfig: {
            [endpointKey: string]: ApiDataEndpointConfig,
        }
    };
}

export interface FetchApiDataAction {
    type: 'FETCH_API_DATA';
    payload: {
        requestKey: string,
        endpointKey: string,
        params?: EndpointParams,
    };
}

export interface ApiDataSuccessAction {
    type: 'API_DATA_SUCCESS';
    payload: {
        requestKey: string,
        response: Response,
        normalizedData?: NormalizedData,
        responseBody?: any,
    };
}

export interface ApiDataFailAction {
    type: 'API_DATA_FAIL';
    payload: {
        requestKey: string,
        response?: Response,
        errorBody: any,
    };
}

export interface InvalidateApiDataRequestAction {
    type: 'INVALIDATE_API_DATA_REQUEST';
    payload: {
        requestKey: string
    };
}

export interface ClearApiData {
    type: 'CLEAR_API_DATA';
}

export interface ApiDataAfterRehydrateAction {
    type: 'API_DATA_AFTER_REHYDRATE';
}

export interface PurgeApiDataAction {
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