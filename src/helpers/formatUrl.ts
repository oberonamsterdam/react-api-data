import { EndpointParams } from '../types';
import { stringifyUrl, StringifyOptions } from 'query-string';

export const formatUrl = (url: string, params?: EndpointParams, queryStringOpts?: StringifyOptions): string => {
    if (!params) {
        return url;
    }
    // const {query: existingParams} = parseUrl(url);
    const replacedParams = new Set();
    const parsedUrl = url.replace(/:[a-zA-Z]+/g, match => {
        const paramName = match.substr(1);
        if (params[paramName]) {
            if (Array.isArray(params[paramName])) {
                throw new TypeError(
                    'react-api-data: tried to use an array in an url parameter, this is supported, but only with query parameters.\nEither remove the parameter from your url, or change the type.'
                );
            }

            replacedParams.add(paramName);
            return encodeURIComponent(String(params[paramName]));
        }
        return '';
    });

    const query = Object.assign(
        {},
        ...Object.entries(params)
            .filter(([paramName]) => !replacedParams.has(paramName))
            .map(([key, val]) => ({ [key]: val }))
    );

    return stringifyUrl(
        {
            url: parsedUrl,
            query,
        },
        {
            arrayFormat: 'bracket',
            ...queryStringOpts,
        }
    );
};
