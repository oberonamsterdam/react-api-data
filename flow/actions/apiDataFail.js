// @flow

export interface ApiDataFailAction {
  type: 'API_DATA_FAIL';
  payload: {
    requestKey: string,
    response?: Response,
    errorBody: any
  };
}

declare export var apiDataFail: (requestKey: string, errorBody: any, response?: Response) => ApiDataFailAction;
