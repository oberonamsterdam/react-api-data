import { ReactNode } from 'react';
import { Store } from 'redux';
import { getLoadingPromise } from './actions/performRequest';
import { State } from './reducer';

type RenderFn = (tree: ReactNode) => string;
const getDataFromTree = (
    tree: ReactNode,
    store: Store<{ apiData: State }>,
    renderFn?: RenderFn,
) => {
    const renderFunction = renderFn ?? require('react-dom/server').renderToStaticMarkup;
    renderFunction(tree);
    const { apiData } = store.getState();
    return Promise.all(Object.keys(apiData.requests).map((requestKey: string) => {
        const promise = getLoadingPromise(requestKey);
        return promise;
    }));
};

export default getDataFromTree;