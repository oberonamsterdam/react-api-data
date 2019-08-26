import React from 'react';
import { ApiDataBinding, ApiDataRequest, EndpointParams } from './index';
import { connect } from 'react-redux';
import { ApiDataState } from './reducer';
import { getApiDataRequest, performApiRequest } from './index';
import { Action } from './reducer';
import hoistNonReactStatic from 'hoist-non-react-statics';
import shallowEqual from 'shallowequal';
import { ThunkDispatch } from 'redux-thunk';
import { BindingsStore } from './helpers/createApiDataBinding';

type GetParams<TPropName extends string> = (ownProps: any, state: any) => { [paramName in TPropName]?: EndpointParams | EndpointParams[] };

interface WithApiDataParams {
    [paramName: string]: EndpointParams | EndpointParams[];
}

export interface WithApiDataProps {
    apiData: ApiDataState;
    params: WithApiDataParams;
    dispatch: ThunkDispatch<{ apiData: ApiDataState }, void, Action>;
}

export type WithApiDataChildProps<TPropNames extends string> = {
    [k in TPropNames]: ApiDataBinding<any> | Array<ApiDataBinding<any>>;
};

type BindingPropNameBindingsStore<TPropNames extends string> = {
    [k in TPropNames]: BindingsStore;
};

export const shouldPerformApiRequest = (newProps: WithApiDataProps, oldProps: WithApiDataProps, bindings: { [propName in string]: string }, bindingKey: string) => {
    const keyParamsHaveChanged = (key: string) => !shallowEqual(newProps.params[key], oldProps.params[key]);
    const getRequest = (props: WithApiDataProps, key: string) => getApiDataRequest(props.apiData, bindings[key], props.params[key] as EndpointParams);
    const hasBeenInvalidated = (oldRequest?: ApiDataRequest, newRequest?: ApiDataRequest) =>
        !!oldRequest && oldRequest.networkStatus !== 'ready' && !!newRequest && newRequest.networkStatus === 'ready';
    const apiDataChanged = newProps.apiData !== oldProps.apiData;
    return (keyParamsHaveChanged(bindingKey)
        || (apiDataChanged && hasBeenInvalidated(getRequest(oldProps, bindingKey), getRequest(newProps, bindingKey)) && shouldAutoTrigger(newProps, bindings[bindingKey]) === true)) 
        || (apiDataChanged && shouldAutoTrigger(oldProps, bindings[bindingKey]) === false && shouldAutoTrigger(newProps, bindings[bindingKey]) === true);
};

export const shouldAutoTrigger = (props: WithApiDataProps, endpointKey: string) => {
    const endpointConfig = props.apiData.endpointConfig[endpointKey];
    const { autoTrigger } = {
        autoTrigger: endpointConfig && endpointConfig.method === 'GET',
        ...props.apiData.globalConfig,
        ...endpointConfig
    };
    return autoTrigger;
};

/**
 * Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped
 * component will get an ApiDataBinding added to each property key of the bindings param.
 * @param bindings - maps prop names to endpoint keys
 * @param [getParams] - optionally provide the params of the endpoint
 * @returns {Function} - Function to wrap your component
 * @example
 * withApiData({
 *    wishList: 'getWishLists',
 *    settings: 'getSettings'
 *  }, (ownProps, state) => ({
 *    wishList: {
 *      projectSlug: ownProps.match.params.projectSlug,
 *      env: ownProps.match.params.env
 *    },
 *    settings: {
 *      projectSlug: ownProps.match.params.projectSlug,
 *      env: ownProps.match.params.env
 *    }
 *  }))
 */

export default function withApiData<TChildProps extends WithApiDataChildProps<TPropNames>, TPropNames extends string>(bindings: { [propName in TPropNames]: string }, getParams?: GetParams<TPropNames>) {
    // note: return type ComponentType<TChildProps> and ComponentClass<TChildProps> have been replaced with <any> because
    // these generics don't support the new feature of params array with array of ApiDataBinding as a result
    return (WrappedComponent: React.ComponentType<any>): React.ComponentClass<any> => {
        class WithApiData extends React.Component<WithApiDataProps> {
            static displayName = `WithApiData(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
            // keep track of binding instances (each propName can have multiple bindings through getInstance)
            bindingPropNameBindingsStore: BindingPropNameBindingsStore<TPropNames> = {} as BindingPropNameBindingsStore<TPropNames>;

            componentDidMount() {
                this.fetchDataIfNeeded();
            }

            componentWillReceiveProps(newProps: WithApiDataProps) {
                // automatically fetch when parameters change or re-fetch when a request gets invalidated
                Object.keys(bindings).forEach((bindingKey: TPropNames) => {
                    if (Array.isArray(this.props.params[bindingKey])) {
                        const paramsArray: EndpointParams[] = this.props.params[bindingKey] as EndpointParams[];
                        paramsArray.forEach((params, index) => {
                            if (shouldPerformApiRequest({ ...newProps, params: { [bindingKey]: newProps.params[bindingKey] } }, { ...this.props as WithApiDataProps, params: { [bindingKey]: params } }, bindings, bindingKey)) {
                                this.props.dispatch(performApiRequest(bindings[bindingKey], params, undefined, index.toString()));
                            }
                        });
                    } else {
                        if (shouldPerformApiRequest(newProps, this.props, bindings, bindingKey)) {
                            this.props.dispatch(performApiRequest(bindings[bindingKey], newProps.params[bindingKey] as EndpointParams));
                        }
                    }
                });
            }

            getApiDataBinding(
                endpointKey: string, 
                params: EndpointParams, 
                dispatch: ThunkDispatch<{ apiData: ApiDataState }, void, Action>, 
                propName: keyof BindingPropNameBindingsStore<TPropNames>, 
                instanceId: string = ''
            ): ((apiData: ApiDataState, newApiDataRequest?: ApiDataRequest) => ApiDataBinding<any>) {
                // check if we already have an instance of this bindingStore
                let propNameBindingsStore: BindingsStore = this.bindingPropNameBindingsStore[propName];
                if (propNameBindingsStore === undefined) {
                    propNameBindingsStore = new BindingsStore();
                    this.bindingPropNameBindingsStore[propName] = propNameBindingsStore;
                } 
                return propNameBindingsStore.getBinding(endpointKey, params, dispatch, instanceId);
            }

            fetchDataIfNeeded() {
                const { params, dispatch } = this.props;

                Object.keys(bindings).forEach((propName: TPropNames) => {
                    const endpointKey = bindings[propName];

                    if (shouldAutoTrigger(this.props, endpointKey)) {
                        // performApiRequest will check if fetch is needed
                        if (Array.isArray(params[propName])) {
                            const paramsArray: EndpointParams[] = params[propName] as EndpointParams[];
                            paramsArray.forEach((propNameParams, index) => {
                                dispatch(performApiRequest(endpointKey, propNameParams, undefined, index.toString()));
                            });
                        } else {
                            dispatch(performApiRequest(endpointKey, params[propName] as EndpointParams));
                        }
                    }
                });
            }

            render() {
                const { apiData, params, dispatch, ...componentProps } = this.props;

                const addProps: WithApiDataChildProps<string> = {};

                Object.keys(bindings).forEach((propName: TPropNames) => {
                    const endpointKey: string = bindings[propName];
                    if (Array.isArray(params[propName])) {
                        const paramsArray: EndpointParams[] = (params[propName] as EndpointParams[]);
                        addProps[propName] = paramsArray.map((propNameParams, index) => this.getApiDataBinding(endpointKey, propNameParams, dispatch, propName, index.toString())(apiData));
                    } else {
                        addProps[propName] = this.getApiDataBinding(endpointKey, params[propName] as EndpointParams, dispatch, propName)(apiData);
                    }
                });

                return <WrappedComponent {...componentProps} {...addProps} />;
            }
        }

        hoistNonReactStatic<any, WithApiDataChildProps<TPropNames>>(WithApiData, WrappedComponent); // move static methods to wrapper

        return connect((state: { apiData: ApiDataState }, ownProps: TChildProps) => ({
            params: typeof getParams === 'function' ? getParams(ownProps, state) as Required<GetParams<TPropNames>> : {},
            apiData: state.apiData
        }))(WithApiData);
    };
}