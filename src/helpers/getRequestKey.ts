import { EndpointParams } from '../index';

export const getRequestKey = (endpointKey: string, params: EndpointParams = {}, instanceId: string = ''): string => 
    `${endpointKey}/${Object.keys(params).sort().map(param => `${param}=${params[param]}`).join('&')}${instanceId !== '' ? '#' + instanceId : ''}`;