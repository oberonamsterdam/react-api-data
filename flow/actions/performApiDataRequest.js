// @flow

import type { EndpointParams } from '../index';
import type { ActionCreator } from 'redux';
import type { Action, ApiDataState } from '../reducer';
import type { RequestHandler } from '../request';

export var performApiRequest: (
  endpointKey: string,
  params?: EndpointParams | void,
  body?: any
) => (
  dispatch: ActionCreator<Action>,
  getState: () => {
    apiData: ApiDataState
  }
) => Promise<void>;

export var useRequestHandler: (
  requestHandler: RequestHandler
) => void;
