import React, { useContext, useEffect } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import axios from "axios";
import { Link } from "react-router-dom";
import Post from "./Post";

function Search() {
  const appDispatch = useContext(DispatchContext);

  // useImmer package allows us to provide an initial state object unique to the component
  // it also allows us to change one of the possible properties of the state object
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0,
  });

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);

    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler);
    };
  }, []);

  useEffect(() => {
    // if after you trim the whitespace and there is still some text ...
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        setState((draft) => {
          // We increase the count of the request to set up different useEffect function that watches for requestCount to change
          draft.requestCount++;
        });
      }, 750);
      // Cleanup function deletes the timeout triggered before time set in setTimeout and only executes after specified time
      return () => clearTimeout(delay);
    } else {
      setState((draft) => {
        draft.show = "neither";
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    if (state.requestCount) {
      const request = axios.CancelToken.source();
      const fetchResults = async () => {
        try {
          const response = await axios.post(
            "/search",
            { searchTerm: state.searchTerm },
            { cancelToken: request.token }
          );
          setState((draft) => {
            draft.results = response.data;
            draft.show = "results";
          });
        } catch (error) {
          console.log("There was a problem or the request was cancelled.");
        }
      };
      fetchResults();
      return () => request.cancel();
    }
  }, [state.requestCount]);

  const searchKeyPressHandler = (e) => {
    // Listen for esc. key
    if (e.keyCode == 27) {
      appDispatch({ type: "CLOSE_SEARCH" });
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setState((draft) => {
      draft.searchTerm = value;
    });
  };

  const handleCloseOverlay = () => {
    appDispatch({ type: "CLOSE_SEARCH" });
  };

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            onChange={handleInputChange}
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
          />
          <span
            onClick={() => appDispatch({ type: "CLOSE_SEARCH" })}
            className="close-live-search"
          >
            <i className="fas fa-times"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={`circle-loader ${
              state.show == "loading" ? "circle-loader--visible" : ""
            }`}
          ></div>
          <div
            className={`live-search-results ${
              state.show == "results" ? "live-search-results--visible" : ""
            }`}
          >
            <div className="list-group shadow-sm">
              <div className="list-group-item active">
                <strong>Search Results</strong> ({state.results.length}{" "}
                {state.results.length > 1 ? "items" : "item"} found)
              </div>
              {state.results.map((post) => {
                return (
                  <Post
                    post={post}
                    key={post._id}
                    onClick={() => appDispatch({ type: "closeSearch" })}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
