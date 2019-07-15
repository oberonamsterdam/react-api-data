import { EndpointParams } from '../index';

export const getRequestKey = (endpointKey: string, params: EndpointParams = {}, instanceId: string = ''): string => {
    return `${endpointKey}/${Object.keys(params).sort().map(param => `${param}=${params[param]}`).join('&')}${instanceId !== '' ? '#' + instanceId : ''}`;
};