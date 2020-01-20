import { ActionCreator } from 'redux';
import { invalidateApiDataRequest, EndpointParams, performApiRequest, ApiDataBinding } from '..';
import { purgeRequest } from '../actions/purgeRequest';
import { purgeAllApiData } from '../actions/purgeAllApiData';
import { invalidateApiRequest } from '../actions/invalidateApiDataRequest';

export interface Actions {
    invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId?: string) => void;
    perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId?: string) => Promise<ApiDataBinding<any>>;
    purgeRequest: (endpointKey: string, params?: EndpointParams, instanceId?: string) => void;
    purgeAll: () => void;
}

export const getActions: (dispatch: ActionCreator<any>) => Actions = (dispatch) => {
    return {
        invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId: string = '') => 
            dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId: string = '') => 
            dispatch(performApiRequest(endpointKey, params, body, instanceId)),
        purgeRequest: (endpointKey: string, params?: EndpointParams, instanceId: string = '') => dispatch(purgeRequest(endpointKey, params, instanceId)),
        purgeAll: () => dispatch(purgeAllApiData())
    };
};