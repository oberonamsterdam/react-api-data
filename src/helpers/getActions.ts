import { EndpointParams, Actions } from '../types';

import { invalidateRequest } from '..';
import { purgeAll } from '..';
import { performRequest } from '..';
import { ThunkDispatch } from 'redux-thunk';
import { Action, State } from '../reducer';
import { purgeRequest } from '../actions/purgeRequest';

type GetActions = (dispatch: ThunkDispatch<{ apiData: State }, void, Action>) => Actions;

export const getActions: GetActions = (dispatch: ThunkDispatch<{ apiData: State }, void, Action>) => {
    return {
        invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId: string = '') => 
            dispatch(invalidateRequest(endpointKey, params, instanceId)),
        perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId: string = '') => 
            dispatch(performRequest(endpointKey, params, body, instanceId)),
        purgeRequest: (endpointKey: string, params?: EndpointParams, instanceId: string = '') =>
            dispatch(purgeRequest(endpointKey, params, instanceId)),
        purgeAll: () => dispatch(purgeAll())
    };
};
