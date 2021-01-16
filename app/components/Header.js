import React, { useContext } from "react";
import { Link } from "react-router-dom";
import HeaderLoggedOut from "./HeaderLoggedOut";
import HeaderLoggedIn from "./HeaderLoggedIn";
import StateContext from "../StateContext";
function Header(props) {
  const appState = useContext(StateContext);
  // headerContent determines if the app shows loggedIn content or not
  // props.staticEmpty determines if the app should use the template to render a blank template while the app is loading
  
  const headerContent = appState.loggedIn ? (
    <HeaderLoggedIn />
  ) : (
    <HeaderLoggedOut />
  );
  return (
    <header className="header-bar bg-primary mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            VirtualLives!
          </Link>
        </h4>
        {!props.staticEmpty ? headerContent : null}
      </div>
    </header>
  );
}

export default Header;
