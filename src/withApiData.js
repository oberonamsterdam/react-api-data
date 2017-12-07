// @flow

import React from 'react';
import type { ApiDataBinding, EndpointParams } from './index';
import { connect } from 'react-redux';
import { getApiDataRequest, getResultData, performApiRequest } from './reducer';
import hoistNonReactStatic from 'hoist-non-react-statics';
import type { ApiDataState } from '../lib/reducer';

type GetParams = (ownProps: Object, state: Object) => {[paramName: string]: EndpointParams}

type WithApiDataProps = {
    apiData: ApiDataState,
    params: {[paramName: string]: EndpointParams},
    dispatch: Function,
}

/**
 * Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped
 * component will get an ApiDataBinding added to each property key of the bindings param.
 * @param bindings - maps prop names to endpoint keys
 * @param [getParams] - optionally provide the params of the endpoint
 * @returns {Function} - Function to wrap your component
 * @example
 withApiData({
    wishList: 'getWishLists',
    settings: 'getSettings'
  }, (ownProps, state) => ({
    wishList: {
      projectSlug: ownProps.match.params.projectSlug,
      env: ownProps.match.params.env
    },
    settings: {
      projectSlug: ownProps.match.params.projectSlug,
      env: ownProps.match.params.env
    }
  }))
 */
export default function withApiData (bindings: {[propName: string]: string}, getParams?: GetParams) {
    return function (WrappedComponent: any) {
        class WithApiData extends React.Component<WithApiDataProps> {
            static displayName = `WithApiData(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`

            componentDidMount () {
                this.fetchDataIfNeeded();
            }

            componentWillReceiveProps (newProps: WithApiDataProps) {
                // automatically re-fetch when a request gets invalidated
                const getRequest = (props, propName) => getApiDataRequest(props.apiData, bindings[propName], props.params[propName]);
                const hasBeenInvalidated = (oldRequest, newRequest) =>
                    !!oldRequest && oldRequest.networkStatus === 'success' && !!newRequest && newRequest.networkStatus === 'ready';

                Object.keys(bindings).forEach(propName => {
                    if (hasBeenInvalidated(getRequest(this.props, propName), getRequest(newProps, propName))) {
                        this.props.dispatch(performApiRequest(bindings[propName], newProps.params[propName]));
                    }
                });
            }

            fetchDataIfNeeded () {
                const { params, dispatch } = this.props;

                Object.keys(bindings).forEach(propName => {
                    const endpointKey = bindings[propName];

                    // performApiRequest will check if fetch is needed
                    dispatch(performApiRequest(endpointKey, params[propName]));
                });
            }

            render () {
                const { apiData, params, dispatch, ...componentProps } = this.props;
                const props = {
                    ...componentProps
                };
                Object.keys(bindings).forEach(propName => {
                    const endpointKey = bindings[propName];
                    props[propName] = ({
                        data: getResultData(apiData, endpointKey, params[propName]),
                        request: getApiDataRequest(apiData, endpointKey, params[propName]) || {
                            networkStatus: 'ready',
                            lastCall: 0
                        }
                    }: ApiDataBinding<*>);
                });
                return <WrappedComponent {...props} />;
            }
        }

        hoistNonReactStatic(WithApiData, WrappedComponent); // move static methods to wrapper

        return connect((state: {apiData: ApiDataState}, ownProps: Object) => ({
            params: typeof getParams === 'function' ? getParams(ownProps, state) : {},
            apiData: state.apiData
        }))(WithApiData);
    };
}
