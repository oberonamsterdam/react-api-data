// @flow

import {
    type ApiDataEndpointConfig,
    type ApiDataGlobalConfig,
    type ApiDataRequest,
    type EndpointParams,
    type NetworkStatus
} from './';
import type { PurgeApiDataAction } from './actions/purgeApiData';
import type { ApiDataAfterRehydrateAction } from './actions/afterRehydrate';
import type { InvalidateApiDataRequestAction } from './actions/invalidateApiDataRequest';
import type { ApiDataFailAction } from './actions/apiDataFail';
import type { ApiDataSuccessAction } from './actions/apiDataSuccess';
import type { ConfigureApiDataAction } from './actions/configureApiData';

export type Entities = {
    [type: string]: {
        [id: string]: any
    };
}

export type ApiDataState = {
    globalConfig: ApiDataGlobalConfig;
    endpointConfig: {
        [endpointKey: string]: ApiDataEndpointConfig
    };
    requests: {
        [requestKey: string]: ApiDataRequest
    };
    entities: Entities;
}

export interface FetchApiDataAction {
    type: 'FETCH_API_DATA';
    payload: {
        requestKey: string,
        endpointKey: string,
        params?: EndpointParams,
        url: string,
    };
}

export interface ClearApiData {
    type: 'CLEAR_API_DATA';
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

declare var _default: (state: ?ApiDataState, action: Action) => ApiDataState;
declare export default typeof _default;