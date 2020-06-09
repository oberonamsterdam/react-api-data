// @flow
import type { EndpointParams } from '../types';

export interface InvalidateRequestAction {
  type: 'INVALIDATE_API_DATA_REQUEST';
  payload: {
    requestKey: string
  };
}

declare export var invalidateRequest: (
  endpointKey: string,
  params?: EndpointParams | void,
  instanceId?: string
) => InvalidateRequestAction;
