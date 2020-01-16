import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiDataBinding, ApiDataState, EndpointParams } from './index';
import { BindingsStore } from './helpers/createApiDataBinding';
import { shouldAutoTrigger } from './withApiData';

type UseApiDataHook = <T>(endpointKey: string, params?: EndpointParams, instanceId?: string) => ApiDataBinding<T>;

// the hook should call perform when shouldAutoTrigger and:
// - the component gets mounted
// - the params have changed
// - the endpoint has changed
// - the call has been invalidated (networkStatus is ready)

const useApiData: UseApiDataHook = <T>(endpointKey: string, params?: EndpointParams, instanceId: string = '') => {
    const bindingsStore = useRef<BindingsStore>(new BindingsStore());
    const prevParams = useRef<EndpointParams>();
    const prevEndpointKey = useRef<string>();
    const apiData: ApiDataState = useSelector((state: { apiData: ApiDataState }) => {
        return state.apiData;
    });
    const autoTrigger = shouldAutoTrigger(apiData, endpointKey);
    const dispatch = useDispatch();
    const binding: ApiDataBinding<T> = bindingsStore.current.getBinding(endpointKey, params, dispatch, instanceId, apiData);
    const networkStatus = binding.request.networkStatus;

    useEffect(() => {
        if (
            !autoTrigger && (
                prevParams.current !== params ||
                prevEndpointKey.current !== endpointKey ||
                networkStatus === 'ready'
            )
        ) {
            prevParams.current = params;
            prevEndpointKey.current = endpointKey;
            binding.perform(params);
        }
    },
              [autoTrigger, params, endpointKey, networkStatus]);

    return binding;
};

export default useApiData;
