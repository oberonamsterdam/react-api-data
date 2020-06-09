// @flow
import { EndpointConfig, DataRequest } from '../';

declare export var cacheExpired: (endpointConfig: EndpointConfig, request: DataRequest) => boolean;
