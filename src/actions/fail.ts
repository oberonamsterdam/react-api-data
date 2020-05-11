export interface FailAction {
    type: 'API_DATA_FAIL';
    payload: {
        requestKey: string;
        response?: Response;
        errorBody: any;
    };
}

export const fail = (requestKey: string, errorBody: any, response?: Response): FailAction => ({
    type: 'API_DATA_FAIL',
    payload: {
        requestKey,
        response,
        errorBody,
    },
});
