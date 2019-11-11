// @flow
import { type EndpointParams, type ApiDataBinding } from '..';

export type Actions = {
    invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId?: string) => void,
    perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId?: string) => Promise<ApiDataBinding<any>>,
};