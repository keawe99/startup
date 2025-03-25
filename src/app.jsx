import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import LoginPage from "./loginPage/loginPage.jsx";
import AboutUs from "./aboutUs/aboutUs.jsx";
import SignUp from "./signUp/signUp.jsx";
import LandingPage from "./landingPage/landingPage.jsx";
import LatestDrops from "./latestDrops/latestDrops.jsx";
import Username from "./username/username.jsx";
import UploadPage from "./uploadPhoto/uploadPhoto.jsx";
import ProtectedRoute from "./protectedRoute/protectedRoute.jsx";
import Cookies from "js-cookie"; // Import js-cookie

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

export default function App() {
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Add renderKey state

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [renderKey]); // Add renderKey to dependency array

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleUsernameSet = () => {
    setRenderKey((prevKey) => prevKey + 1); // Force re-render
  };

  return (
    <BrowserRouter>
      <div className="background">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="header-links justify-content-end">
                <NavLink className="nav-link" to="/loginPage">
                  Login
                </NavLink>
                <NavLink className="nav-link" to="/signUp">
                  Sign Up
                </NavLink>
                <a href="https://github.com/keawe99/startup">My Github</a>
                <NavLink className="nav-link" to="/latestDrops">
                  Latest Drops
                </NavLink>
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
                  username={username}
                  setUsername={setUsername}
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
      </div>
    </BrowserRouter>
  );
}
