import React, { useEffect } from "react";

function Container(props) {
  return (
    <div
      className={"container wrapper " + (props.wide ? "" : "container--narrow")}
    >
      {props.children}
    </div>
  );
}

export default Container;
