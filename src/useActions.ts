import { Actions, getActions } from './helpers/getActions';
import { useDispatch } from 'react-redux';

export const useActions = (): Actions => {
    const dispatch = useDispatch();
    return getActions(dispatch);
};