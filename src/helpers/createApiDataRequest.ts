import {ApiDataRequest} from '../index';

// factory function for creating an initial or fallback request
export default (endpointKey: string): ApiDataRequest => ({
    networkStatus: 'ready',
    lastCall: 0,
    duration: 0,
    endpointKey,
    url: '',
});
