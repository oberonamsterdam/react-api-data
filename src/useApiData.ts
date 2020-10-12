import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Binding, EndpointParams, EndpointConfig } from './types';
import { BindingsStore } from './helpers/createBinding';
import { shouldAutoTrigger } from './withApiData';
import { State } from './reducer';
import shallowEqual from 'shallowequal';

export interface HookOptions extends Partial<EndpointConfig> {
    instanceId?: string;
}

type UseHook = <T, F = unknown>(endpointKey: string, params?: EndpointParams, options?: HookOptions) => Binding<T, F>;

// the hook should call perform when shouldAutoTrigger and:
// - the component gets mounted
// - the params have changed
// - the endpoint has changed
// - the call has been invalidated (networkStatus is ready)

const useApiData: UseHook = <T, F = unknown>(endpointKey: string, params?: EndpointParams, options?: HookOptions,
                                             // we auto detect a SSR environment. If we are on SSR, we will immediately execute the request during every render(!)
                                             isSSR: boolean = typeof document === 'undefined') => {
    const { instanceId, ...config } = options ?? {};
    const bindingsStore = useRef<BindingsStore>(new BindingsStore());
    const prevParams = useRef<EndpointParams>();
    const prevEndpointKey = useRef<string>();
    const apiData: State = useSelector((state: { apiData: State }) => state.apiData);
    const autoTrigger = shouldAutoTrigger(apiData, endpointKey);
    const dispatch = useDispatch();
    const binding: Binding<T, F> = bindingsStore.current.getBinding(endpointKey, params, dispatch, instanceId, apiData,
        undefined,
        config
    );
    const networkStatus = binding.request.networkStatus;

    const fetchDataIfNeeded = () => {
        if (
            autoTrigger &&
            ((prevParams.current && !shallowEqual(prevParams.current, params)) ||
                (prevEndpointKey.current && prevEndpointKey.current !== endpointKey) ||
                networkStatus === 'ready')
        ) {
            prevParams.current = params;
            prevEndpointKey.current = endpointKey;
            binding.perform(params, undefined);
        }
    };

    if (isSSR) {
        // immediately invoke request on SSR
        fetchDataIfNeeded();
    }

    useEffect(() => {
        fetchDataIfNeeded();
    }, [autoTrigger, params, endpointKey, networkStatus]);

    return binding;
};

export default useApiData;
