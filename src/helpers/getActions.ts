import { EndpointParams, Actions } from '../types';
import { invalidateApiDataRequest } from '../actions/invalidateApiDataRequest';
import { purgeApiData } from '../actions/purgeApiData';
import { performApiRequest } from '../actions/performApiDataRequest';
import { ThunkDispatch } from 'redux-thunk';
import { Action, ApiDataState } from '../reducer';

type GetActions = (dispatch: ThunkDispatch<{ apiData: ApiDataState }, void, Action>) => Actions;

export const getActions: GetActions = (dispatch: ThunkDispatch<{ apiData: ApiDataState }, void, Action>) => {
    return {
        invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId: string = '') => 
            dispatch(invalidateApiDataRequest(endpointKey, params, instanceId)),
        perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId: string = '') => 
            dispatch(performApiRequest(endpointKey, params, body, instanceId)),
        purgeAll: () => dispatch(purgeApiData())
    };
};