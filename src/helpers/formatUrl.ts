import { EndpointParams } from '../index';

export const formatUrl = (url: string, params?: EndpointParams): string =>
    !params ? url : url.replace(/:[a-zA-Z]+/g, match => params ? String(params[match.substr(1)]) || '' : '');