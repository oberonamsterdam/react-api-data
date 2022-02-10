import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Binding, EndpointParams, HookOptions } from './types';
import { BindingsStore } from './helpers/createBinding';
import { shouldAutoTrigger } from './withApiData';
import { State } from './reducer';
import shallowEqual from 'shallowequal';
import { getRequestKey } from './helpers/getRequestKey';
import { getLoadingPromise } from './actions/performRequest';
import { getIsSSR } from './helpers/getIsSSR';

// the hook should call perform when shouldAutoTrigger and:
// - the component gets mounted
// - the params have changed
// - the endpoint has changed
// - the call has been invalidated (networkStatus is ready)

const useApiData = <T, F = unknown, Params extends EndpointParams = EndpointParams, Body = any>(endpointKey: string, params?: Params, options?: HookOptions): Binding<T, F, Params, Body> => {
    const {
        instanceId,
        // we auto detect a SSR environment. If we are on SSR, we will immediately execute the request during every render(!)
        isSSR = getIsSSR(),
        ...config
    } = options ?? {};
    const bindingsStore = useRef<BindingsStore>(new BindingsStore());
    const prevParams = useRef<Params>();
    const prevEndpointKey = useRef<string>();
    const apiData: State = useSelector((state: { apiData: State }) => state.apiData);
    const autoTrigger = config.autoTrigger ?? shouldAutoTrigger(apiData, endpointKey);
    const dispatch = useDispatch();
    const binding: Binding<T, F> = bindingsStore.current.getBinding(
        endpointKey,
        params,
        dispatch,
        instanceId,
        apiData,
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

    const enableSuspense = config.enableSuspense ?? apiData.endpointConfig[endpointKey].enableSuspense ?? apiData.globalConfig.enableSuspense ?? false;
    if (enableSuspense && networkStatus === 'loading') {
        const requestKey = getRequestKey(endpointKey, params || {}, instanceId);
        const promise = getLoadingPromise(requestKey);
        if (promise) {
            throw promise;
        }
    }

    return binding;
};

export default useApiData;
