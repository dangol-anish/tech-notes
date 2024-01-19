import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { apiSlice } from "../app/api/apiSlice";

import { useSendLogoutMutation } from "../features/auth/authApiSlice";
import { logOut } from "../features/auth/authSlice";

const DASH_REGEX = /^\/dash(\/)?$/;
const NOTES_REGEX = /^\/dash\/notes(\/)?$/;
const USERS_REGEX = /^\/dash\/users(\/)?$/;

const DashHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const [sendLogout, { isLoading, isError, error }] = useSendLogoutMutation();

  const onLogoutClicked = async () => {
    try {
      // Trigger the logout mutation
      await sendLogout();

      dispatch(logOut());
      // setTimeout maybe

      setTimeout(() => {
        dispatch(apiSlice.util.resetApiState());
      }, 1000);

      // Navigate to "/"
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      // Handle errors if needed
    }
  };

  // useEffect(() => {
  //   if (isSuccess) navigate("/");
  // }, [isSuccess, navigate]);

  if (isLoading) return <p>Logging Out...</p>;

  if (isError) return <p>Error: {error.data?.message}</p>;

  let dashClass = null;
  if (
    !DASH_REGEX.test(pathname) &&
    !NOTES_REGEX.test(pathname) &&
    !USERS_REGEX.test(pathname)
  ) {
    dashClass = "dash-header__container--small";
  }

  const logoutButton = (
    <button className="icon-button" title="Logout" onClick={onLogoutClicked}>
      <FontAwesomeIcon icon={faRightFromBracket} />
    </button>
  );

  const content = (
    <header className="dash-header">
      <div className={`dash-header__container ${dashClass}`}>
        <Link to="/dash">
          <h1 className="dash-header__title">techNotes</h1>
        </Link>
        <nav className="dash-header__nav">
          {/* add more buttons later */}
          {logoutButton}
        </nav>
      </div>
    </header>
  );

  return content;
};
export default DashHeader;
