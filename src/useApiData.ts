import { useEffect, useRef } from 'react';
import { createApiDataBinding } from './helpers/createApiDataBinding';

import { useDispatch, useSelector } from 'react-redux';
import { ApiDataBinding, ApiDataState, EndpointParams } from './index';
import { BindingsStore } from './helpers/createApiDataBinding';
import { shouldAutoTrigger } from './withApiData';

type UseApiDataHook = <T>(endpointKey: string, params?: EndpointParams, instanceId?: string) => ApiDataBinding<T>;

export const useApiData: UseApiDataHook = <T>(endpointKey: string, params?: EndpointParams, instanceId: string = '') => {
    const bindingsStore = useRef<BindingsStore>(new BindingsStore());
    const apiData: ApiDataState = useSelector((state: { apiData: ApiDataState }) => state.apiData);
    const autoTrigger = shouldAutoTrigger(apiData, endpointKey);
    const dispatch = useDispatch();
    const binding: ApiDataBinding<T> = createApiDataBinding(endpointKey, params, dispatch, instanceId, bindingsStore.current)(apiData);
    const request = binding.request;
    const networkStatus = request && request.networkStatus;
    useEffect(() => {
        if (autoTrigger && networkStatus === 'ready') {
            binding.perform(params, null);
        }
    },
              [endpointKey, params, autoTrigger, networkStatus ]
    );
    return binding;
};
