import { useEffect, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ApiDataBinding, EndpointParams } from './types';
import { BindingsStore } from './helpers/createApiDataBinding';
import { shouldAutoTrigger } from './withApiData';
import { ApiDataState } from './reducer';
import { getActions } from './actions/performApiDataRequest';

type UseApiDataHook = <T>(endpointKey: string, params?: EndpointParams, instanceId?: string) => ApiDataBinding<T>;

const useApiData: UseApiDataHook = <T>(endpointKey: string, params?: EndpointParams, instanceId: string = '') => {
    const dispatch = useDispatch();
    const bindingsStore = useRef<BindingsStore>(new BindingsStore(getActions(dispatch)));
    const apiData: ApiDataState = useSelector((state: { apiData: ApiDataState }) => state.apiData);
    const autoTrigger = shouldAutoTrigger(apiData, endpointKey);
    const binding: ApiDataBinding<T> = bindingsStore.current.getBinding(endpointKey, params, instanceId, apiData);
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
