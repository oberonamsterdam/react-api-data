// @flow
import { type EndpointParams } from '../';

declare export var getRequestKey: (endpointKey: string, params?: EndpointParams, instanceId?: string) => string;
