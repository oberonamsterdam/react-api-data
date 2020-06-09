import { EndpointConfig, DataRequest } from '../types';

export const cacheExpired = (endpointConfig: EndpointConfig, request: DataRequest): boolean =>
    Date.now() - request.lastCall >
    (typeof endpointConfig.cacheDuration === 'number' ? endpointConfig.cacheDuration : Number.POSITIVE_INFINITY);
