// @flow

import withApiData from './withApiData';
import reducer, { configureApiData, performApiRequest, getApiDataRequest, getResultData, getEntity, invalidateApiDataRequest, useRequestHandler } from './reducer';

export {
    withApiData,
    configureApiData,
    performApiRequest,
    getApiDataRequest,
    getResultData,
    getEntity,
    invalidateApiDataRequest,
    reducer,
    useRequestHandler,
};

/**
 *
 */
export type NetworkStatus = 'ready' | 'loading' | 'failed' | 'success';

export type NormalizeResult = string | number | Array<string | number>
export type NormalizedData = {
    entities: {
        [type: string]: {
            [id: string | number]: Object,
        },
    },
    result: NormalizeResult,
}


/**
 * Type of the Api-data state
 */
export type { ApiDataState } from './reducer';

/**
 * Map parameter names to values.
 * @typedef {Object.<string,string|number>} EndpointParams
 */
export type EndpointParams = {[paramName: string]: string | number}

/**
 * Global configuration for all endpoints.
 */
export type ApiDataGlobalConfig = {
    handleErrorResponse?: (response?: Response, responseBody: any, endpointKey: string, params: EndpointParams, requestBody: any, dispatch: Function, getState: () => Object) => void,
    setHeaders?: (defaultHeaders: Object, state: Object) => Object,
    setRequestProperties?: (defaultProperties: Object, state: Object) => Object, // the fetch init param
    timeout?: number,
}

/**
 * Specification and configuration of an endpoint.
 * @typedef ApiDataEndpointConfig
 */
export type ApiDataEndpointConfig = {
    url: string,  // add parameters as :paramName, eg: https://myapi.org/myendpoint/:myparam
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    cacheDuration?: number, // milliseconds, infinite by default
    responseSchema?: Object | Array<Object>,
    transformResponseBody?: (responseBody: Object) => NormalizedData, // todo: this should transform before normalize or without normalize if no schema (so return any)

    /*
     * return false to not trigger global function
     */
    handleErrorResponse?: (response?: Response, responseBody: any, params: EndpointParams, requestBody: any, dispatch: Function, getState: () => Object) => boolean,

    /*
     * defaultHeaders will be the headers returned by the setHeaders function from the global config, if set
     */
    setHeaders?: (defaultHeaders: Object, state: Object) => Object,

    /*
     * defaultPropertie will be the properties returned by the setRequestproperties function from the global config, if set
     */
    setRequestProperties?: (defaultProperties: Object, state: Object) => Object,

    timeout?: number,
}

/**
 * Information about a request made to an endpoint.
 */
export type ApiDataRequest = {
    result?: any,
    networkStatus: NetworkStatus,
    lastCall: number,
    duration: number,
    response?: Response,
    errorBody?: any,
    endpointKey: string,
    params?: EndpointParams,
}

/**
 * The value that withApiData binds to the property of your component.
 * @example
 * type Props = {
 *   users: ApiDataBinding<Array<User>>
 * }
 */
export type ApiDataBinding<T> = {
    data?: T,
    request: ApiDataRequest,
}