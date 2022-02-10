import { FC } from 'react';
import { useGetArticle } from './generated/apiData';

interface OwnProps {
    articleId: number;
}

const Article: FC<OwnProps> = ({articleId}) => {
    const article = useGetArticle({ articleId });

    switch (article.request.networkStatus) {
        case 'loading':
            return <>Loading...</>;
        case 'failed':
            return <>Something went wrong :(</>;
        case 'success': {
            return (
                <div>
                    <h1>{article.data?.title}</h1>
                    <em>{article.data?.author.name}</em>
                    <br />
                    {article.data?.body}
                </div>
            );
        }
        default:
            return null;
    }
};

export default Article;
