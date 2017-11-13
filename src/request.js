// @flow
/* eslint no-console: 0 */

const __DEV__ = process.env.NODE_ENV === 'development';

export type HandledResponse = {
    response: Response,
    body: Object
};

/**
 * Get the headers based on request properties, adds:
 * - Content Type json if a body is set
 * - Authorization if auth token is set
 * @param requestProperties
 * @returns {{}}
 */
const getHeaders = (requestProperties: any): Object => {
    const headers = requestProperties.headers || {};

    if ('body' in requestProperties) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

/**
 * Execute a request. Body object will be converted to JSON.
 *
 * @param url
 * @param requestProperties
 * @returns {Promise<HandledResponse>} Resolves with response, response body (json parsed, if present). Rejects with an Error if
 * connection fails.
 */
export default (url: string, requestProperties?: any = {}): Promise<HandledResponse> => {
    if (__DEV__) {
        console.log('Executing request: ' + url);
    }

    requestProperties.headers = getHeaders(requestProperties);

    if (typeof requestProperties.body !== 'string') {
        requestProperties.body = JSON.stringify(requestProperties.body);
    }

    return new Promise((resolve, reject) => {
        const onRequestSuccess = response => {
            if (__DEV__) {
                console.log(`Request successful (${response.status}): ` + url);
            }

            if (response.status === 204 || response.headers.get('content-length') === 0) {
                // 204: no content
                resolve({
                    response,
                    body: {}
                });
            } else {
                response.json()
                    .then(
                        body => resolve({
                            response,
                            body
                        }),
                        () => resolve({
                            response,
                            body: {}
                        })
                    );
            }
        };

        const onRequestError = error => {
            if (__DEV__) {
                console.log(`Request failed: ${url}`);
                console.error(error);
            }

            reject(error);
        };

        fetch(url, requestProperties).then(onRequestSuccess, onRequestError);
    });
};
