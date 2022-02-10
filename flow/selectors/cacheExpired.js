// @flow
import { type EndpointConfig, type DataRequest } from '../';

declare export var cacheExpired: (endpointConfig: EndpointConfig, request: DataRequest) => boolean;
