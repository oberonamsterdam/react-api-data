// @flow

import type { EndpointParams } from '../types';
import { type ApiDataState } from '../reducer';

declare export var getResultData: (
    apiDataState: ApiDataState,
    endpointKey: string,
    params?: EndpointParams | void,
    instanceId?: string
) => any;
