// @flow

import { type ComponentType } from 'react';

type GetParams<TPropName> = (
    ownProps: any,
    state: any
) => any;
export type WithApiDataChildProps<TPropNames> = any;

/**
 * Binds api data to component props and automatically triggers loading of data if it hasn't been loaded yet. The wrapped
 * component will get a Binding added to each property key of the bindings param.
 * @param bindings - maps prop names to endpoint keys
 * @param getParams - optionally provide the params of the endpoint
 * @returns  - Function to wrap your component
 * @example  withApiData({
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
declare export default function withApiData (
    bindings: any,
    getParams?: GetParams<any>
): (
    WrappedComponent: ComponentType<any>
) => ComponentType<any>;
