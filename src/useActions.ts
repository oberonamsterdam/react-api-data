import { Actions, getActions } from './helpers/getActions';
import { useDispatch } from 'react-redux';

const useActions = (): Actions => {
    const dispatch = useDispatch();
    return getActions(dispatch);
};

export default useActions;