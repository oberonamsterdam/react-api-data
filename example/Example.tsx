import React, { Fragment, SFC } from 'react';
import { ApiDataBinding, withApiData } from '../src';

/**
 * This file mostly exists just to test if the typing is working correctly.
 * TODO: turn this into an actual example project at some point and/or replace this with unit tests.
 */

interface OwnProps {
    article: ApiDataBinding<{
        title: string;
        author: { name: string; };
        body: string;
    }>;
    articleId: number;
}

const connectApiData = withApiData(
    {
        // specify property name and endpoint
        article: 'getArticle'
    },
    (ownProps: OwnProps, state: any) => ({
        // provide URL parameters
        article: { articleId: ownProps.articleId, userId: state.userId || '' }
    })
);

const Example: SFC<OwnProps> = (props) => {
    const article = props.article.data;
    if (!article) {
        return null;
    }

    switch (props.article.request.networkStatus) {
        case 'loading':
            return <Fragment>Loading...</Fragment>;
        case 'failed':
            return <Fragment>Something went wrong :(</Fragment>;
        case 'success': {
            return (
                <div>
                    <h1>{article.title}</h1>
                    <em>{article.author.name}</em><br />
                    {article.body}
                </div>
            );
        }
        default:
            return null;
    }
};

export default connectApiData(Example);