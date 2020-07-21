import React, { useEffect, useContext } from "react";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import { Link } from "react-router-dom";
import ReactToolTip from "react-tooltip";

function HeaderLoggedIn(props) {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const handleLogOut = () => {
    appDispatch({ type: "LOGOUT" });
    appDispatch({
      type: "FLASHMESSAGE",
      payload: "You have successfully logged out.",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    appDispatch({ type: "OPEN_SEARCH" });
  };
  return (
    <div className="flex-row my-3 my-md-0">
      <a
        onClick={handleSearch}
        href="#"
        className="text-white mr-3 header-search-icon"
      >
        <i className="fas fa-search"></i>
      </a>
      <span
        onClick={() => appDispatch({ type: "TOGGLE_CHAT" })}
        className={`mr-3 header-chat-icon ${
          appState.unReadChatCount ? "text-danger" : "text-white"
        }`}
      >
        <i className="fas fa-comment"></i>
        <span className="chat-count-badge text-white">
          {appState.unReadChatCount < 10 ? appState.unReadChatCount : "9+"}{" "}
        </span>
      </span>
      <Link
        data-for="profile"
        data-tip="My Profile"
        to={`/profile/${appState.user.username}`}
        href="#"
        className="mr-3"
      >
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactToolTip place="bottom" id="profile" className="custom-tooltip" />
      <Link className="btn mr-3" to="/create-post">
        Create Post
      </Link>
      <button onClick={handleLogOut} className="btn">
        Sign Out
      </button>
    </div>
  );
}

export default HeaderLoggedIn;
