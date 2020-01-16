import { renderHook } from '@testing-library/react-hooks';
import useApiData from './useApiData';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { getState } from './mocks/mockActions';
// import {performApiRequest} from './actions/performApiDataRequest';

let store: any;

store = configureStore([thunk])({
    apiData: getState('testEndpoint', true, {}, 'success', { method: 'GET' })
});

jest.mock('react-redux', () => ({
    useSelector: (fn: any) => fn(store.getState()),
    useDispatch: () => store.dispatch
}));
//
// const mockApiRequest = () => {
//     (performApiRequest as jest.Mock).mockImplementation(() =>
//         Promise.resolve()
//     );
// };

describe('useApiData should trigger perform under the right conditions', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });
    // todo: test these cases here:
    // the hook should call perform when shouldAutoTrigger and:
    // - the component gets mounted
    // - the params have changed
    // - the endpoint has changed
    // - the call has been invalidated (networkStatus is ready)
    it('it performs when status is ready', async () => {
        const params1 = {};
        const { result, waitForNextUpdate } = renderHook(() => useApiData('testEndpoint', params1));
        const perform = jest.fn(() =>
            Promise.resolve()
        );
        result.current.perform = perform;
        perform.mockResolvedValue({})
        await waitForNextUpdate();
        expect(perform).toHaveBeenCalled();
    });
});
