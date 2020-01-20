// @flow
import { EndpointConfig, Request } from '../';

declare export var cacheExpired: (endpointConfig: EndpointConfig, request: Request) => boolean;
