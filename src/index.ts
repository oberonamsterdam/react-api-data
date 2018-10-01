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

export type NetworkStatus = 'ready' | 'loading' | 'failed' | 'success';

export type NormalizeResult = string | number | Array<string | number>;

export interface NormalizedData {
    entities: {
        [type: string]: {
            [id: string]: any,
        }
    }
    result: NormalizeResult,
}

/**
 * Type of the Api-data state
 * TODO: controleer of dit werkt op deze manier
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

export interface ApiDataGlobalConfig {
    handleErrorResponse?: (responseBody: any, endpointKey: string, params: EndpointParams, requestBody: any, dispatch: Function, getState: () => any, response?: Response) => void,
    setHeaders?: (defaultHeaders: any, state: any) => any,
    setRequestProperties?: (defaultProperties: any, state: any) => any,
    beforeSuccess?: ({response: Response, body: any}),
    afterSuccess?: (request: ApiDataRequest, dispatch: Function, getState: () => any) => void,
    // todo: add afterFail and deprecate handleErrorResponse
    timeout?: number,
}

/**
 * Specification and configuration of an endpoint.
 * @typedef ApiDataEndpointConfig
 */

export interface ApiDataEndpointConfig {
    url: string, // add parameters as :paramName, eg https://myapi.org/:myparam
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    cacheDuration?: number,
    responseSchema?: any | Array<any>,
    /*
    * @deprecated Use beforeSuccess instead
    */
    transformResponseBody?: (responseBody: any) => NormalizedData, // todo: this should transform before normalize or without normalize if no schema (so return any)
    /*
    * return false to not trigger global function
    */
    handleErrorResponse?: (responseBody: any, params: EndpointParams, requestBody: any, dispatch: Function, getState: () => any, response?: Response) => boolean | void,
    /*
    * Edit the response before it gets handled by react-api-data. Set response.ok to false to turn the success into a fail.
    */
    beforeSuccess?: (handledResponse: {response: Response, body: any}) => {response: Response, body: any},
    /*
    * return false to not trigger global function
    */
    afterSuccess?: (request: ApiDataRequest, dispatch: Function, getState: () => any) => boolean | void,
    /*
    * defaultHeaders will be the headers returned by the setHeaders function from the global config, if set
    */
    setHeaders?: (defaultHeaders: any, state: any) => any,
    /*
    * defaultPropertie will be the properties returned by the setRequestproperties function from the global config, if set
    */
    setRequestProperties?: (defaultProperties: any, state: any) => any,

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