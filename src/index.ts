import withApiData from './withApiData';
import { configureApiData } from './actions/configureApiData';
import { afterRehydrate } from './actions/afterRehydrate';
import { purgeApiData } from './actions/purgeApiData';
import { getApiDataRequest } from './selectors/getApiDataRequest';
import { getResultData } from './selectors/getResultData';
import { invalidateApiDataRequest } from './actions/invalidateApiDataRequest';
import { performApiRequest, useRequestHandler } from './actions/performApiDataRequest';
import { getEntity } from './selectors/getEntity';
import { Action } from './reducer';
import { ActionCreator } from 'redux';
import reducer from './reducer';
import { ApiDataState } from './reducer';

export {
    withApiData,
    configureApiData,
    performApiRequest,
    getApiDataRequest,
    getResultData,
    getEntity,
    invalidateApiDataRequest,
    afterRehydrate,
    purgeApiData,
    reducer,
    useRequestHandler,
    ApiDataState,
};

export type NetworkStatus = 'ready' | 'loading' | 'failed' | 'success';

export type NormalizeResult = string | number | Array<string | number>;

export interface NormalizedData {
    entities: {
        [type: string]: {
            [id: string]: any,
        }
    };
    result: NormalizeResult;
}

/**
 * Map parameter names to values.
 */
export interface EndpointParams {
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
    // todo: add requestBody for retriggering post calls or logging errors etc
}

export interface ApiDataGlobalConfig {
    handleErrorResponse?: (responseBody: any, endpointKey: string, params: EndpointParams, requestBody: any, dispatch: (action: Action) => void, getState: () => { apiData: ApiDataState }, response?: Response) => void;
    setHeaders?: (defaultHeaders: any, state: any) => any;
    setRequestProperties?: (defaultProperties: any, state: any) => any;
    beforeSuccess?: (handledResponse: { response: Response, body: any }) => { response: Response, body: any };
    afterSuccess?: (request: ApiDataRequest | undefined, dispatch: (action: Action) => void, getState: () => any) => void;
    beforeError?: (handledResponse: { response: Response, body: any }) => { response: Response, body: any };
    afterError?: (request: ApiDataRequest | undefined, dispatch: (action: Action) => void, getState: () => any) => void;
    // todo: add afterFail and deprecate handleErrorResponse
    timeout?: number;
}

/**
 * Specification and configuration of an endpoint.
 */
export interface ApiDataEndpointConfig {
    url: string; // add parameters as :paramName, eg https://myapi.org/:myparam
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    cacheDuration?: number;
    responseSchema?: any | any[];
    /*
    * @deprecated Use beforeSuccess instead
    */
    transformResponseBody?: (responseBody: any) => NormalizedData; // todo: this should transform before normalize or without normalize if no schema (so return any)
    /*
    * @deprecated Use beforeError instead
    */
    handleErrorResponse?: (responseBody: any, params: EndpointParams, requestBody: any, dispatch: ActionCreator<any>, getState: () => { apiData: ApiDataState }, response?: Response) => boolean | void;
    /*
    * Edit the response before it gets handled by react-api-data.
    */
    beforeError?: (handledResponse: { response: Response, body: any }) => { response: Response, body: any };
    /*
    * return false to not trigger global function
    */
    afterError?: (request: ApiDataRequest | undefined, dispatch: (action: Action) => void, getState: () => any) => boolean | void;
    /*
    * Edit the response before it gets handled by react-api-data. Set response.ok to false to turn the success into a fail.
    */
    beforeSuccess?: (handledResponse: { response: Response, body: any }) => { response: Response, body: any };
    /*
    * return false to not trigger global function
    */
    afterSuccess?: (request: ApiDataRequest | undefined, dispatch: (action: Action) => void, getState: () => any) => boolean | void;
    /*
    * defaultHeaders will be the headers returned by the setHeaders function from the global config, if set
    */
    setHeaders?: (defaultHeaders: any, state: any) => any;
    /*
    * defaultPropertie will be the properties returned by the setRequestproperties function from the global config, if set
    */
    setRequestProperties?: (defaultProperties: any, state: any) => any;

    timeout?: number;
}

/**
 * The value that withApiData binds to the property of your component.
 * @example
 * type Props = {
 *   users: ApiDataBinding<Array<User>>
 * }
 */
export interface ApiDataBinding<T> {
    data?: T;
    request: ApiDataRequest;
}