# react-api-data

Automate calling external APIs and handling response data. Supports any API with JSON responses. Uses Fetch for
performing API requests, normalizr for handling response data and redux for storing data.

## Installation

`npm install react-api-data`

or

`yarn add react-api-data`

Make sure *fetch* is available globally, polyfill it if needed to support older environments.

## Quick usage

```js
import { withApiData } from 'react-api-data';
import { schema } from 'normalizr';
import createStore from './store';

// define normalizr response schemas

const authorSchema = new schema.Entity('Author')
const articleSchema = new schema.Entity('Article', {
    author: authorSchema
})

// define api endpoints

const endpointConfig = {
    getArticles: {
        url: 'https://yourapi/articles/:articleId/:userId',
        method: 'GET',
        responseSchema: ArticleSchema
    }
}

// dispatch configuration action before rendering components
const store = createStore()
store.dispatch(configureApiData(globalConfig, endpointConfig))

// bind api data to a component

const connectApiData = withApiData({
    // specify property name and endpoint
    articles: 'getArticle'
}, (ownProps, state) => ({
    // provide URL parameters
    article: {articleId: ownProps.articleId, userId: state.userId}
}));

const Article = (props) => {
    switch(props.articles.request.networkStatus) {
        case 'loading': return 'Loading...';
        case 'failed': return 'Something went wrong :(';
        case 'success': {
            const article = props.article.data;
            return (
                <div>
                    <h1>{article.title}</h1>
                    <em>{article.author.name}</em><br />
                    {article.body}
                </div>
            );
        }
        default: return null;
    }
};

export default connectApiData(Article);

```
