import React, { useEffect, useState, useContext } from "react";
import DispatchContext from "../DispatchContext";
import axios from "axios";

function HeaderLoggedOut(props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const appDispatch = useContext(DispatchContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/login", {
        username,
        password,
      });
      if (response.data) {
        appDispatch({ type: "LOGIN", payload: response.data });
        appDispatch({
          type: "FLASHMESSAGE",
          payload: "You have successfully logged in.",
        });
      } else {
        appDispatch({
          type: "FLASHMESSAGE",
          payload: "Incorrect username / password",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            name="username"
            className="form-control form-control-sm input-dark"
            type="text"
            placeholder="Username"
            autoComplete="off"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            name="password"
            className="form-control form-control-sm input-dark"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="col-md-auto">
          <button className="btn">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
