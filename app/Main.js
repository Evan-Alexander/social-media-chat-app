import React, { useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import axios from "axios";
axios.defaults.baseURL =
  process.env.BACKENDURL || "https://social-media-app999.herokuapp.com";

// Contexts
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

// My Components
import Header from "./components/Header";
import Home from "./components/Home";
import HomeGuest from "./components/HomeGuest";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
const CreatePost = React.lazy(() => import("./components/CreatePost"));
import ViewSinglePost from "./components/ViewSinglePost";
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
import Search from "./components/Search";

// Chat
const Chat = React.lazy(() => import("./components/Chat"));

import LoadingIcon from "./components/LoadingIcon";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("social-app-token")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("social-app-token"),
      username: localStorage.getItem("social-app-username"),
      avatar: localStorage.getItem("social-app-avatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unReadChatCount: 0,
  };

  // Reducer Using Immer
  const ourReducer = (draft, action) => {
    switch (action.type) {
      case "LOGIN":
        draft.loggedIn = true;
        draft.user = action.payload;
        return;
      case "LOGOUT":
        draft.loggedIn = false;
        return;
      case "FLASHMESSAGE":
        draft.flashMessages.push(action.payload);
        return;
      case "OPEN_SEARCH":
        draft.isSearchOpen = true;
        return;
      case "CLOSE_SEARCH":
        draft.isSearchOpen = false;
        return;
      case "TOGGLE_CHAT":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "CLOSE_CHAT":
        draft.isChatOpen = false;
        return;
      case "INCREMENT_CHAT_COUNT":
        draft.unReadChatCount++;
        return;
      case "CLEAR_CHAT_COUNT":
        draft.unReadChatCount = 0;
        return;
    }
  };

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("social-app-token", state.user.token);
      localStorage.setItem("social-app-username", state.user.username);
      localStorage.setItem("social-app-avatar", state.user.avatar);
    } else {
      localStorage.removeItem("social-app-token");
      localStorage.removeItem("social-app-username");
      localStorage.removeItem("social-app-avatar");
    }
  }, [state.loggedIn]);

  // Check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      const request = axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const response = await axios.post(
            "/checkToken",
            { token: state.user.token },
            { cancelToken: request.token }
          );
          if (!response.data) {
            dispatch({ type: "LOGOUT" });
            dispatch({
              type: "FLASHMESSAGE",
              payload: "Your session has expired. Please log in again.",
            });
          }
        } catch (error) {
          console.log("There was a problem or the request was cancelled.");
        }
      };
      fetchResults();
      return () => request.cancel();
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about-us">
                <About />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Suspense fallback="">
            {state.loggedIn && <Chat />}
          </Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
