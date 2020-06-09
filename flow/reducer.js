// @flow

import {
    type EndpointConfig,
    type GlobalConfig,
    type DataRequest,
    type EndpointParams,
    type NetworkStatus
} from './';
import type { PurgeAction } from './actions/purge';
import type { AfterRehydrateAction } from './actions/afterRehydrate';
import type { InvalidateRequestAction } from './actions/invalidateRequest';
import type { FailAction } from './actions/fail';
import type { SuccessAction } from './actions/success';
import type { ConfigureAction } from './actions/configure';

export type Entities = {
    [type: string]: {
        [id: string]: any
    };
}

export type State = {
    globalConfig: GlobalConfig;
    endpointConfig: {
        [endpointKey: string]: EndpointConfig
    };
    requests: {
        [requestKey: string]: DataRequest
    };
    entities: Entities;
}

export interface FetchAction {
    type: 'FETCH_API_DATA';
    payload: {
        requestKey: string,
        endpointKey: string,
        params?: EndpointParams,
        url: string,
    };
}

export interface Clear {
    type: 'CLEAR_API_DATA';
}

export type Action =
    | ConfigureAction
    | FetchAction
    | SuccessAction
    | FailAction
    | InvalidateRequestAction
    | Clear
    | AfterRehydrateAction
    | PurgeAction;
declare export var recoverNetworkStatus: (
    networkStatus: NetworkStatus
) => NetworkStatus;
declare export var recoverNetworkStatuses: (requests: {
    [requestKey: string]: DataRequest
}) => {
    [requestKey: string]: DataRequest
};

declare var _default: (state: ?State, action: Action) => State;
declare export default typeof _default;