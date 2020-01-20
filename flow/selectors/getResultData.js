// @flow

import type { EndpointParams } from '../types';
import { type State } from '../reducer';

declare export var getResultData: (
  apiDataState: State,
  endpointKey: string,
  params?: EndpointParams | void,
  instanceId?: string
) => any;
