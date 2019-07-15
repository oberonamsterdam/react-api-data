// @flow

import type { EndpointParams } from '../index';
import type { ActionCreator } from 'redux';
import type { Action, ApiDataState } from '../reducer';
import type { RequestHandler } from '../request';

declare export var performApiRequest: (
  endpointKey: string,
  params?: EndpointParams | void,
  body?: any,
  instanceId?: string
) => (
  dispatch: ActionCreator<Action>,
  getState: () => {
    apiData: ApiDataState
  }
) => Promise<void>;

declare export var useRequestHandler: (
  requestHandler: RequestHandler
) => void;
