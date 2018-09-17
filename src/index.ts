import withApiData from './withApiData';
import reducer, {
    configureApiData,
    performApiRequest,
    getApiDataRequest,
    getResultData,
    getEntity,
    invalidateApiDataRequest,
    afterRehydrate,
    useRequestHandler
} from './reducer';
import { Schema } from 'normalizr';

export {
    withApiData,
    configureApiData,
    performApiRequest,
    getApiDataRequest,
    getResultData,
    getEntity,
    invalidateApiDataRequest,
    afterRehydrate,
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
            [id: string]: Object,
            [idNum: number]: Object,
        },
    },
    result: NormalizeResult,
}

/**
 * Type of the Api-data state
 */
export { ApiDataState } from './reducer';

/**
 * Map parameter names to values.
 * @typedef {Object.<string,string|number>} EndpointParams
 */
export type EndpointParams = {[paramName: string]: string | number}

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
    // todo: add requestBody for retriggering post calls or logging errors etc
}

/**
 * Global configuration for all endpoints.
 */
export interface ApiDataGlobalConfig {
    handleErrorResponse?: (response: Response, responseBody: any, endpointKey: string, params: EndpointParams, requestBody: any, dispatch: Function, getState: () => Object) => void,
    setHeaders?: (defaultHeaders: Object, state: Object) => Object,
    setRequestProperties?: (defaultProperties: Object, state: Object) => Object, // the fetch init param
    beforeSuccess?: (handledResponse: {response: Response, body: any}) => {response: Response, body: any},
    afterSuccess?: (request: ApiDataRequest, dispatch: Function, getState: () => Object) => void,
    // todo: add afterFail and deprecate handleErrorResponse
    timeout?: number
}

export type HandleErrorResponse = (response: Response, responseBody: any, params: EndpointParams, requestBody: any, dispatch: Function, getState: () => Object) => boolean | void

/**
 * Specification and configuration of an endpoint.
 * @typedef ApiDataEndpointConfig
 */
export interface ApiDataEndpointConfig {
    url: string,  // add parameters as :paramName, eg: https://myapi.org/myendpoint/:myparam
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    cacheDuration?: number, // milliseconds, infinite by default
    responseSchema?: Schema,
    /**
     * @deprecated Use beforeSuccess instead
     */
    transformResponseBody?: (responseBody: Object) => NormalizedData, // todo: this should transform before normalize or without normalize if no schema (so return any)

    /*
     * return false to not trigger global function
     */
    handleErrorResponse?: HandleErrorResponse,

    /*
     * Edit the response before it gets handled by react-api-data. Set response.ok to false to turn the success into a fail.
     */
    beforeSuccess?: (handledResponse: {response: Response, body: any}) => {response: Response, body: any},
    /*
     * return false to not trigger global function
     */
    afterSuccess?: (request: ApiDataRequest, dispatch: Function, getState: () => Object) => boolean | void,

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