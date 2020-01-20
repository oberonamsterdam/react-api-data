import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Binding, EndpointParams } from './types';
import { BindingsStore } from './helpers/createBinding';
import { shouldAutoTrigger } from './withApiData';
import { State } from './reducer';

type UseHook = <T>(endpointKey: string, params?: EndpointParams, instanceId?: string) => Binding<T>;

const useApiData: UseHook = <T>(endpointKey: string, params?: EndpointParams, instanceId: string = '') => {
    const bindingsStore = useRef<BindingsStore>(new BindingsStore());
    const apiData: State = useSelector((state: { apiData: State }) => state.apiData);
    const autoTrigger = shouldAutoTrigger(apiData, endpointKey);
    const dispatch = useDispatch();
    const binding: Binding<T> = bindingsStore.current.getBinding(endpointKey, params, dispatch, instanceId, apiData);
    const request = binding.request;
    const networkStatus = request && request.networkStatus;

    if (autoTrigger && networkStatus === 'ready') {
        binding.perform(params);
    }

    return binding;
};

export default useApiData;
