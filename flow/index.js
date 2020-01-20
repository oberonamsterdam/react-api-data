// @flow

import withApiData from './withApiData';
import reducer, { type ApiDataState } from './reducer';
import { configureApiData } from './actions/configureApiData';
import { performApiRequest } from './actions/performApiDataRequest';
import { invalidateApiDataRequest } from './actions/invalidateApiDataRequest';
import { afterRehydrate } from './actions/afterRehydrate';
import { purgeApiData } from './actions/purgeApiData';
import { useRequestHandler } from './actions/performApiDataRequest';
import { getApiDataRequest } from './selectors/getApiDataRequest';
import { getResultData } from './selectors/getResultData';
import { getEntity } from './selectors/getEntity';
export type {
    NetworkStatus,
    NormalizeResult,
    NormalizedData,
    EndpointParams,
    ApiDataRequest,
    ApiDataGlobalConfig,
    Method,
    ApiDataEndpointConfig,
    ApiDataConfigBeforeProps,
    ApiDataConfigAfterProps,
    ApiDataBinding,
} from './types';

export {
    withApiData,
    configureApiData,
    performApiRequest,
    invalidateApiDataRequest,
    afterRehydrate,
    useRequestHandler,
    getApiDataRequest,
    getResultData,
    getEntity,
    reducer,
    purgeApiData,
};
