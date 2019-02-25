import { ApiDataEndpointConfig, ApiDataRequest } from '../index';

export const cacheExpired = (endpointConfig: ApiDataEndpointConfig, request: ApiDataRequest): boolean =>
    Date.now() - request.lastCall > (typeof endpointConfig.cacheDuration === 'number' ? endpointConfig.cacheDuration : Number.POSITIVE_INFINITY);
