import { useEffect, useRef } from 'react';
import { createApiDataBinding } from './helpers/createApiDataBinding';

import { useDispatch, useSelector } from 'react-redux';
import { ApiDataBinding, ApiDataState, EndpointParams } from './index';
import { BindingsStore } from './helpers/createApiDataBinding';
import { shouldAutoTrigger } from './withApiData';

type UseApiDataHook = <T>(endpointKey: string, params?: EndpointParams, instanceId?: string) => ApiDataBinding<T>;

const useApiData: UseApiDataHook = <T>(endpointKey: string, params?: EndpointParams, instanceId: string = '') => {
    const bindingsStore = useRef<BindingsStore>(new BindingsStore());
    const apiData: ApiDataState = useSelector((state: { apiData: ApiDataState }) => state.apiData);
    const autoTrigger = shouldAutoTrigger(apiData, endpointKey);
    const dispatch = useDispatch();
    const binding: ApiDataBinding<T> = createApiDataBinding(endpointKey, params, dispatch, bindingsStore.current, instanceId)(apiData);
    const request = binding.request;
    const networkStatus = request && request.networkStatus;
    useEffect(() => {
        if (autoTrigger && networkStatus === 'ready') {
            binding.perform(params);
        }
    },
              [endpointKey, params, autoTrigger, networkStatus ]
    );
    return binding;
};

export default useApiData;
