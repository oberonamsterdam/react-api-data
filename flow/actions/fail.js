// @flow

export interface FailAction {
  type: 'API_DATA_FAIL';
  payload: {
    requestKey: string,
    response?: Response,
    errorBody: any
  };
}

declare export var fail: (requestKey: string, errorBody: any, response?: Response) => FailAction;
