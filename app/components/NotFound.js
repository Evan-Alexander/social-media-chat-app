import React from "react";
import Page from "./Page";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <Page title="Not Found">
      <div className="text-center">
        <h2>Whoops, we cannot find that page.</h2>
        <p className="lead text-muted">
          You can visit the <Link to="/">Homepage</Link> to start over
        </p>
      </div>
    </Page>
  );
}

export default NotFound;
