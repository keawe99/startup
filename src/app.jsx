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
import Username from "./username/username.jsx";
import UploadPage from "./uploadPhoto/uploadPhoto.jsx";
import ProfilePage from "./profilePage/profilePage.jsx";
import SearchPage from "./searchPage/searchPage.jsx";
import BottomNav from "./bottomNav/bottomNav.jsx";
import ProtectedRoute from "./protectedRoute/protectedRoute.jsx";

const Home = () => {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1>Welcome to SneakPeek360</h1> <br></br>
          <iframe
            width="600"
            height="400"
            src="https://www.youtube.com/embed/zkXkrSLe-nQ?si=y4oEwd4MOoy9Zetv&autoplay=1&loop=1&playlist=zkXkrSLe-nQ&mute=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
          <br />
          <p>
            Introducing SneakPeek360 - the ultimate app for sneakerheads to
            showcase <br />
            their collections and stay ahead of the game. Upload photos of your
            kicks, <br />
            organize your collection, and connect with fellow enthusiasts. Plus,
            get <br />
            real-time updates on the latest sneaker drops, exclusive releases,
            and <br />
            latest collabs, so you'll never miss the heat. Whether you're a
            collector <br />
            or just love sneakers, SneakPeek360 is the place to be
          </p>
          <footer>
            <p>
              SneakPeek is dedicated to provide to its users and sneakerheads a
              seamless experience in their journey of chasing heat
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

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

  const handleUsernameSet = () => {
    // The server just set the login cookie, so we are logged in now.
    setIsAuthenticated(true);
    setRenderKey((prevKey) => prevKey + 1); // re-check with the server
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
            <Route path="/" element={<Home />} />
            <Route
              path="/loginPage"
              element={
                <LoginPage setUsername={setUsername} onLogin={handleLogin} />
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
              path="/username"
              element={
                <Username
                  setUsername={setUsername}
                  onUsernameSet={handleUsernameSet}
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
          </Routes>
        </div>
        {isAuthenticated && <BottomNav username={username} />}
      </div>
    </BrowserRouter>
  );
}
