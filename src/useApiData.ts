import { useEffect } from 'react';
import { getApiDataBinding } from './withApiData';
import { ApiDataState } from './reducer';
// import { useSelector } from 'react-redux';
import { ApiDataBinding, EndpointParams, performApiRequest } from './index';

type UseApiDataHook = (apiDataState: ApiDataState, endpointKey: string, params: EndpointParams) => ApiDataBinding<any>;

const useApiData: UseApiDataHook = (apiDataState, endpointKey, params) => {
    useEffect(() => {
        performApiRequest(endpointKey, params);

    },
              []
    );

    return getApiDataBinding(apiDataState, endpointKey, params);
};

export default useApiData;