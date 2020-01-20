import { EndpointConfig, NormalizedData } from '../types';
import { normalize } from 'normalizr';

export interface SuccessAction {
    type: 'API_DATA_SUCCESS';
    payload: {
        requestKey: string,
        response: Response,
        normalizedData?: NormalizedData,
        responseBody?: any,
    };
}

export const success = (requestKey: string, endpointConfig: EndpointConfig, response: Response, body: any): SuccessAction => ({
    type: 'API_DATA_SUCCESS',
    payload: {
        requestKey,
        response,
        responseBody: typeof endpointConfig.transformResponseBody === 'function'
            ? endpointConfig.transformResponseBody(body)
            : body,
        normalizedData: endpointConfig.responseSchema
            ? normalize(body, endpointConfig.responseSchema)
            : undefined
    }
});