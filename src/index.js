// @flow

import withApiData from './withApiData';
import reducer, { configureApiData, performApiRequest, getApiDataRequest, getResultData, getEntity, invalidateApiDataRequest } from './reducer';

export {
    withApiData,
    configureApiData,
    performApiRequest,
    getApiDataRequest,
    getResultData,
    getEntity,
    invalidateApiDataRequest,
    reducer,
};

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

export type EndpointParams = {[paramName: string]: string | number}

export type ApiDataGlobalConfig = {
    handleErrorResponse?: (response?: Response, body?: any, dispatch: Function) => void,
    setHeaders?: (defaultHeaders: Object, state: Object) => Object,
    setRequestProperties?: (defaultProperties: Object, state: Object) => Object, // the fetch init param
}

export type ApiDataEndpointConfig = {
    url: string,  // add parameters as :paramName, eg: https://myapi.org/myendpoint/:myparam
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    cacheDuration?: number, // milliseconds, infinite by default
    responseSchema?: Object | Array<Object>,
    transformResponseBody?: (responseBody: Object) => NormalizedData, // todo: this should transform before normalize or without normalize if no schema (so return any)

    // return false to not trigger global function
    handleErrorResponse?: (response?: Response, body?: any, dispatch: Function) => boolean,

    // defaultHeaders will be the headers returned by the setHeaders function from the global config, if set
    setHeaders?: (defaultHeaders: Object, state: Object) => Object,

    // defaultPropertie will be the properties returned by the setRequestproperties function from the global config, if set
    setRequestProperties?: (defaultProperties: Object, state: Object) => Object,
}

export type ApiDataRequest = {
    result?: any,
    networkStatus: NetworkStatus,
    lastCall: number,
    response?: Response,
    errorBody?: any,
}

export type ApiDataBinding<T> = {
    data?: T,
    request: ApiDataRequest,
}