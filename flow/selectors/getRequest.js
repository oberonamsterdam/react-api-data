// @flow
import { type State } from '../reducer';
import { Request, type EndpointParams } from '..';

declare export var getRequest: (
  State: State,
  endpointKey: string,
  params?: EndpointParams | void,
  instanceId?: string
) => Request;
