import { EndpointParams } from '../types';

export const formatUrl = (url: string, params?: EndpointParams): string => {
    if (!params) {
        return url;
    }
    const replacedParams = new Set();
    let result = url.replace(
        /:[a-zA-Z]+/g,
        match => {
            const paramName = match.substr(1);
            if (params[paramName]) {
                replacedParams.add(paramName);
                return encodeURIComponent(String(params[paramName]));
            }
            return '';
        }
    );

    const queryString = Object.keys(params)
        .filter(paramName => !replacedParams.has(paramName))
        .map(paramName => `${paramName}=${encodeURIComponent(String(params[paramName]))}`)
        .join('&');

    if (queryString) {
        result += url.includes('?') ? '&' : '?';
    }

    return result + queryString;
};
