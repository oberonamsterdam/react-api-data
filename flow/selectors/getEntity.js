// @flow
import { type State } from '../reducer';

declare export var getEntity: (
  apiDataState: State,
  schema: any,
  id: string | number
) => any;

