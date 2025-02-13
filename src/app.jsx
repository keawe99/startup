import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
  Link, // Import Link here
} from "react-router-dom";
import LoginPage from "./loginPage/loginPage.jsx";
import AboutUs from "./aboutUs/aboutUs.jsx";
import SignUp from "./signUp/signUp.jsx";
import LandingPage from "./landingPage/landingPage.jsx";
import Username from "./username/username.jsx";
import Verification from "./verification/verification.jsx";

const Home = () => {
  //   const navigate = useNavigate();
  //   const [email, setEmail] = useState("");

  //   const handleSubmit = (event) => {
  //     event.preventDefault();
  //     console.log("Email submitted:", email);

  //     navigate("/"); // Or navigate(0)
  //     setEmail("");
  //   };

  //   const handleChange = (event) => {
  //     setEmail(event.target.value);
  //   };

  return (
    <div>
      <h1>Welcome to SneakPeek360!</h1>
      <p>
        Introducing SneakPeek360 - the ultimate app for sneakerheads to showcase
        <br />
        their collections and stay ahead of the game. Upload photos of your
        kicks, <br />
        organize your collection, and connect with fellow enthusiasts. Plus, get
        <br />
        real-time updates on the latest sneaker drops, exclusive releases, and
        <br />
        latest collabs, so you'll never miss the heat. Whether you're a
        collector
        <br />
        or just love sneakers, SneakPeek360 is the place to be
      </p>
      {/* <footer>
        <div className="column-footer-left">
          <h4 className="heading">Stay Connected</h4>
          <br />
          Let us reach out to you with the latest news <br />
          and the latest drops from your favorite brands
          <form onSubmit={handleSubmit}>
            <br />
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleChange}
            />
            <button type="submit" style={{ borderRadius: "5px" }}>
              Sign Up
            </button>
          </form>
        </div>
      </footer> */}
    </div>
  );
};

function NotFound() {
  return (
    <main className="container-fluid bg-secondary text-center">
      404: Return to sender. Address unknown.
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="background">
        <div className="container">
          <div className="column">
            <h2>Latest Drops</h2>
            <h5>Brought to you by: Steven Armstrong</h5>
            <ul>
              <li>
                Air Jordan 5 <br />
                "Black Metallic" <br />
                SNKRS <br />
                2/12/2025
              </li>
              <br />
              <li>
                Air Jordan 1 Low <br />
                "Game Royal" <br />
                SNKRS <br />
                12/4/2024
              </li>
              <br />
              <li>
                New Balance <br />
                "Action Bronson" <br />
                NB <br />
                11/23/2024
              </li>
              <br />
              <li>
                Adidas Gazelle <br />
                "Bad Bunny" <br />
                <a href="https://Adidas.com">Adidas.com</a> <br />
                10/31/2024
              </li>
            </ul>
          </div>
          <div className="column">
            <center>
              <h1>Welcome to SneakPeek360</h1>
            </center>
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
            <br />
            <br />
            <p>
              Introducing SneakPeek360 - the ultimate app for sneakerheads to
              showcase <br />
              their collections and stay ahead of the game. Upload photos of
              your kicks, <br />
              organize your collection, and connect with fellow enthusiasts.
              Plus, get <br />
              real-time updates on the latest sneaker drops, exclusive releases,
              and <br />
              latest collabs, so you'll never miss the heat. Whether you're a
              collector <br />
              or just love sneakers, SneakPeek360 is the place to be
            </p>
            <footer className="column-footer-middle">
              SneakPeek360's mission is to connect sneaker enthusiasts globally,
              providing a vibrant platform to discover and celebrate sneaker
              culture. Our vision is to be the world's leading sneaker
              destination, fostering community and driving sneaker innovation.
              We value community, authenticity, innovation, passion, and
              excellence in the sneaker world.
            </footer>
          </div>
          <div className="column">
            <div className="header-links">
              <img
                alt="SneakPeek360 Small Logo"
                src="/SneakPeekLogo.png"
                style={{
                  borderRadius: "100%",
                  height: "50px",
                  width: "50px",
                  justifyContent: "right",
                  paddingRight: "50px",
                  paddingLeft: "50px",
                }}
              />
              <NavLink className="nav-link" to="/loginPage">
                Login
              </NavLink>
              <NavLink className="nav-link" to="/signUp">
                Sign Up
              </NavLink>
              <a href="https://github.com/keawe99/startup">My Github</a>
            </div>
            <footer className="column-footer-right">
              1800 N State St, <br />
              Provo, UT <br />
              84604 <br />
              <br />
              <NavLink
                className="nav-link"
                to="/aboutUs"
                style={{ color: "white", textDecoration: "underline" }}
              >
                About Us
              </NavLink>
              <br />
              <br />
              <a href="tel:+13854017953" style={{ color: "white" }}>
                Call Us: 1-385-401-7953
              </a>
            </footer>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/loginPage" element={<LoginPage />} />
        <Route path="/aboutUs" element={<AboutUs />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/landingPage" element={<LandingPage />} />
        <Route path="/username" element={<Username />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
