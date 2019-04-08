// @flow
import type { ApiDataEndpointConfig, NormalizedData } from '../index';

export interface ApiDataSuccessAction {
  type: 'API_DATA_SUCCESS';
  payload: {
    requestKey: string,
    response: Response,
    normalizedData?: NormalizedData,
    responseBody?: any
  };
}

declare export var apiDataSuccess: (requestKey: string, endpointConfig: ApiDataEndpointConfig, response: Response, body: any) => ApiDataSuccessAction
