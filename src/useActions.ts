import { getActions } from './helpers/getActions';
import { useDispatch } from 'react-redux';
import { Actions } from './types';

const useActions = (): Actions => {
    const dispatch = useDispatch();
    return getActions(dispatch);
};

export default useActions;
