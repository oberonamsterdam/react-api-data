// @flow
import { ApiDataEndpointConfig, ApiDataRequest } from '../';

export var cacheExpired: (endpointConfig: ApiDataEndpointConfig, request: ApiDataRequest) => boolean;
