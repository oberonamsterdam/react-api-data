// @flow

import withApiData from './withApiData';
import reducer, { type State } from './reducer';
import { configure } from './actions/configure';
import { performRequest } from './actions/performRequest';
import { invalidateRequest } from './actions/invalidateRequest';
import { afterRehydrate } from './actions/afterRehydrate';
import { purge } from './actions/purge';
import { setRequestHandler } from './actions/performRequest';
import { getRequest } from './selectors/getRequest';
import { getResultData } from './selectors/getResultData';
import { getEntity } from './selectors/getEntity';
import useApiData from './useApiData';
import useActions from './useActions';
export type {
    NetworkStatus,
    NormalizeResult,
    NormalizedData,
    EndpointParams,
    DataRequest,
    GlobalConfig,
    Method,
    EndpointConfig,
    ConfigBeforeProps,
    ConfigAfterProps,
    Binding,
    Actions,
    ParseMethod,
    RequestConfig,
} from './types';

export {
    withApiData,
    configure,
    performRequest,
    invalidateRequest,
    afterRehydrate,
    setRequestHandler,
    getRequest,
    getResultData,
    getEntity,
    reducer,
    purge,
    useApiData,
    useActions,
};

/**
 * @deprecated
 */
export var purgeApiData = purge;
/**
 * @deprecated
 */
export var getApiDataRequest = getRequest;
/**
 * @deprecated
 */
export var configureApiData = configure;
/**
 * @deprecated
 */
export var invalidateApiDataRequest = invalidateRequest;
/**
 * @deprecated
 */
export var performApiDataRequest = performRequest;
/**
 * @deprecated
 */
export var useRequestHandler = setRequestHandler;