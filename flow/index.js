// @flow

import withApiData from './withApiData';
import reducer, { type State } from './reducer';
import { configure } from './actions/configure';
import { performApiRequest } from './actions/performRequest';
import { invalidateRequest } from './actions/invalidateRequest';
import { afterRehydrate } from './actions/afterRehydrate';
import { purge } from './actions/purge';
import { useRequestHandler } from './actions/performRequest';
import { getRequest } from './selectors/getRequest';
import { getResultData } from './selectors/getResultData';
import { getEntity } from './selectors/getEntity';
export type {
    NetworkStatus,
    NormalizeResult,
    NormalizedData,
    EndpointParams,
    Request,
    GlobalConfig,
    Method,
    EndpointConfig,
    ConfigBeforeProps,
    ConfigAfterProps,
    Binding,
} from './types';

export {
    withApiData,
    configure,
    performApiRequest,
    invalidateRequest,
    afterRehydrate,
    useRequestHandler,
    getRequest,
    getResultData,
    getEntity,
    reducer,
    purge,
};
