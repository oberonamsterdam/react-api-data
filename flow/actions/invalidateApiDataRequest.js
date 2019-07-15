// @flow
import type { EndpointParams } from '../index';

export interface InvalidateApiDataRequestAction {
  type: 'INVALIDATE_API_DATA_REQUEST';
  payload: {
    requestKey: string
  };
}

declare export var invalidateApiDataRequest: (
  endpointKey: string,
  params?: EndpointParams | void,
  instanceId?: string
) => InvalidateApiDataRequestAction;
