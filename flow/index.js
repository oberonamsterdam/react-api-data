// @flow

import withApiData from './withApiData';
import reducer, {
    type Action,
    afterRehydrate,
    type ApiDataState,
    configureApiData,
    getApiDataRequest,
    getEntity,
    getResultData,
    invalidateApiDataRequest,
    performApiRequest,
    useRequestHandler
} from './reducer';
import type { ActionCreator } from 'redux';

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
    useRequestHandler
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

export interface NormalizedData {
    entities: {
        [type: string]: {
            [id: string]: any
        }
    };
    result: NormalizeResult;
}

/**
 * Map parameter names to values.
 * @typedef  >} EndpointParams
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
}

export interface ApiDataGlobalConfig {
    handleErrorResponse?: (
        responseBody: any,
        endpointKey: string,
        params: EndpointParams,
        requestBody: any,
        dispatch: (action: Action) => void,
        getState: () => {
            apiData: ApiDataState
        },
        response?: Response
    ) => void;
    setHeaders?: (defaultHeaders: any, state: any) => any;
    setRequestProperties?: (defaultProperties: any, state: any) => any;
    beforeSuccess?: (handledResponse: {
        response: Response,
        body: any
    }) => {
        response: Response,
        body: any
    };
    afterSuccess?: (
        request: ApiDataRequest,
        dispatch: (action: Action) => void,
        getState: () => any
    ) => void;
    timeout?: number;
}

/**
 * Specification and configuration of an endpoint.
 * @typedef
 */
export interface ApiDataEndpointConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    cacheDuration?: number;
    responseSchema?: any | any[];
    transformResponseBody?: (responseBody: any) => NormalizedData;
    handleErrorResponse?: (
        responseBody: any,
        params: EndpointParams,
        requestBody: any,
        dispatch: ActionCreator<any>,
        getState: () => {
            apiData: ApiDataState
        },
        response?: Response
    ) => boolean | void;
    beforeSuccess?: (handledResponse: {
        response: Response,
        body: any
    }) => {
        response: Response,
        body: any
    };
    afterSuccess?: (
        request: ApiDataRequest,
        dispatch: (action: Action) => void,
        getState: () => any
    ) => boolean | void;
    setHeaders?: (defaultHeaders: any, state: any) => any;
    setRequestProperties?: (defaultProperties: any, state: any) => any;
    timeout?: number;
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
}