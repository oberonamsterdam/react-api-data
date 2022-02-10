import { Method } from "react-api-data";

const getUrl = (path: string) => `http://www.mocky.io/v2/5a0c203e320000772de9664c${path}`;
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