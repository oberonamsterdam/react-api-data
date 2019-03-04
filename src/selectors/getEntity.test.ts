import { denormalize, schema } from 'normalizr';

import { getEntity } from './getEntity';
import { ApiDataState } from '../reducer';

test('should return a single entity from normalized data', () => {

    // Set up a fake schema for the getEntity function parameter.
    const dataSchema = new schema.Entity('users');
    // const dataListSchema = [dataSchema];

    // Set up apiDataState object.
    const apiDataState: ApiDataState = {
        globalConfig: {
            timeout: 6000
        },
        endpointConfig: {
            getData: {
                url: 'https://myapi.org/myData',
                method: 'GET'
            }
        },
        requests: {
            getData: {
                networkStatus: 'success',
                lastCall: Date.now(),
                duration: 6000,
                endpointKey: 'getData'
            }
        },
        entities: { users: { abc: '1234' } }
    };

    // Set up a fake id for the getEntity function parameter.
    const id = 'abc';
    const action = getEntity(apiDataState, dataSchema, id);

    expect(action).toEqual(denormalize(id, dataSchema, apiDataState.entities));
});