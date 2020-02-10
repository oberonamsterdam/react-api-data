import { renderHook } from '@testing-library/react-hooks';
import useApiData from './useApiData';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { getState } from './mocks/mockActions';
// import { performApiRequest, useRequestHandler } from './actions/performApiDataRequest';
// import { getRequestKey } from './helpers/getRequestKey';
import { BindingsStore } from './helpers/createApiDataBinding';
// import { ApiDataRequest, EndpointParams } from './types';
// import { Action, ApiDataState } from './reducer';
import { getResultData } from './selectors/getResultData';
import { getApiDataRequest } from './selectors/getApiDataRequest';
import createApiDataRequest from './helpers/createApiDataRequest';
import { invalidateApiDataRequest } from './actions/invalidateApiDataRequest';

// import { performApiRequest } from './actions/performApiDataRequest';
// import { getRequestKey } from './helpers/getRequestKey';
// import request from './request';
// import {performApiRequest} from './actions/performApiDataRequest';

// const mockRequest = jest.fn();
// const mockPerform = jest.fn();
jest.mock('./helpers/createApiDataBinding');

const store1: any = configureStore([thunk])({
    apiData: getState('testEndpoint', true, {}, 'ready', { method: 'GET' })
});

jest.mock('react-redux', () => ({
    useSelector: (fn: any) => fn(store1.getState()),
    useDispatch: () => store1.dispatch
}));

// const response1 = {
//     response: {
//         body: { data: 'json' },
//         ok: true,
//         redirected: false,
//         status: 200,
//         statusText: 'ok'
//     }
// };

describe('useApiData should trigger perform under the right conditions', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    const getBinding = jest.fn();
    const performMock = jest.fn();
    BindingsStore.prototype.getBinding = getBinding;
    getBinding.mockReturnValue({
        data: getResultData(store1.getState().apiData, 'testEndpoint', {}, ''),
        request: getApiDataRequest(store1.getState().apiData, 'testEndpoint', {}, '') || createApiDataRequest('testEndpoint'),
        perform: performMock,
        invalidateCache: () => store1.dispatch(invalidateApiDataRequest('testEndpoint', {}, '')),
    });

    // todo: test these cases here:
    // the hook should call perform when shouldAutoTrigger and:
    // - the component gets mounted
    // - the params have changed
    // - the endpoint has changed
    // - the call has been invalidated (networkStatus is ready)
    it('performs a request when status is ready and does not when hook got rerendered with same endpoint && params and status not ready', async () => {
        const { wait, waitForNextUpdate, rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params),
                                                                 { initialProps: { endpointKey: 'testEndpoint', params: {} } }
            );
        await wait(() => undefined);
        expect(performMock).toHaveBeenCalled();
        await waitForNextUpdate;
        rerender();
        await wait(() => undefined);
        expect(performMock).toHaveBeenCalledTimes(1);
    }, 3000
    );

    it('performs a request when status is ready and also when hook got rerenderd with different params', async () => {
        const { wait, waitForNextUpdate, rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params),
                                                                 { initialProps: { endpointKey: 'testEndpoint', params: {} } }
            );
        await wait(() => undefined);
        expect(performMock).toHaveBeenCalled();
        await waitForNextUpdate;
        rerender();
        await wait(() => undefined);
        rerender({ endpointKey: 'testEndpoint', params: { param: 1 } });
        expect(performMock).toHaveBeenCalledTimes(2);
    }, 3000
    );

    it('performs a request when status is ready and autotrigger true and when endpoint name changes it does a new perform', async () => {
            // fetchMocka.mockResponseOnce(() => Promise.resolve(JSON.stringify({ data: '12345' })), { status: 200 });
        const { wait, waitForNextUpdate, rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params),
                                                                 { initialProps: { endpointKey: 'testEndpoint', params: {} } }
            );
        await wait(() => undefined);
        expect(performMock).toHaveBeenCalled();
        // getBinding.mockReturnValue({
        //     data: getResultData(store1.getState().apiData, 'newEndpoint', {}, ''),
        //     request: getApiDataRequest(store1.getState().apiData, 'newEndpoint', {}, '') || createApiDataRequest('testEndpoint'),
        //     perform: performMock,
        //     invalidateCache: () => store1.dispatch(invalidateApiDataRequest('newEndpoint', {}, '')),
        // });
        await waitForNextUpdate;
        rerender({ endpointKey: 'testEndpoint', params: {} });
        expect(performMock).toHaveBeenCalledTimes(2);
    }, 3000
    );
    //
    // it('performs a request when status is ready and also when hook got rerenderd with different params', async () => {
    //     useRequestHandler(mockRequest.mockResolvedValue({ response: response1.response, body: response1.response.body }));
    //         // fetchMocka.mockResponseOnce(() => Promise.resolve(JSON.stringify({ data: '12345' })), { status: 200 });
    //     const { wait, waitForNextUpdate, rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params),
    //                                                              { initialProps: { endpointKey: 'testEndpoint', params: {} } }
    //         );
    //     await wait(() => undefined);
    //     const actions1 = store1.getActions();
    //     const expectResult = [{
    //         type: 'FETCH_API_DATA',
    //         payload: {
    //             requestKey: getRequestKey('testEndpoint', {}),
    //             endpointKey: 'testEndpoint',
    //             params: {},
    //             url: 'mockAction.get',
    //         }},
    //         { type: 'API_DATA_SUCCESS',
    //             payload:
    //             { requestKey: 'testEndpoint/',
    //                 response: response1.response,
    //                 responseBody: response1.response.body,
    //                 normalizedData: undefined } }
    //     ];
    //     expect(actions1).toEqual(expectResult);
    //     await waitForNextUpdate;
    //     rerender({ endpointKey: 'testEndpoint', params: { param: 1 } });
    //     const actions3 = store1.getActions();
    //     const expectResult2 = [{
    //         type: 'FETCH_API_DATA',
    //         payload: {
    //             requestKey: getRequestKey('testEndpoint', { param: 1 }),
    //             endpointKey: 'testEndpoint',
    //             params: { param: 1 },
    //             url: 'mockAction.get?param=1',
    //         }},
    //         { type: 'API_DATA_SUCCESS',
    //             payload:
    //             { requestKey: 'testEndpoint/param=1',
    //                 response: response1.response,
    //                 responseBody: response1.response.body,
    //                 normalizedData: undefined } }
    //     ];
    //     expect(actions3).toEqual(expectResult.concat(expectResult2));
    // }, 3000
    // );
});
