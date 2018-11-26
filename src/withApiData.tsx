import React from 'react';
import { ApiDataRequest, EndpointParams } from './index';
import { connect } from 'react-redux';
import { ApiDataState } from './reducer';
import { getApiDataRequest, getResultData, performApiRequest } from './index';
import { Action } from './actions';
import hoistNonReactStatic from 'hoist-non-react-statics';
import shallowEqual from 'shallowequal';
import { ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';

type GetParams<TPropName extends string> = (ownProps: any, state: any) => { [paramName in TPropName]?: EndpointParams };

interface WithApiDataParams {
    [paramName: string]: EndpointParams;
}

export interface WithApiDataProps {
    apiData: ApiDataState;
    params: WithApiDataParams;
    dispatch: ActionCreator<ThunkAction<{}, { apiData: ApiDataState }, void, Action>>;
}

export type WithApiDataChildProps<TPropNames extends string> = {
    [k in TPropNames]: {
        request: ApiDataRequest,
        data?: any;
    };
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

export const shouldPerformApiRequest = (newProps: WithApiDataProps, oldProps: WithApiDataProps, bindings: { [propName in string]: string }, bindingKey: string) => {
    const keyParamsHaveChanged = (key: string) => !shallowEqual(newProps.params[key], oldProps.params[key]);
    const getRequest = (props: WithApiDataProps, key: string) => getApiDataRequest(props.apiData, bindings[key], props.params[key]);
    const hasBeenInvalidated = (oldRequest?: ApiDataRequest, newRequest?: ApiDataRequest) =>
        !!oldRequest && oldRequest.networkStatus !== 'ready' && !!newRequest && newRequest.networkStatus === 'ready';
    const apiDataChanged = newProps.apiData !== oldProps.apiData;
    return (keyParamsHaveChanged(bindingKey) || (apiDataChanged && hasBeenInvalidated(getRequest(oldProps, bindingKey), getRequest(newProps, bindingKey))));
};

export default function withApiData<TChildProps extends WithApiDataChildProps<TPropNames>, TPropNames extends string>(bindings: { [propName in TPropNames]: string }, getParams?: GetParams<TPropNames>) {
    return (WrappedComponent: React.ComponentType<TChildProps>): React.ComponentType<TChildProps> => {
        class WithApiData extends React.Component<WithApiDataProps> {
            static displayName = `WithApiData(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

            componentDidMount() {
                this.fetchDataIfNeeded();
            }

            componentWillReceiveProps(newProps: WithApiDataProps) {
                // automatically fetch when parameters change or re-fetch when a request gets invalidated
                Object.keys(bindings).forEach((bindingKey: TPropNames) => {
                    if (shouldPerformApiRequest(newProps, this.props, bindings, bindingKey)) {
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
                    Object.assign({}, ...Object.keys(bindings)
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