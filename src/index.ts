import withApiData from './withApiData';
import { configure } from './actions/configure';
import { afterRehydrate } from './actions/afterRehydrate';
import { purgeAll } from './actions/purgeAll';
import { getRequest } from './selectors/getRequest';
import { getResultData } from './selectors/getResultData';
import { invalidateRequest } from './actions/invalidateRequest';
import { performRequest, setRequestHandler } from './actions/performRequest';
import getDataFromTree from './getDataFromTree';
import { getEntity } from './selectors/getEntity';
import reducer from './reducer';
import { State } from './reducer';
import useApiData from './useApiData';
import useActions from './useActions';
import {
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
    getRequest,
    getResultData,
    getEntity,
    getDataFromTree,
    invalidateRequest,
    afterRehydrate,
    purgeAll,
    reducer,
    setRequestHandler,
    State,
    useApiData,
    useActions,
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
};

/**
 * @deprecated
 */
export const configureApiData = configure;
/**
 * @deprecated
 */
export const getApiDataRequest = getRequest;
/**
 * @deprecated
 */
export const purgeAllApiData = purgeAll;
/**
 * @deprecated
 */
export const invalidateApiDataRequest = invalidateRequest;
/**
 * @deprecated
 */
export const performApiRequest = performRequest;
/**
 * @deprecated
 */
export const useRequestHandler = setRequestHandler;
/**
 * @deprecated
 */
export type ApiDataState = State;
/**
 * @deprecated
 */
export type ApiDataRequest = DataRequest;
/**
 * @deprecated
 */
export type ApiDataGlobalConfig = GlobalConfig;
/**
 * @deprecated
 */
export type ApiDataEndpointConfig = EndpointConfig;
/**
 * @deprecated
 */
export type ApiDataConfigBeforeProps = ConfigBeforeProps;
/**
 * @deprecated
 */
export type ApiDataConfigAfterProps = ConfigAfterProps;
/**
 * @deprecated
 */
export interface ApiDataBinding<T> extends Binding<T, any> {}
