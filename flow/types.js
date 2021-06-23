// @flow

import { type ActionCreator } from 'redux';
import { type State } from './reducer';


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
export interface DataRequest {
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

export interface GlobalConfig {
    setHeaders?: (defaultHeaders: any, state: any) => any;
    setRequestProperties?: (defaultProperties: any, state: any) => any;
    beforeSuccess?: (handledResponse: { response: Response, body: any }, beforeProps: ConfigBeforeProps) => { response: Response, body: any };
    afterSuccess?: (afterProps: ConfigAfterProps) => void;
    beforeFailed?: (handledResponse: { response: Response, body: any }, beforeProps: ConfigBeforeProps) => { response: Response, body: any };
    afterFailed?: (afterProps: ConfigAfterProps) => void;
    timeout?: number;
    autoTrigger?: boolean;
    /*
     * Enable React suspense for all endpoints
     */
    enableSuspense?: boolean;
    /*
     * Parse response as json, text, blob, formData or arrayBuffer, defaults to json
     */
    parseMethod?: ParseMethod;
}

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface EndpointConfig {
    url: string; // add parameters as :paramName, eg https://myapi.org/:myparam
    method: Method;
    cacheDuration?: number;
    responseSchema?: any;
    /*
    * @deprecated Use beforeSuccess instead
    */
    transformResponseBody?: (responseBody: any) => NormalizedData; // todo: this should transform before normalize or without normalize if no schema (so return any)
    /*
    * @deprecated Use beforeFailed instead
    */
    handleErrorResponse?: (responseBody: any, params: EndpointParams, requestBody: any, dispatch: ActionCreator<any>, getState: () => { apiData: State }, response?: Response) => boolean | void;
    /*
    * Edit the response before it gets handled by react-api-data.
    */
    beforeFailed?: (handledResponse: { response: Response, body: any }, beforeProps: ConfigBeforeProps) => { response: Response, body: any };
    /*
    * return false to not trigger global function
    */
    afterFailed?: (afterProps: ConfigAfterProps) => boolean | void;
    /*
    * Edit the response before it gets handled by react-api-data. Set response.ok to false to turn the success into a fail.
    */
    beforeSuccess?: (handledResponse: { response: Response, body: any }, beforeProps: ConfigBeforeProps) => { response: Response, body: any };
    /*
    * return false to not trigger global function
    */
    afterSuccess?: (afterProps: ConfigAfterProps) => boolean | void;
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
    /*
     * Enable React suspense for this endpoint
     */
    enableSuspense?: boolean;
    /*
     * Parse response as json, text, blob, formData or arrayBuffer, defaults to json
     */
    parseMethod?: ParseMethod;
}

export interface ConfigBeforeProps {
    endpointKey: string;
    request: DataRequest;
    requestBody?: any;
}

export interface ConfigAfterProps {
    endpointKey: string;
    request: DataRequest;
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
users: Binding<Array<User>>
}
 */
export interface Binding<T, F = any> {
    data?: T;
    dataFailed?: F,
    loading: boolean,
    request: DataRequest;
    perform: (
        params?: EndpointParams | void,
        body?: any
    ) => Promise<Binding<T, F>>;
    invalidateCache: () => Promise<void>;
    purge: () => Promise<void>;
    getInstance: (instanceId: string) => Binding<T, F>;
}

export type Actions = {
    perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId?: string) => Promise<Binding<any>>,
    invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId?: string) => void,
    purgeRequest: (endpointKey: string, params?: EndpointParams, instanceId?: string) => void,
    purgeAll: () => void,
};

export type Options = {
    instanceId?: string,
    isSSR?: boolean,
}

export type HookOptions = $Shape<EndpointConfig> | Options;

export type ParseMethod = 'json' | 'blob' | 'text' | 'arrayBuffer'  | 'formData';

export interface RequestConfig {
    parseMethod?: ParseMethod;
}

export interface HandledResponse {
    response: Response;
    body: any;
}

export type RequestHandler = (url: string, requestProperties?: RequestOptions, config?: RequestConfig) => Promise<HandledResponse>;
