import { renderHook } from '@testing-library/react-hooks';
import useApiData from './useApiData';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { ConfigureBinding, setMockedStoreConfig } from './mocks/mockActions';
import { BindingsStore } from './helpers/createBinding';
import { getResultData } from './selectors/getResultData';
import { getRequest } from './selectors/getRequest';
import createRequest from './helpers/createRequest';
import { invalidateRequest } from './actions/invalidateRequest';

jest.mock('./helpers/createApiDataBinding');
const bindings: ConfigureBinding[] = [
    { name: 'testEndpoint', params: {}, networkStatus: 'ready', method: 'GET' },
    { name: 'newEndpoint', params: {}, networkStatus: 'ready', method: 'GET' },
];

const mockStore: any = (state: any) =>
    configureStore([thunk])({
        apiData: state,
    });

const mockReduxFunctions = (store: any) =>
    jest.mock('react-redux', () => ({
        useSelector: (fn: any) => fn(store.getState()),
        useDispatch: () => store.dispatch,
    }));

const store1 = mockStore(setMockedStoreConfig(bindings));

jest.mock('react-redux', () => ({
    useSelector: (fn: any) => fn(store1.getState()),
    useDispatch: () => store1.dispatch,
}));

describe('useApiData should trigger perform under the right conditions', () => {
    const getBinding = jest.fn();
    BindingsStore.prototype.getBinding = getBinding;
    mockReduxFunctions(store1);
    const performMock1 = jest.fn();
    const endpointKey1 = bindings[0].name;
    const mockBindingWithStore = (store: any, endpointKey: string, mockFunction: () => void, binding: any) =>
        binding.mockReturnValue({
            data: getResultData(store.getState().apiData, endpointKey, {}, ''),
            request:
                getRequest(store.getState().apiData, endpointKey, {}, '') || createRequest(endpointKey),
            perform: mockFunction,
            invalidateCache: () => store.dispatch(invalidateRequest(endpointKey, {}, '')),
    });
    mockBindingWithStore(store1, endpointKey1, performMock1, getBinding);
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('performs a request when status is ready and does not when hook got rerendered with same endpoint && params and status not ready', async () => {
        const { rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params), {
            initialProps: { endpointKey: 'testEndpoint', params: {} },
        });
        expect(performMock1).toHaveBeenCalledTimes(1);
        rerender();
        expect(performMock1).toHaveBeenCalledTimes(1);
    }, 3000);

    it('performs a request when status is ready and also when hook got rerenderd with different params', async () => {
        const { rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params), {
            initialProps: { endpointKey: 'testEndpoint', params: {} },
        });
        expect(performMock1).toHaveBeenCalledTimes(1);
        rerender({ endpointKey: 'testEndpoint', params: { param: 1 } });
        expect(performMock1).toHaveBeenCalledTimes(2);
    }, 3000);

    it('performs a request when status is ready and autotrigger true and when endpoint name changes it does a new perform', async () => {
        const { rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params), {
            initialProps: { endpointKey: 'testEndpoint', params: {} },
        });
        expect(performMock1).toHaveBeenCalledTimes(1);
        const performMock2 = jest.fn();
        mockBindingWithStore(store1, bindings[1].name, performMock2, getBinding);

        rerender({ endpointKey: 'newEndpoint', params: {} });
        expect(performMock2).toHaveBeenCalledTimes(1);
        expect(performMock1).toHaveBeenCalledTimes(1);
    }, 3000);
    it('performs a request when status is ready and autotrigger true and rerenders after invalidation', async () => {
        mockBindingWithStore(store1, endpointKey1, performMock1, getBinding);
        const { rerender } = renderHook(({ endpointKey, params }) => useApiData(endpointKey, params), {
            initialProps: { endpointKey: 'testEndpoint', params: {} },
        });
        expect(performMock1).toHaveBeenCalled();
        // set ready tot success to make a new store to test the invalidations.
        const newBindings: ConfigureBinding[] = [
            { name: 'testEndpoint', params: {}, networkStatus: 'success', method: 'GET' },
            { name: 'newEndpoint', params: {}, networkStatus: 'ready', method: 'GET' },
        ];
        const store2 = mockStore(setMockedStoreConfig(newBindings));

        jest.mock('react-redux', () => ({
            useSelector: (fn: any) => fn(store2.getState()),
            useDispatch: () => store2.dispatch,
        }));
        mockBindingWithStore(store2, endpointKey1, performMock1, getBinding);
        rerender();
        expect(performMock1).toHaveBeenCalledTimes(1);
        // configure the old store with status ready to see or it will retrigger.
        jest.mock('react-redux', () => ({
            useSelector: (fn: any) => fn(store1.getState()),
            useDispatch: () => store1.dispatch,
        }));
        mockBindingWithStore(store1, endpointKey1, performMock1, getBinding);
        rerender();
        expect(performMock1).toHaveBeenCalledTimes(2);
    }, 3000);
});
