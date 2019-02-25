// @flow
import { type ApiDataState } from '../reducer';

declare export var getEntity: (
  apiDataState: ApiDataState,
  schema: any,
  id: string | number
) => any;

