import { configureApiData } from './configureApiData';
import { ApiDataEndpointConfig } from '../types';

describe('ConfigureApiData action creator', () => {
    test('ConfigureApiDataAction object with the correct type and payload', () => {
        // Define a fake config object to use as an argument for the action.
        const globalConfig = {
            timeout: 6000,
        };

        // Define a fake endpointConfig object to use as an argument for the action.
        const endpointConfig: { [endpointKey: string]: ApiDataEndpointConfig } = {
            getData: {
                url: 'https://myapi.org/myData',
                method: 'GET',
            },
        };

        const action = configureApiData(globalConfig, endpointConfig);

        expect(action).toEqual({
            type: 'CONFIGURE_API_DATA',
            payload: {
                globalConfig,
                endpointConfig,
            },
        });
    });
});
