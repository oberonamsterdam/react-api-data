import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiDataBinding, EndpointParams } from './types';
import { BindingsStore } from './helpers/createApiDataBinding';
import { shouldAutoTrigger } from './withApiData';
import { ApiDataState } from './reducer';
import shallowEqual from 'shallowequal';

type UseApiDataHook = <T, F>(endpointKey: string, params?: EndpointParams, instanceId?: string) => ApiDataBinding<T, F>;

// the hook should call perform when shouldAutoTrigger and:
// - the component gets mounted
// - the params have changed
// - the endpoint has changed
// - the call has been invalidated (networkStatus is ready)

const useApiData: UseApiDataHook = <T, F>(endpointKey: string, params?: EndpointParams, instanceId: string = '') => {
    const bindingsStore = useRef<BindingsStore>(new BindingsStore());
    const prevParams = useRef<EndpointParams>();
    const prevEndpointKey = useRef<string>();
    const apiData: ApiDataState = useSelector((state: { apiData: ApiDataState }) => {
        return state.apiData;
    });
    const autoTrigger = shouldAutoTrigger(apiData, endpointKey);
    const dispatch = useDispatch();
    const binding: ApiDataBinding<T, F> = bindingsStore.current.getBinding(
        endpointKey,
        params,
        dispatch,
        instanceId,
        apiData
    );
    const networkStatus = binding.request.networkStatus;
    useEffect(() => {
        if (
            autoTrigger &&
            ((prevParams.current && !shallowEqual(prevParams.current, params)) || (prevEndpointKey.current && prevEndpointKey.current !== endpointKey) || networkStatus === 'ready')
        ) {
            prevParams.current = params;
            prevEndpointKey.current = endpointKey;
            binding.perform(params);
        }
    }, [autoTrigger, params, endpointKey, networkStatus]);
    return binding;
};

export default useApiData;
