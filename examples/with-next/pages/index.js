import React from "react";
import { useApiData } from "react-api-data";

const Article = () => {
  const article = useApiData("getArticle", { id: 1 });
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

export default Article;
