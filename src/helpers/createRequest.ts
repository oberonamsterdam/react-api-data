import { DataRequest } from '../types';

// factory function for creating an initial or fallback request
export default (endpointKey: string): DataRequest => ({
    networkStatus: 'ready',
    lastCall: 0,
    duration: 0,
    endpointKey,
    url: '',
});
