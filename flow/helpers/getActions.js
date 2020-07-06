// @flow
import { type EndpointParams, type Binding } from '..';

export type Actions = {
    invalidateCache: (endpointKey: string, params?: EndpointParams, instanceId?: string) => void,
    perform: (endpointKey: string, params?: EndpointParams, body?: any, instanceId?: string) => Promise<Binding<any>>,
};