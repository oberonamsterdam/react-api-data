import React from 'react';
import { ApiDataRequest, EndpointParams } from './index';
import { connect } from 'react-redux';
import { ApiDataState, getApiDataRequest, getResultData, performApiRequest } from './reducer';
import hoistNonReactStatic from 'hoist-non-react-statics';
import shallowEqual from 'shallowequal';

type GetParams<TPropName extends string> = (ownProps: any, state: any) => { [paramName in TPropName]?: EndpointParams }

type WithApiDataParams = { [paramName: string]: EndpointParams }

interface WithApiDataProps {
    apiData: ApiDataState,
    params: WithApiDataParams,
    dispatch: Function,
}

export type WithApiDataChildProps<TPropNames extends string> = {
    [k in TPropNames]: {
        request: ApiDataRequest,
        data?: any;
    };
}

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
    return function (WrappedComponent: React.ComponentType<TChildProps>): React.ComponentType<TChildProps> {
        class WithApiData extends React.Component<WithApiDataProps> {
            static displayName = `WithApiData(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

            componentDidMount() {
                this.fetchDataIfNeeded();
            }

            componentWillReceiveProps(newProps: WithApiDataProps) {
                // automatically fetch when parameters change or re-fetch when a request gets invalidated
                const keyParamsHaveChanged = (bindingKey: TPropNames) => !shallowEqual(newProps.params[bindingKey], this.props.params[bindingKey]);
                const getRequest = (props: any, bindingKey: TPropNames) => getApiDataRequest(props.apiData, bindings[bindingKey], props.params[bindingKey]);
                const hasBeenInvalidated = (oldRequest?: ApiDataRequest, newRequest?: ApiDataRequest) =>
                    !!oldRequest && oldRequest.networkStatus === 'success' && !!newRequest && newRequest.networkStatus === 'ready';
                const apiDataChanged = newProps.apiData !== this.props.apiData;

                Object.keys(bindings).forEach((bindingKey: TPropNames) => {
                    if (keyParamsHaveChanged(bindingKey) || (apiDataChanged && hasBeenInvalidated(getRequest(this.props, bindingKey), getRequest(newProps, bindingKey)))) {
                        this.props.dispatch(performApiRequest(bindings[bindingKey], newProps.params[bindingKey]));
                    }
                });
            }

            fetchDataIfNeeded() {
                const { params, dispatch } = this.props;

                Object.keys(bindings).forEach((propName: TPropNames) => {
                    const endpointKey = bindings[propName];

                    // performApiRequest will check if fetch is needed
                    dispatch(performApiRequest(endpointKey, params[propName]));
                });
            }

            render() {
                const { apiData, params, dispatch, ...componentProps } = this.props;
                const props: WithApiDataChildProps<TPropNames> =
                    Object.assign({},
                        ...Object.keys(bindings)
                            .map((propName: TPropNames) => {
                                const endpointKey = bindings[propName];
                                return {
                                    data: getResultData(apiData, endpointKey, params[propName]),
                                    request: getApiDataRequest(apiData, endpointKey, params[propName]) || {
                                        networkStatus: 'ready',
                                        lastCall: 0,
                                        duration: 0,
                                        endpointKey
                                    }
                                };
                            })
                    );
                
                return <WrappedComponent {...componentProps} {...props} />;
            }
        }

        hoistNonReactStatic<any, WithApiDataChildProps<TPropNames>>(WithApiData, WrappedComponent); // move static methods to wrapper

        return connect((state: { apiData: ApiDataState }, ownProps: TChildProps) => ({
            params: typeof getParams === 'function' ? getParams(ownProps, state) as Required<GetParams<TPropNames>> : {},
            apiData: state.apiData
        }))(WithApiData);
    };
}

