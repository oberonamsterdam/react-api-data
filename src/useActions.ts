import { getActions } from './actions/performApiDataRequest';
import { useDispatch } from 'react-redux';
import { Actions } from './types';

const useActions = (): Actions => {
    const dispatch = useDispatch();
    return getActions(dispatch);
};

export default useActions;