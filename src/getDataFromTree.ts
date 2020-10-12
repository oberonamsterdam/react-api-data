import { ReactNode } from 'react';
import { Store } from 'redux';
import { State } from './reducer';
import { DataRequest } from './types';

type RenderFn = (tree: ReactNode) => string;
const getDataFromTree = (
    tree: ReactNode,
    store: Store<{ apiData: State }>,
    renderFn: RenderFn = require('react-dom/server').renderToStaticMarkup,
) => {
    renderFn(tree);
    const { apiData } = store.getState();
    return Promise.all(Object.values(apiData.requests).map((request: DataRequest) => request.promise));
};

export default getDataFromTree;