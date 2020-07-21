import React, { useEffect, useContext, useRef } from "react";
import { useImmer } from "use-immer";
import { Link } from "react-router-dom";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import io from "socket.io-client";

const Chat = () => {
  // useRef: explicitly tell React what to do. A react replacement for document.quersSelector() used in rare circumstances
  // You can mutate this directly.  Also, React will not re-render when its changed.
  const chatInput = useRef(null);
  const chatLog = useRef(null);
  const socket = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    chatValue: "",
    chatMessages: [],
  });
  // Establishing focus on Chat Input onOpen: The chat component will always remain connected to the chat server to get messages in real time.  Thus, the chat component is always mounted to the DOM.  Because of this we leverage a useEffect to fire when appState.isChatOpen changes AND THEN only if its true.
  useEffect(() => {
    if (appState.isChatOpen) {
      chatInput.current.focus();
      appDispatch({ type: "CLEAR_CHAT_COUNT" });
    }
  }, [appState.isChatOpen]);

  // Client listens to server for incoming chat messages
  useEffect(() => {
    socket.current = io(
      process.env.BACKENDURL || "https://social-media-app999.herokuapp.com"
    );
    socket.current.on("chatFromServer", (message) => {
      // When there is a new message from the server, add it to the chatMessages array
      setState((draft) => {
        draft.chatMessages.push(message);
      });
    });
    return () => socket.current.disconnect();
  }, []);

  // Chat box goes immediately scrolls to the bottom, showing the latest messages.
  // Increment unread chat count in header if there are messages && the chat window is closed
  // Listening for: everytime a new message is added to the chatMessages array
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "INCREMENT_CHAT_COUNT" });
    }
  }, [state.chatMessages]);

  const handleChatChange = (e) => {
    const value = e.target.value;
    setState((draft) => {
      draft.chatValue = value;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send message to the server
    socket.current.emit("chatFromBrowser", {
      message: state.chatValue,
      token: appState.user.token,
    });

    setState((draft) => {
      // Add message to state collection of messages
      draft.chatMessages.push({
        message: draft.chatValue,
        username: appState.user.username,
        avatar: appState.user.avatar,
      });
      draft.chatValue = "";
    });
  };

  return (
    <div
      id="chat-wrapper"
      className={`chat-wrapper shadow border-top border-left border-right ${
        appState.isChatOpen ? "chat-wrapper--is-visible" : ""
      }`}
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => appDispatch({ type: "CLOSE_CHAT" })}
          className="chat-title-bar-close"
        >
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          } else {
            return (
              <div key={index} className="chat-other">
                <Link to={`/profile/${message.username}`}>
                  <img className="avatar-tiny" src={message.avatar} />
                </Link>
                <div className="chat-message">
                  <div className="chat-message-inner">
                    <Link to={`/profile/${message.username}`}>
                      <strong>{message.username}: </strong>
                    </Link>
                    {` ${message.message}`}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        id="chatForm"
        className="chat-form border-top"
      >
        <input
          onChange={handleChatChange}
          ref={chatInput}
          value={state.chatValue}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default Chat;
