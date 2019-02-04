// @flow

export interface HandledResponse {
    response: Response;
    body: any;
}

export type RequestHandler = (
    url: string,
    requestProperties?: RequestOptions
) => Promise<HandledResponse>;
declare var defaultRequestHandler: RequestHandler;
declare export default typeof defaultRequestHandler;