import { EndpointConfig, Request } from '../types';

export const cacheExpired = (endpointConfig: EndpointConfig, request: Request): boolean =>
    Date.now() - request.lastCall > (typeof endpointConfig.cacheDuration === 'number' ? endpointConfig.cacheDuration : Number.POSITIVE_INFINITY);
