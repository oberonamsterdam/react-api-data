import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Binding, EndpointParams } from './types';
import { BindingsStore } from './helpers/createBinding';
import { shouldAutoTrigger } from './withApiData';
import { State } from './reducer';
import shallowEqual from 'shallowequal';

type UseHook = <T>(endpointKey: string, params?: EndpointParams, instanceId?: string) => Binding<T>;

// the hook should call perform when shouldAutoTrigger and:
// - the component gets mounted
// - the params have changed
// - the endpoint has changed
// - the call has been invalidated (networkStatus is ready)

const useApiData: UseHook = <T>(
    endpointKey: string,
    params?: EndpointParams,
    instanceId: string = '',

    // we auto detect a SSR environment. If we are on SSR, we will immediately execute the request during every render(!)
    isSSR: boolean = typeof document === 'undefined'
) => {
    const bindingsStore = useRef<BindingsStore>(new BindingsStore());
    const prevParams = useRef<EndpointParams>();
    const prevEndpointKey = useRef<string>();
    const apiData: State = useSelector((state: { apiData: State }) => state.apiData);
    const autoTrigger = shouldAutoTrigger(apiData, endpointKey);
    const dispatch = useDispatch();
    const binding: Binding<T> = bindingsStore.current.getBinding(endpointKey, params, dispatch, instanceId, apiData);
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
            binding.perform(params);
        }
    };

    if (isSSR) {
        // immediately invoke request on SSR
        fetchDataIfNeeded();
    } else {
        // yes indeed dear reader, conditional hooks are very bad.
        // we're gonna assume isSSR won't change between renders however.
        useEffect(() => {
            fetchDataIfNeeded();
        }, [autoTrigger, params, endpointKey, networkStatus]);
    }

    return binding;
};

export default useApiData;
