// @flow
import { type ApiDataState } from '../reducer';
import { ApiDataRequest, type EndpointParams } from '..';

declare export var getApiDataRequest: (
  apiDataState: ApiDataState,
  endpointKey: string,
  params?: EndpointParams | void,
  instanceId?: string
) => ApiDataRequest;
