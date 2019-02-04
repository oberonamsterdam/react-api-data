// @flow

import type { EndpointParams } from '../index';
import { ApiDataState } from '../reducer';

declare export var getResultData: (
  apiDataState: ApiDataState,
  endpointKey: string,
  params?: EndpointParams | void
) => any;
