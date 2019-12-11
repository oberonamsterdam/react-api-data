import { ActionCreator } from 'redux';
import { invalidateApiDataRequest, EndpointParams, performApiRequest, ApiDataBinding, purgeApiData } from '..';

export interface Actions {
    invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId?: string) => void;
    perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId?: string) => Promise<ApiDataBinding<any>>;
    purgeAll: () => void;
}

export const getActions: (dispatch: ActionCreator<any>) => Actions = (dispatch) => {
    return {
        invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId: string = '') => 
            dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId: string = '') => 
            dispatch(performApiRequest(endpointKey, params, body, instanceId)),
        purgeAll: () => dispatch(purgeApiData())
    };
};