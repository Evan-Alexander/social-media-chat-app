import React, { useEffect, useState, useContext } from "react";
import ReactMarkdown from "react-markdown";
import ReactToolTip from "react-tooltip";
import Page from "./Page";
import NotFound from "./NotFound";
import LoadingIcon from "./LoadingIcon";
import axios from "axios";
import { useParams, Link, withRouter } from "react-router-dom";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    const request = axios.CancelToken.source();
    const fetchPost = async () => {
      try {
        // Send request cancelToken as second argument in get request.
        // If this was a post request, we'd send this as the third argument
        const response = await axios.get(`/post/${id}`, {
          cancelToken: request.token,
        });
        setPost(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPost();
    // Cleanup axios request when the component is no longer being used.
    return () => {
      request.cancel();
    };
    // If we perform a search for a new post while in this component, we need to establish
    // a watch for a changed post id for the useEffect function to run again and display the
    // selected post
  }, [id]);

  // If loading has finished and no post was found ...
  if (!isLoading && !post) {
    return <NotFound />;
  }
  if (isLoading) {
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    );
  }

  const date = new Date(post.createdDate);
  const dateFormatted = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  const isOwner = () => {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  };

  const handleDelete = async () => {
    const areYouSure = window.confirm(
      "Are you sure you really want to delete this post?"
    );
    if (areYouSure) {
      try {
        const response = await axios.delete(`/post/${id}`, {
          data: { token: appState.user.token },
        });
        if (response.data == "Success") {
          // 1. Display a flash message
          appDispatch({
            type: "FLASHMESSAGE",
            payload: "Post was successfully deleted.",
          });
          // 2. Redirect back to the current user's profile
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (error) {
        console.log("there was a problem");
      }
    }
  };
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tip="Edit"
              data-for="edit"
              className="text-primary mr-3"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactToolTip id="edit" className="custom-tooltip" />
            <a
              data-tip="Delete"
              data-for="delete"
              className="delete-post-button text-danger"
              onClick={handleDelete}
            >
              <i className="fas fa-trash"></i>
            </a>
            <ReactToolTip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{" "}
        on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown
          source={post.body}
          allowedTypes={[
            "paragraph",
            "strong",
            "emphasis",
            "text",
            "heading",
            "list",
            "listItem",
          ]}
        />
      </div>
    </Page>
  );
}

export default withRouter(ViewSinglePost);
