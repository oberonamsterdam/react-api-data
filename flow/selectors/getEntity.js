// @flow
import { type State } from '../reducer';

declare export var getEntity: (
  state: State,
  schema: any,
  id: string | number
) => any;

