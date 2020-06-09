import { configure } from './configure';
import { EndpointConfig } from '../types';

describe('Configure action creator', () => {
    test('ConfigureAction object with the correct type and payload', () => {
        // Define a fake config object to use as an argument for the action.
        const globalConfig = {
            timeout: 6000,
        };

        // Define a fake endpointConfig object to use as an argument for the action.
        const endpointConfig: { [endpointKey: string]: EndpointConfig } = {
            getData: {
                url: 'https://myapi.org/myData',
                method: 'GET',
            },
        };

        const action = configure(globalConfig, endpointConfig);

        expect(action).toEqual({
            type: 'CONFIGURE_API_DATA',
            payload: {
                globalConfig,
                endpointConfig,
            },
        });
    });
});
