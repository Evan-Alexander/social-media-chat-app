import React, { useEffect, useContext } from "react";
import { useImmerReducer } from "use-immer";
import Page from "./Page";
import NotFound from "./NotFound";
import LoadingIcon from "./LoadingIcon";
import axios from "axios";
import { useParams, Link, withRouter } from "react-router-dom";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0, // useEffect will watch for this to fire the save Edit request
    notFound: false,
  };

  const editReducer = (draft, action) => {
    switch (action.type) {
      case "FETCH_COMPLETE":
        (draft.title.value = action.payload.title),
          (draft.body.value = action.payload.body),
          (draft.isFetching = false);
        return;
      case "TITLE_CHANGE":
        draft.title.hasErrors = false;
        draft.title.value = action.payload;
        return;
      case "BODY_CHANGE":
        draft.body.hasErrors = false;
        draft.body.value = action.payload;
        return;
      case "SUBMIT_REQUEST":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        return;
      case "SAVE_REQUEST_STARTED":
        draft.isSaving = true;
        return;
      case "SAVE_REQUEST_FINISHED":
        draft.isSaving = false;
        return;
      case "TITLE_RULES":
        if (!action.payload.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "You must provide a title";
        }
        return;
      case "BODY_RULES":
        if (!action.payload.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "You must provide some content.";
        }
        return;
      case "NOT_FOUND":
        draft.notFound = true;
        return;
    }
  };

  const [state, dispatch] = useImmerReducer(editReducer, originalState);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "TITLE_RULES", payload: state.title.value });
    dispatch({ type: "BODY_RULES", payload: state.body.value });
    dispatch({ type: "SUBMIT_REQUEST" });
  };

  useEffect(() => {
    const request = axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await axios.get(`/post/${state.id}`, {
          cancelToken: request.token,
        });
        if (response.data) {
          dispatch({ type: "fetchComplete", payload: response.data });
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: "FLASHMESSAGE",
              payload: "You do not have permission to edit that post.",
            });
            // redirect to homepage
            props.history.push("/");
          }
        } else {
          dispatch({ type: "NOT_FOUND" });
        }
      } catch (e) {
        console.log("There was a problem or the request was cancelled.");
      }
    }
    fetchPost();
    return () => {
      request.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "SAVE_REQUEST_STARTED" });
      const request = axios.CancelToken.source();
      const fetchPost = async () => {
        try {
          const response = await axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token,
            },
            {
              cancelToken: request.token,
            }
          );
          dispatch({ type: "SAVE_REQUEST_FINISHED" });
          appDispatch({
            type: "FLASHMESSAGE",
            payload: "Post successfully updated.",
          });
        } catch (error) {
          console.log(error);
        }
      };
      fetchPost();
      // Cleanup axios request when the component is no longer being used.
      return () => {
        request.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return <NotFound />;
  }
  if (state.isFetching) {
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    );
  }

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post
      </Link>
      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onChange={(e) =>
              dispatch({ type: "TITLE_CHANGE", payload: e.target.value })
            }
            value={state.title.value}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            onBlur={(e) =>
              dispatch({ type: "TITLE_RULES", payload: e.target.value })
            }
          />
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onChange={(e) =>
              dispatch({ type: "BODY_CHANGE", payload: e.target.value })
            }
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
            onBlur={(e) =>
              dispatch({ type: "BODY_RULES", payload: e.target.value })
            }
          />
          {state.body.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button disabled={state.isSaving} className="btn btn-primary">
          Edit Post
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
