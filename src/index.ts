import withApiData from './withApiData';
import { configure } from './actions/configure';
import { afterRehydrate } from './actions/afterRehydrate';
import { purgeAll } from './actions/purgeAll';
import { getRequest } from './selectors/getRequest';
import { getResultData } from './selectors/getResultData';
import { invalidateRequest } from './actions/invalidateRequest';
import { performApiRequest, useRequestHandler } from './actions/performRequest';
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
    Request,
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
    performApiRequest,
    getRequest,
    getResultData,
    getEntity,
    invalidateRequest,
    afterRehydrate,
    purgeAll,
    reducer,
    useRequestHandler,
    State,
    useApiData,
    useActions,
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
    Actions,
};

export const configureApiData = configure;
export const getApiDataRequest = getRequest;
export const purgeAllApiData = purgeAll;
export type ApiDataState = State;
export type ApiDataRequest = Request;
export type ApiDataGlobalConfig = GlobalConfig;
export type ApiDataEndpointConfig = EndpointConfig;
export type ApiDataConfigBeforeProps = ConfigBeforeProps;
export type ApiDataConfigAfterProps = ConfigAfterProps;
export type ApiDataBinding = Binding<any>;