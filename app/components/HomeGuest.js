import React, { useState, useContext, useEffect } from "react";
import DispatchContext from "../DispatchContext";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import Page from "./Page";
import axios from "axios";

function HomeGuest() {
  const appDispatch = useContext(DispatchContext);

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    password: {
      value: "",
      hasErrors: false,
      message: "",
    },
    submitCount: 0,
  };

  const formReducer = (draft, action) => {
    switch (action.type) {
      case "USERNAME_IMMEDIATELY":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true;
          draft.username.message = "Username cannot exceed 30 characters.";
        }
        if (
          draft.username.value &&
          !/^([a-zA-Z0-9]+)$/.test(draft.username.value)
        ) {
          draft.username.hasErrors = true;
          draft.username.message =
            "Username can only contain letters and numbers.";
        }
        return;
      case "USERNAME_AFTER_DELAY":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.message = "Username must be at least 3 characters.";
        }
        // only alter the checkCount to fire the useEffect 'check if unique' function if noRequest is false
        if (!draft.hasErrors && !action.noRequest) {
          draft.username.checkCount++;
        }
        return;
      case "USERNAME_UNIQUE_RESULTS":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = "That username is already taken.";
        } else {
          draft.username.isUnique = true;
        }
        return;
      case "EMAIL_IMMEDIATELY":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        return;
      case "EMAIL_AFTER_DELAY":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "You must provide a valid email address.";
        }
        // only alter the checkCount to fire the useEffect 'check if unique' function if noRequest is false
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++;
        }
        return;
      case "EMAIL_UNIQUE_RESULTS":
        if (action.value) {
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = "That email is already being used.";
        } else {
          draft.email.isUnique = true;
        }
        return;
      case "PASSWORD_IMMEDIATELY":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "Password cannot exceed 50 characters.";
        }
        return;
      case "PASSWORD_AFTER_DELAY":
        if (draft.password.value.length < 7) {
          draft.password.hasErrors = true;
          draft.password.message = "Password must be at least 8 characters.";
        }
        return;
      case "SUBMIT_FORM":
        if (
          !draft.username.hasErrors &&
          draft.username.isUnique &&
          !draft.email.hasErrors &&
          draft.email.isUnique &&
          !draft.password.hasErrors
        ) {
          draft.submitCount++;
        }
        return;
    }
  };

  const [state, dispatch] = useImmerReducer(formReducer, initialState);

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(
        () => dispatch({ type: "USERNAME_AFTER_DELAY" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(
        () => dispatch({ type: "EMAIL_AFTER_DELAY" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(
        () => dispatch({ type: "PASSWORD_AFTER_DELAY" }),
        800
      );
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  useEffect(() => {
    if (state.username.checkCount) {
      const request = axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const response = await axios.post(
            "/doesUsernameExist",
            { username: state.username.value },
            { cancelToken: request.token }
          );
          dispatch({ type: "USERNAME_UNIQUE_RESULTS", value: response.data });
        } catch (error) {
          console.log("There was a problem or the request was cancelled.");
        }
      };
      fetchResults();
      return () => request.cancel();
    }
  }, [state.username.checkCount]);

  useEffect(() => {
    if (state.email.checkCount) {
      const request = axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const response = await axios.post(
            "/doesEmailExist",
            { email: state.email.value },
            { cancelToken: request.token }
          );
          dispatch({ type: "EMAIL_UNIQUE_RESULTS", value: response.data });
        } catch (error) {
          console.log("There was a problem or the request was cancelled.");
        }
      };
      fetchResults();
      return () => request.cancel();
    }
  }, [state.email.checkCount]);

  useEffect(() => {
    if (state.submitCount) {
      const request = axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const response = await axios.post(
            "/register",
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value,
            },
            { cancelToken: request.token }
          );
          appDispatch({ type: "LOGIN", payload: response.data });
          appDispatch({
            type: "FLASHMESSAGE",
            payload: "Congrats!  Welcome to your new account!",
          });
        } catch (error) {
          console.log("There was a problem or the request was cancelled.");
        }
      };
      fetchResults();
      return () => request.cancel();
    }
  }, [state.submitCount]);

  async function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "USERNAME_IMMEDIATELY", value: state.username.value });
    dispatch({
      type: "USERNAME_AFTER_DELAY",
      value: state.username.value,
      noRequest: true,
    });
    dispatch({ type: "EMAIL_IMMEDIATELY", value: state.email.value });
    dispatch({
      type: "EMAIL_AFTER_DELAY",
      value: state.email.value,
      noRequest: true,
    });
    dispatch({ type: "PASSWORD_IMMEDIATELY", value: state.password.value });
    dispatch({ type: "PASSWORD_AFTER_DELAY", value: state.password.value });
    // When we submit the form, we don't need to check if the username or email is unique because the other validation would have already checked for that.  This is why we set up a noRequest property.
    dispatch({ type: "SUBMIT_FORM" });
  }

  return (
    <Page title="Welcome!" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Message Place</h1>
          <p className="lead text-muted">Instant messaging is where its at.</p>
          <p className="lead text-muted">Why, because I said so.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input
                onChange={(e) =>
                  dispatch({
                    type: "USERNAME_IMMEDIATELY",
                    value: e.target.value,
                  })
                }
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
              />
              <CSSTransition
                in={state.username.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.username.message}
                </div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input
                onChange={(e) =>
                  dispatch({ type: "EMAIL_IMMEDIATELY", value: e.target.value })
                }
                id="email-register"
                name="email"
                className="form-control"
                type="text"
                placeholder="you@example.com"
                autoComplete="off"
              />
              <CSSTransition
                in={state.email.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.email.message}
                </div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input
                onChange={(e) =>
                  dispatch({
                    type: "PASSWORD_IMMEDIATELY",
                    value: e.target.value,
                  })
                }
                id="password-register"
                name="password"
                className="form-control"
                type="password"
                placeholder="Create a password"
              />
              <CSSTransition
                in={state.password.hasErrors}
                timeout={330}
                classNames="liveValidateMessage"
                unmountOnExit
              >
                <div className="alert alert-danger small liveValidateMessage">
                  {state.password.message}
                </div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-signup">
              Sign up for VirtualLives
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
