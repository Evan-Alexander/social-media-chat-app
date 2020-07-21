import React, { useEffect, useContext, useState } from "react";
import Page from "./Page";
import ProfilePosts from "./ProfilePosts";
import ProfileFollowers from "./ProfileFollowers";
import ProfileFollowing from "./ProfileFollowing";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import axios from "axios";
import StateContext from "../StateContext";
import { useImmer } from "use-immer";
import NotFound from "./NotFound";

function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" },
    },
    notFound: false,
  });

  useEffect(() => {
    const request = axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await axios.post(
          `/profile/${username}`,
          { token: appState.user.token },
          { cancelToken: request.token }
        );
        setState((draft) => {
          if (response.data) {
            draft.profileData = response.data;
          } else {
            draft.notFound = true;
          }
        });
      } catch (e) {
        console.log("There was a problem.");
      }
    }
    fetchData();
    return () => {
      request.cancel();
    };
  }, [username]);

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });

      const request = axios.CancelToken.source();

      async function fetchData() {
        try {
          const response = await axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            { token: appState.user.token },
            { cancelToken: request.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
        } catch (e) {
          console.log("There was a problem.");
        }
      }
      fetchData();
      return () => {
        request.cancel();
      };
    }
  }, [state.startFollowingRequestCount]);

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });

      const request = axios.CancelToken.source();

      async function fetchData() {
        try {
          const response = await axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            {
              cancelToken: request.token,
            }
          );
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (e) {
          console.log("There was a problem.");
        }
      }
      fetchData();
      return () => {
        request.cancel();
      };
    }
  }, [state.stopFollowingRequestCount]);

  const startFollowing = () => {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  };

  const stopFollowing = () => {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  };
  if (state.notFound) {
    return (
      <Page title="Profile not found!">
        <NotFound />
      </Page>
    );
  }

  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />{" "}
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "..." && (
            <button
              onClick={startFollowing}
              disabled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "..." && (
            <button
              onClick={stopFollowing}
              disabled={state.followActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Stop Following <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className="nav-item nav-link"
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className="nav-item nav-link"
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className="nav-item nav-link"
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollowers />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollowing />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
