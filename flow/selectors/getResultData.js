// @flow

import type { EndpointParams } from '../index';
import { type ApiDataState } from '../reducer';

declare export var getResultData: (
  apiDataState: ApiDataState,
  endpointKey: string,
  params?: EndpointParams | void,
  instanceId?: string
) => any;
