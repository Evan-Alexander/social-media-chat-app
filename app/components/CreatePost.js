import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import axios from "axios";
import { withRouter } from "react-router-dom";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";

function CreatePost(props) {
  // const [title, setTitle] = useState();
  // const [body, setBody] = useState();
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const initialState = {
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
    submitCount: 0,
  };

  const formReducer = (draft, action) => {
    switch (action.type) {
      case "TITLE_IMMEDIATELY":
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        if (draft.title.value.length > 30) {
          draft.title.hasErrors = true;
          draft.title.message = "The title cannot exceed 30 characters.";
        }
        if (
          draft.title.value &&
          !/^([a-zA-Z0-9_ .!?\\-\\$%#&]+)$/.test(draft.title.value)
        ) {
          draft.title.hasErrors = true;
          draft.title.message =
            "The title can only contain letters and numbers.";
        }
        return;
      case "TITLE_AFTER_DELAY":
        if (draft.title.value.length < 3) {
          draft.title.hasErrors = true;
          draft.title.message = "Your title must be at least 3 characters.";
        }
        return;

      case "BODY_IMMEDIATELY":
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        if (draft.title.value.length > 250) {
          draft.title.hasErrors = true;
          draft.title.message = "The title cannot exceed 250 characters.";
        }
        return;
      case "BODY_AFTER_DELAY":
        if (draft.body.value.length < 3) {
          draft.body.hasErrors = true;
          draft.body.message = "Your conent must be at least 3 characters.";
        }
        return;
      case "SUBMIT_FORM":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.submitCount++;
        }
        return;
    }
  };

  const [state, dispatch] = useImmerReducer(formReducer, initialState);

  useEffect(() => {
    if (state.title.value) {
      const delay = setTimeout(
        () => dispatch({ type: "TITLE_AFTER_DELAY" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.title.value]);

  useEffect(() => {
    if (state.body.value) {
      const delay = setTimeout(
        () => dispatch({ type: "BODY_AFTER_DELAY" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.body.value]);

  useEffect(() => {
    if (state.submitCount) {
      const request = axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const response = await axios.post("/create-post", {
            title: state.title.value,
            body: state.body.value,
            token: appState.user.token,
          });
          // Redirect to new post url
          appDispatch({
            type: "FLASHMESSAGE",
            payload: "Congrats, you successfuly created a post!",
          });
          props.history.push(`/post/${response.data}`);
        } catch (e) {
          console.log("There was a problem.");
        }
      };
      fetchResults();
      return () => request.cancel();
    }
  }, [state.submitCount]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "TITLE_IMMEDIATELY", value: state.title.value });
    dispatch({
      type: "TITLE_AFTER_DELAY",
      value: state.title.value,
      noRequest: true,
    });
    dispatch({ type: "BODY_IMMEDIATELY", value: state.body.value });
    dispatch({
      type: "BODY_AFTER_DELAY",
      value: state.body.value,
      noRequest: true,
    });
    dispatch({ type: "SUBMIT_FORM" });
  }

  return (
    <Page title="Create New Post">
      <h1>Create Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onChange={(e) =>
              dispatch({
                type: "TITLE_IMMEDIATELY",
                value: e.target.value,
              })
            }
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
          />
          <CSSTransition
            in={state.title.hasErrors}
            timeout={330}
            classNames="liveValidateMessage"
            unmountOnExit
          >
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          </CSSTransition>
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onChange={(e) =>
              dispatch({
                type: "BODY_IMMEDIATELY",
                value: e.target.value,
              })
            }
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
          ></textarea>
          <CSSTransition
            in={state.body.hasErrors}
            timeout={330}
            classNames="liveValidateMessage"
            unmountOnExit
          >
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          </CSSTransition>
        </div>

        <button className="btn btn-signup">Save New Post</button>
      </form>
    </Page>
  );
}

export default withRouter(CreatePost);
