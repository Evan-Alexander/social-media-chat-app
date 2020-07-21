import React, { useContext, useEffect } from "react";
import StateContext from "../StateContext";
import { useImmer } from "use-immer";
import axios from "axios";
import Page from "./Page";
import Post from "./Post";
import LoadingIcon from "./LoadingIcon";

function Home(props) {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  });

  useEffect(() => {
    const request = axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await axios.post(
          "/getHomeFeed",
          {
            token: appState.user.token,
          },
          {
            cancelToken: request.token,
          }
        );
        setState((draft) => {
          draft.isLoading = false;
          draft.feed = response.data;
        });
      } catch (e) {
        console.log("There was a problem.");
      }
    }
    fetchData();
    return () => {
      request.cancel();
    };
  }, []);

  if (state.isLoading) {
    return <LoadingIcon />;
  }
  return (
    <Page title="Your Feed">
      {state.feed.length && (
        <>
          <h2 className="text-center mb-4">Your Feed</h2>
          <div className="list-group">
            {state.feed.map((post) => {
              return <Post post={post} key={post._id} />;
            })}
          </div>
        </>
      )}
      {!state.feed.length && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If
            you don&rsquo;t have any friends to follow that&rsquo;s okay; you
            can use the &ldquo;Search&rdquo; feature in the top menu bar to find
            content written by people with similar interests and then follow
            them.
          </p>
        </>
      )}
    </Page>
  );
}

export default Home;
