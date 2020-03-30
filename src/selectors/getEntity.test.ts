import { denormalize, schema } from 'normalizr';

import { getEntity } from './getEntity';
import { ApiDataState } from '../reducer';

describe(' getEntity function should return a single entity from normalized data', () => {
    // Set up apiDataState object.
    const apiDataState: ApiDataState = {
        globalConfig: {
            timeout: 6000,
        },
        endpointConfig: {
            getData: {
                url: 'https://myapi.org/myData',
                method: 'GET',
            },
        },
        requests: {
            getData: {
                networkStatus: 'success',
                lastCall: 10,
                duration: 6000,
                endpointKey: 'getData',
                url: 'https://myapi.org/myData',
            },
        },
        entities: { users: { abc: '1234' } },
    };

    test('returns a denormalized data object from the entities in the endPointConfig', () => {
        const dataSchema = new schema.Entity('users');
        const id = 'abc';
        const entity = getEntity(apiDataState, dataSchema, id);
        expect(entity).toEqual(denormalize(id, dataSchema, apiDataState.entities));
    });
    test('returns undefined because no schema found', () => {
        const dataSchema = new schema.Entity('clients');
        const id = 'abc';
        const entity = getEntity(apiDataState, dataSchema, id);
        expect(entity).toEqual(undefined);
    });
    test('returns undefined because no id found', () => {
        const dataSchema = new schema.Entity('users');
        const id = 'cba';
        const entity = getEntity(apiDataState, dataSchema, id);
        expect(entity).toEqual(undefined);
    });
});
