import Request, { RequestHandler } from '../request';

let requestFunction = Request;

/**
 * Use your own request function that calls the api and reads the responseBody response. Make sure it implements the
 * {@link RequestHandler} interface.
 * @param requestHandler
 */

export const useRequestHandler = (requestHandler: RequestHandler) => {
    requestFunction = requestHandler;
};