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
};

export const configureApiData = configure;
export const getApiDataRequest = getRequest;
export const purgeAllApiData = purgeAll;
export const invalidateApiDataRequest = invalidateRequest;
export const performApiRequest = performRequest;
export const useRequestHandler = setRequestHandler;
export type ApiDataState = State;
export type ApiDataRequest = DataRequest;
export type ApiDataGlobalConfig = GlobalConfig;
export type ApiDataEndpointConfig = EndpointConfig;
export type ApiDataConfigBeforeProps = ConfigBeforeProps;
export type ApiDataConfigAfterProps = ConfigAfterProps;
export interface ApiDataBinding<T> extends Binding<T, any> {}
