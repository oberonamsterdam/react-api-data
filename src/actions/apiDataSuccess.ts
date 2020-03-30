import { ApiDataEndpointConfig, NormalizedData } from '../types';
import { normalize } from 'normalizr';

export interface ApiDataSuccessAction {
    type: 'API_DATA_SUCCESS';
    payload: {
        requestKey: string;
        response: Response;
        normalizedData?: NormalizedData;
        responseBody?: any;
    };
}

export const apiDataSuccess = (
    requestKey: string,
    endpointConfig: ApiDataEndpointConfig,
    response: Response,
    body: any
): ApiDataSuccessAction => ({
    type: 'API_DATA_SUCCESS',
    payload: {
        requestKey,
        response,
        responseBody:
            typeof endpointConfig.transformResponseBody === 'function'
                ? endpointConfig.transformResponseBody(body)
                : body,
        normalizedData: endpointConfig.responseSchema ? normalize(body, endpointConfig.responseSchema) : undefined,
    },
});
