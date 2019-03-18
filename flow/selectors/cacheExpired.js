// @flow
import { ApiDataEndpointConfig, ApiDataRequest } from '../';

declare export var cacheExpired: (endpointConfig: ApiDataEndpointConfig, request: ApiDataRequest) => boolean;
