// @flow
import { ApiDataState } from '../reducer';
import { ApiDataRequest, EndpointParams } from '..';

declare export var getApiDataRequest: (
  apiDataState: ApiDataState,
  endpointKey: string,
  params?: EndpointParams | void
) => ApiDataRequest;
