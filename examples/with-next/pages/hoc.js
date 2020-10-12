import React from "react";
import { withApiData } from "react-api-data";

const Article = props => {
  const { article } = props;
  return (
    <>
      {article.request.networkStatus === "success" && (
        <div>
          <h1>{article.data.title}</h1>
          <p>{article.data.body}</p>
        </div>
      )}
      {article.request.networkStatus === "loading" && <div>Loading...</div>}
    </>
  );
};

export default withApiData(
  {
    article: "getArticle"
  },
  {
    article: {
      id: 1
    }
  }
)(Article);
