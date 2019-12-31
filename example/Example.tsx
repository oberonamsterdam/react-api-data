import React, { Fragment, SFC } from 'react';
import { ApiDataBinding, useApiData } from '../src';

interface OwnProps {
    articleId: number;
}

interface Article {
    title: string;
    author: { name: string; };
    body: string;
}
const Example: SFC<OwnProps> = (props) => {
    const article: ApiDataBinding<Article> = useApiData('getArticle', { articleId: props.articleId });
    if (!article) {
        return null;
    }

    switch (article.request.networkStatus) {
        case 'loading':
            return <Fragment>Loading...</Fragment>;
        case 'failed':
            return <Fragment>Something went wrong :(</Fragment>;
        case 'success': {
            return (
                <div>
                    <h1>{article.data?.title}</h1>
                    <em>{article.data?.author.name}</em><br />
                    {article.data?.body}
                </div>
            );
        }
        default:
            return null;
    }
};

export default Example;