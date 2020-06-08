import { State } from '../reducer';
import { denormalize } from 'normalizr';

/**
 * Selector for getting a single entity from normalized data.
 */
export const getEntity = (state: State, schema: any, id: string | number): any | void => {
    const entity = state.entities[schema.key] && state.entities[schema.key][id];
    return entity && denormalize(id, schema, state.entities);
};
