// @flow

import type { EndpointParams, RequestHandler } from '../types';
import type { ActionCreator } from 'redux';
import type { Action, State } from '../reducer';

declare export var performRequest: (
  endpointKey: string,
  params?: EndpointParams | void,
  body?: any,
  instanceId?: string
) => (
  dispatch: ActionCreator<Action>,
  getState: () => {
    apiData: State
  }
) => Promise<void>;

declare export var setRequestHandler: (
  requestHandler: RequestHandler
) => void;
