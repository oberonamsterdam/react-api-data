import { EndpointParams, Actions } from '../types';
import { invalidateRequest } from '../actions/invalidateRequest';
import { purge } from '../actions/purge';
import { performApiRequest } from '../actions/performRequest';
import { ThunkDispatch } from 'redux-thunk';
import { Action, State } from '../reducer';

type GetActions = (dispatch: ThunkDispatch<{ apiData: State }, void, Action>) => Actions;

export const getActions: GetActions = (dispatch: ThunkDispatch<{ apiData: State }, void, Action>) => {
    return {
        invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId: string = '') => 
            dispatch(invalidateRequest(endpointKey, params, instanceId)),
        perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId: string = '') => 
            dispatch(performApiRequest(endpointKey, params, body, instanceId)),
        purgeAll: () => dispatch(purge())
    };
};