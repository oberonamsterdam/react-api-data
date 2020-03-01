import { renderHook } from '@testing-library/react-hooks';
import useApiData from './useApiData';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { ConfigureBinding, setMockedStoreConfig } from './mocks/mockActions';
import { BindingsStore } from './helpers/createApiDataBinding';
import { getResultData } from './selectors/getResultData';
import { getApiDataRequest } from './selectors/getApiDataRequest';
import createApiDataRequest from './helpers/createApiDataRequest';
import { invalidateApiDataRequest } from './actions/invalidateApiDataRequest';

jest.mock('./helpers/createApiDataBinding');
const bindings: ConfigureBinding[] = [
    { name: 'testEndpoint', params: {}, networkStatus: 'ready', method: 'GET' },
    { name: 'newEndpoint', params: {}, networkStatus: 'ready', method: 'GET' },
];

const mockStore: any = (state: any) => configureStore([thunk])({
    apiData: state
});

const mockReduxFunctions = (store: any) => jest.mock('react-redux', () => ({
    useSelector: (fn: any) => fn(store.getState()),
    useDispatch: () => store.dispatch
}));

const store1 = mockStore(setMockedStoreConfig(bindings));

jest.mock('react-redux', () => ({
    useSelector: (fn: any) => fn(store1.getState()),
    useDispatch: () => store1.dispatch
}));

describe('useApiData should trigger perform under the right conditions', () => {

    const getBinding = jest.fn();
    BindingsStore.prototype.getBinding = getBinding;
    mockReduxFunctions(store1);
    const performMock1 = jest.fn();
    const endpointKey1 = bindings[0].name;
    const mockBindingWithStore = (store: any, endpointKey: string, mockFunction: () => void, binding: any) => binding.mockReturnValue({
        data: getResultData(store.getState().apiData, endpointKey, {}, ''),
        request: getApiDataRequest(store.getState().apiData, endpointKey, {}, '') || createApiDataRequest(endpointKey),
        perform: mockFunction,
        invalidateCache: () => store.dispatch(invalidateApiDataRequest(endpointKey, {}, '')),
    });
    mockBindingWithStore(store1, endpointKey1, performMock1, getBinding);
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('performs a request when status is ready and does not when hook got rerendered with same endpoint && params and status not ready', async () => {
        const { wait, waitForNextUpdate, rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params),
                                                                 { initialProps: { endpointKey: 'testEndpoint', params: {} } }
            );
        await wait(() => undefined);
        expect(performMock1).toHaveBeenCalled();
        await waitForNextUpdate;
        rerender();
        await wait(() => undefined);
        expect(performMock1).toHaveBeenCalledTimes(1);
    }, 3000
    );

    it('performs a request when status is ready and also when hook got rerenderd with different params', async () => {
        const { wait, waitForNextUpdate, rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params),
                                                                 { initialProps: { endpointKey: 'testEndpoint', params: {} } }
            );
        await wait(() => undefined);
        expect(performMock1).toHaveBeenCalled();
        await waitForNextUpdate;
        rerender();
        await wait(() => undefined);
        rerender({ endpointKey: 'testEndpoint', params: { param: 1 } });
        expect(performMock1).toHaveBeenCalledTimes(2);
    }, 3000
    );

    it('performs a request when status is ready and autotrigger true and when endpoint name changes it does a new perform', async () => {
        const { wait, waitForNextUpdate, rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params),
                                                                 { initialProps: { endpointKey: 'testEndpoint', params: {} } }
            );

        await wait(() => undefined);
        expect(performMock1).toHaveBeenCalled();
        const performMock2 = jest.fn();
        mockBindingWithStore(store1, bindings[1].name, performMock2, getBinding);
        await waitForNextUpdate;

        rerender({ endpointKey: 'newEndpoint', params: {} });
        expect(performMock2).toHaveBeenCalledTimes(1);
        expect(performMock1).toHaveBeenCalledTimes(1);
    }, 3000
    );
    it('performs a request when status is ready and autotrigger true and rerenders after invalidation', async () => {
        mockBindingWithStore(store1, endpointKey1, performMock1, getBinding);
        const { waitForNextUpdate, rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params),
                                                           { initialProps: { endpointKey: 'testEndpoint', params: {} } }
            );
        await waitForNextUpdate;
        expect(performMock1).toHaveBeenCalled();
            // fake invalidations by tweaking the result values
        const newBindings: ConfigureBinding[] = [
                { name: 'testEndpoint', params: {}, networkStatus: 'success', method: 'GET' },
                { name: 'newEndpoint', params: {}, networkStatus: 'ready', method: 'GET' },
        ];
        const store2 = mockStore(setMockedStoreConfig(newBindings));

        jest.mock('react-redux', () => ({
            useSelector: (fn: any) => fn(store2.getState()),
            useDispatch: () => store2.dispatch
        }));
        mockBindingWithStore(store2, endpointKey1, performMock1, getBinding);
        await waitForNextUpdate;
        rerender();
        expect(performMock1).toHaveBeenCalledTimes(1);
        jest.mock('react-redux', () => ({
            useSelector: (fn: any) => fn(store1.getState()),
            useDispatch: () => store1.dispatch
        }));
        mockBindingWithStore(store1, endpointKey1, performMock1, getBinding);
        await waitForNextUpdate;
        rerender();
        expect(performMock1).toHaveBeenCalledTimes(2);
    }, 3000
    );
});
