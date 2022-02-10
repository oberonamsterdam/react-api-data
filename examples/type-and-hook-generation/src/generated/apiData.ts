/**
 * Generated by orval v6.6.0 🍺
 * Do not edit manually.
 * articles
 * OpenAPI spec version: 1.0
 */
import {
  useApiData,
  HookOptions,
  Method
} from 'react-api-data'
import type {
  Article,
  ArticlePost
} from './types'


/**
 * Get Article by Article ID
 * @summary Get Article by Article ID
 */
export const useGetArticle = (
    params: {articleId: number}, options?: HookOptions 
) => useApiData<Article, void, {articleId: number}, unknown>('getArticle', params, options);

/**
 * Create a new article.
 * @summary Create New Article
 */
export const usePostArticle = (
    params: {} = {}, options?: HookOptions 
) => useApiData<Article, void, {}, ArticlePost>('postArticle', params, options);

const getUrl = (path: string) => `${path}`;
export const endpointConfig = {
    getArticle: {
        url: getUrl('/article/:articleId'),
        method: 'GET' as Method,
    },
    postArticle: {
        url: getUrl('/article'),
        method: 'POST' as Method,
    },
};
