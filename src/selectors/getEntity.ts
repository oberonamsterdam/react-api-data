import { ApiDataState } from '../reducer';
import { denormalize } from 'normalizr';

/**
 * Selector for getting a single entity from normalized data.
 */
export const getEntity = (apiDataState: ApiDataState, schema: any, id: string | number): any | void => {
    const entity = apiDataState.entities[schema.key] && apiDataState.entities[schema.key][id];
    return entity && denormalize(id, schema, apiDataState.entities);
};