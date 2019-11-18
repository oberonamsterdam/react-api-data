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
import { type ActionCreator } from 'redux';
import { type Actions } from './helpers/getActions';

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

export type NetworkStatus =
    | 'ready'
    | 'loading'
    | 'failed'
    | 'success';
export type NormalizeResult =
    | string
    | number
    | Array<string | number>;

export type NormalizedData = {
    entities: {
        [type: string]: {
            [id: string]: any
        }
    };
    result: NormalizeResult;
}

/**
 * Map parameter names to values.
 */
export type EndpointParams = {
    [paramName: string]: string | number;
}

/**
 * Information about a request made to an endpoint.
 */
export interface ApiDataRequest {
    result?: any;
    networkStatus: NetworkStatus;
    lastCall: number;
    duration: number;
    response?: Response;
    errorBody?: any;
    endpointKey: string;
    params?: EndpointParams;
    url: string;
}

export interface ApiDataGlobalConfig {
    setHeaders?: (defaultHeaders: any, state: any) => any;
    setRequestProperties?: (defaultProperties: any, state: any) => any;
    beforeSuccess?: (handledResponse: { response: Response, body: any }, beforeProps: ApiDataConfigBeforeProps) => { response: Response, body: any };
    afterSuccess?: (afterProps: ApiDataConfigAfterProps) => void;
    beforeFailed?: (handledResponse: { response: Response, body: any }, beforeProps: ApiDataConfigBeforeProps) => { response: Response, body: any };
    afterFailed?: (afterProps: ApiDataConfigAfterProps) => void;
    timeout?: number;
    autoTrigger?: boolean;
}

export interface ApiDataEndpointConfig {
    url: string; // add parameters as :paramName, eg https://myapi.org/:myparam
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    cacheDuration?: number;
    responseSchema?: any;
    /*
    * @deprecated Use beforeSuccess instead
    */
    transformResponseBody?: (responseBody: any) => NormalizedData; // todo: this should transform before normalize or without normalize if no schema (so return any)
    /*
    * @deprecated Use beforeFailed instead
    */
    handleErrorResponse?: (responseBody: any, params: EndpointParams, requestBody: any, dispatch: ActionCreator<any>, getState: () => { apiData: ApiDataState }, response?: Response) => boolean | void;
    /*
    * Edit the response before it gets handled by react-api-data.
    */
    beforeFailed?: (handledResponse: { response: Response, body: any }, beforeProps: ApiDataConfigBeforeProps) => { response: Response, body: any };
    /*
    * return false to not trigger global function
    */
    afterFailed?: (afterProps: ApiDataConfigAfterProps) => boolean | void;
    /*
    * Edit the response before it gets handled by react-api-data. Set response.ok to false to turn the success into a fail.
    */
    beforeSuccess?: (handledResponse: { response: Response, body: any }, beforeProps: ApiDataConfigBeforeProps) => { response: Response, body: any };
    /*
    * return false to not trigger global function
    */
    afterSuccess?: (afterProps: ApiDataConfigAfterProps) => boolean | void;
    /*
    * defaultHeaders will be the headers returned by the setHeaders function from the global config, if set
    */
    setHeaders?: (defaultHeaders: any, state: any) => any;
    /*
    * defaultPropertie will be the properties returned by the setRequestproperties function from the global config, if set
    */
    setRequestProperties?: (defaultProperties: any, state: any) => any;

    timeout?: number;
    autoTrigger?: boolean;
}

export interface ApiDataConfigBeforeProps {
    endpointKey: string;
    request: ApiDataRequest;
    requestBody?: any;
}

export interface ApiDataConfigAfterProps {
    endpointKey: string;
    request: ApiDataRequest;
    requestBody?: any;
    resultData: any;
    // redux functions
    dispatch: Function;
    getState: Function;
    actions: Actions;
}

/**
 * The value that withApiData binds to the property of your component.
 * @example  type Props = {
users: ApiDataBinding<Array<User>>
}
 */
export interface ApiDataBinding<T> {
    data?: T;
    request: ApiDataRequest;
    perform: (
        params?: EndpointParams | void,
        body?: any
    ) => Promise<ApiDataBinding<T>>;
    invalidateCache: () => Promise<void>;
    getInstance: (instanceId: string) => ApiDataBinding<T>;
}