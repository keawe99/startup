import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { logoutUser } from "./loginPage/loginService";
import LoginPage from "./loginPage/loginPage.jsx";
import AboutUs from "./aboutUs/aboutUs.jsx";
import SignUp from "./signUp/signUp.jsx";
import LandingPage from "./landingPage/landingPage.jsx";
import LatestDrops from "./latestDrops/latestDrops.jsx";
import HomePage from "./homePage/homePage.jsx";
import NotFound from "./notFound/notFound.jsx";
import MfaPage from "./mfaPage/mfaPage.jsx";
import UploadPage from "./uploadPhoto/uploadPhoto.jsx";
import ProfilePage from "./profilePage/profilePage.jsx";
import SearchPage from "./searchPage/searchPage.jsx";
import BottomNav from "./bottomNav/bottomNav.jsx";
import ProtectedRoute from "./protectedRoute/protectedRoute.jsx";

// Lives inside <BrowserRouter> (rendered below) so it can use useNavigate
const LogoutButton = ({ onLogout, setUsername }) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      await logoutUser();
      setUsername("");
      onLogout();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <button type="button" className="nav-logout" onClick={handleClick}>
      Logout
    </button>
  );
};

export default function App() {
  const [username, setUsername] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);

  // Ask the server who we are. The login cookie is httpOnly, so JavaScript
  // cannot read it; /api/auth/me is the reliable way to know if we are logged in.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUsername(data.username || "");
          setProfilePicUrl(data.profilePicUrl || "");
        } else {
          setIsAuthenticated(false);
          setUsername("");
          setProfilePicUrl("");
        }
      })
      .catch(() => {
        if (!cancelled) setIsAuthenticated(false);
      })
      .finally(() => {
        if (!cancelled) setAuthChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [renderKey]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Don't decide who may see protected pages until the server has answered
  if (!authChecked) return null;

  return (
    <BrowserRouter>
      <div className={`background${isAuthenticated ? " has-bottom-nav" : ""}`}>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="header-links justify-content-end">
                {isAuthenticated ? (
                  <>
                    {/* On phones the bottom tab bar replaces these links */}
                    <NavLink className="nav-link hide-mobile" to="/landingPage">
                      Feed
                    </NavLink>
                    <NavLink className="nav-link hide-mobile" to="/search">
                      Search
                    </NavLink>
                    <NavLink className="nav-link hide-mobile" to="/uploadPhoto">
                      Upload
                    </NavLink>
                    {username && (
                      <NavLink
                        className="nav-link hide-mobile"
                        to={`/profile/${encodeURIComponent(username)}`}
                      >
                        Profile
                      </NavLink>
                    )}
                  </>
                ) : (
                  <>
                    <NavLink className="nav-link" to="/loginPage">
                      Login
                    </NavLink>
                    <NavLink className="nav-link" to="/signUp">
                      Sign Up
                    </NavLink>
                  </>
                )}
                <a href="https://github.com/keawe99/startup">My Github</a>
                <NavLink
                  className={`nav-link${isAuthenticated ? " hide-mobile" : ""}`}
                  to="/latestDrops"
                >
                  Latest Drops
                </NavLink>
                <NavLink className="nav-link" to="/aboutUs">
                  About Us
                </NavLink>
                {isAuthenticated && (
                  <LogoutButton
                    onLogout={handleLogout}
                    setUsername={setUsername}
                  />
                )}
                <a href="/">
                  <img
                    alt="SneakPeek360 Small Logo"
                    src="/SneakPeekLogo.png"
                    style={{
                      borderRadius: "100%",
                      height: "75px",
                      width: "90px",
                      paddingLeft: "10px",
                      paddingRight: "10px",
                    }}
                  />
                </a>
              </div>
            </div>
          </div>
          <Routes>
            <Route
              path="/"
              element={<HomePage isAuthenticated={isAuthenticated} />}
            />
            <Route
              path="/loginPage"
              element={<LoginPage />}
            />
            <Route
              path="/mfa"
              element={
                <MfaPage setUsername={setUsername} onLogin={handleLogin} />
              }
            />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/signUp" element={<SignUp />} />
            <Route
              path="/landingPage"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  element={LandingPage}
                />
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  element={ProfilePage}
                  currentUsername={username}
                  setProfilePicUrl={setProfilePicUrl}
                />
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  element={SearchPage}
                />
              }
            />
            <Route
              path="/latestDrops"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  element={LatestDrops}
                />
              }
            />
            <Route
              path="/uploadPhoto"
              element={
                <ProtectedRoute
                  isAuthenticated={isAuthenticated}
                  element={UploadPage}
                />
              }
            />
            <Route
              path="*"
              element={<NotFound isAuthenticated={isAuthenticated} />}
            />
          </Routes>
        </div>
        {isAuthenticated && <BottomNav username={username} />}
      </div>
    </BrowserRouter>
  );
}
