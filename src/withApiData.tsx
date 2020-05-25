import React from 'react';
import { Binding, DataRequest, EndpointParams, Actions } from './types';
import { connect, ConnectedComponent } from 'react-redux';
import { State } from './reducer';
import { Action } from './reducer';
import hoistNonReactStatic from 'hoist-non-react-statics';
import shallowEqual from 'shallowequal';
import { ThunkDispatch } from 'redux-thunk';
import { BindingsStore } from './helpers/createBinding';
import { getActions } from './helpers/getActions';
import { getRequest } from './selectors/getRequest';
import { performApiRequest } from './actions/performRequest';

type GetParams<TPropName extends string> = (
    ownProps: any,
    state: any
) => { [paramName in TPropName]?: EndpointParams | EndpointParams[] };

interface WithApiDataParams {
    [paramName: string]: EndpointParams | EndpointParams[];
}

export interface WithApiDataProps {
    apiData: State;
    params: WithApiDataParams;
    dispatch: ThunkDispatch<{ apiData: State }, void, Action>;
}

export type WithApiDataBindingProps<TPropNames extends string> = {
    [k in TPropNames]: Binding<any> | Array<Binding<any>>;
};

export interface ActionProp {
    apiDataActions: Actions;
}

export type WithApiDataChildProps<TPropNames extends string> = WithApiDataBindingProps<TPropNames> & ActionProp;

type BindingPropNameBindingsStore<TPropNames extends string> = {
    [k in TPropNames]: BindingsStore;
};

export const shouldPerformApiRequest = (
    newProps: WithApiDataProps,
    oldProps: WithApiDataProps,
    bindings: { [propName in string]: string },
    bindingKey: string
) => {
    const keyParamsHaveChanged = (key: string) => !shallowEqual(newProps.params[key], oldProps.params[key]);
    const getApiDataRequest = (props: WithApiDataProps, key: string) =>
        getRequest(props.apiData, bindings[key], props.params[key] as EndpointParams);
    const hasBeenInvalidated = (oldRequest?: DataRequest, newRequest?: DataRequest) =>
        !!oldRequest && oldRequest.networkStatus !== 'ready' && !!newRequest && newRequest.networkStatus === 'ready';
    const apiDataChanged = newProps.apiData !== oldProps.apiData;
    return (
        (keyParamsHaveChanged(bindingKey) && shouldAutoTrigger(newProps.apiData, bindings[bindingKey]) === true) ||
        (apiDataChanged &&
            hasBeenInvalidated(getApiDataRequest(oldProps, bindingKey), getApiDataRequest(newProps, bindingKey)) &&
            shouldAutoTrigger(newProps.apiData, bindings[bindingKey]) === true) ||
        (apiDataChanged &&
            shouldAutoTrigger(oldProps.apiData, bindings[bindingKey]) === false &&
            shouldAutoTrigger(newProps.apiData, bindings[bindingKey]) === true)
    );
};

export const shouldAutoTrigger = (apiData: State, endpointKey: string) => {
    const endpointConfig = apiData.endpointConfig[endpointKey];
    return (
        endpointConfig.autoTrigger ??
        apiData.globalConfig.autoTrigger ??
        (endpointConfig && endpointConfig.method === 'GET')
    );
};

/**
 * Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped
 * component will get an Binding added to each property key of the bindings param.
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

export default function withApiData<TChildProps extends WithApiDataChildProps<TPropNames>, TPropNames extends string>(
    bindings: { [propName in TPropNames]: string },
    getParams?: GetParams<TPropNames>
) {
    // note: return type ComponentType<TChildProps> and ComponentClass<TChildProps> have been replaced with <any> because
    // these generics don't support the new feature of params array with array of Binding as a result
    return (
        WrappedComponent: React.ComponentType<any>
    ): ConnectedComponent<React.ComponentClass<any>, WithApiDataChildProps<TPropNames>> => {
        class WithApiData extends React.Component<WithApiDataProps> {
            static displayName = `WithApiData(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
            // keep track of binding instances (each propName can have multiple bindings through getInstance)
            bindingPropNameBindingsStore: BindingPropNameBindingsStore<TPropNames> = {} as BindingPropNameBindingsStore<
                TPropNames
            >;

            componentDidMount() {
                this.fetchDataIfNeeded();
            }

            componentDidUpdate(prevProps: WithApiDataProps, prevState: State) {
                // automatically fetch when parameters change or re-fetch when a request gets invalidated
                Object.keys(bindings).forEach((bindingKey: TPropNames) => {
                    if (Array.isArray(prevProps.params[bindingKey])) {
                        const paramsArray: EndpointParams[] = prevProps.params[bindingKey] as EndpointParams[];
                        paramsArray.forEach((params, index) => {
                            if (shouldPerformApiRequest(
                                { ...this.props as WithApiDataProps, params: { [bindingKey]: (this.props.params[bindingKey] as EndpointParams[])[index] } },
                                { ...prevProps as WithApiDataProps, params: { [bindingKey]: params } },
                                bindings,
                                bindingKey
                            )) {
                                this.props.dispatch(performApiRequest(bindings[bindingKey], params, undefined, index.toString()));
                            }
                        });
                    } else {
                        if (shouldPerformApiRequest(this.props, prevProps, bindings, bindingKey)) {
                            this.props.dispatch(performApiRequest(bindings[bindingKey], this.props.params[bindingKey] as EndpointParams));
                        }
                    }
                });
            }

            getBinding(
                endpointKey: string,
                params: EndpointParams,
                dispatch: ThunkDispatch<{ apiData: State }, void, Action>,
                propName: keyof BindingPropNameBindingsStore<TPropNames>,
                instanceId: string = '',
                apiData: State
            ): Binding<any> {
                // check if we already have an instance of this bindingStore
                let propNameBindingsStore: BindingsStore = this.bindingPropNameBindingsStore[propName];
                if (propNameBindingsStore === undefined) {
                    propNameBindingsStore = new BindingsStore();
                    this.bindingPropNameBindingsStore[propName] = propNameBindingsStore;
                }
                return propNameBindingsStore.getBinding(endpointKey, params, dispatch, instanceId, apiData);
            }

            fetchDataIfNeeded() {
                const { params, dispatch } = this.props;

                Object.keys(bindings).forEach((propName: TPropNames) => {
                    const endpointKey = bindings[propName];

                    if (shouldAutoTrigger(this.props.apiData, endpointKey)) {
                        // performApiRequest will check if fetch is needed
                        if (Array.isArray(params[propName])) {
                            const paramsArray: EndpointParams[] = params[propName] as EndpointParams[];
                            paramsArray.forEach((propNameParams, index) => {
                                dispatch(
                                    performApiRequest(
                                        endpointKey,
                                        propNameParams,
                                        undefined,
                                        index.toString(),
                                        this.bindingPropNameBindingsStore[propName]
                                    )
                                );
                            });
                        } else {
                            dispatch(
                                performApiRequest(
                                    endpointKey,
                                    params[propName] as EndpointParams,
                                    undefined,
                                    '',
                                    this.bindingPropNameBindingsStore[propName]
                                )
                            );
                        }
                    }
                });
            }

            render() {
                const { apiData, params, dispatch, ...componentProps } = this.props;

                const addProps: WithApiDataBindingProps<string> = {};

                Object.keys(bindings).forEach((propName: TPropNames) => {
                    const endpointKey: string = bindings[propName];
                    if (Array.isArray(params[propName])) {
                        const paramsArray: EndpointParams[] = params[propName] as EndpointParams[];
                        addProps[propName] = paramsArray.map((propNameParams, index) =>
                            this.getBinding(
                                endpointKey,
                                propNameParams,
                                dispatch,
                                propName,
                                index.toString(),
                                apiData
                            )
                        );
                    } else {
                        addProps[propName] = this.getBinding(
                            endpointKey,
                            params[propName] as EndpointParams,
                            dispatch,
                            propName,
                            '',
                            apiData
                        );
                    }
                });
                const apiDataActions: Actions = getActions(dispatch);

                return <WrappedComponent {...componentProps} {...addProps} apiDataActions={apiDataActions} />;
            }
        }
        hoistNonReactStatic<any, React.ComponentType<WithApiDataChildProps<TPropNames>>>(WithApiData, WrappedComponent); // move static methods to wrapper

        return connect((state: { apiData: State }, ownProps: TChildProps) => ({
            params:
                typeof getParams === 'function' ? (getParams(ownProps, state) as Required<GetParams<TPropNames>>) : {},
            apiData: state.apiData
        }))(WithApiData);
    };
}
