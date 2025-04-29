/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import './assets/css/LoginForm.css';
import { MdOutlineEmail } from "react-icons/md";
import { TbPasswordFingerprint } from "react-icons/tb";
import ClassicPreloader from "../Preloader";

const API_URL = "http://127.0.0.1:8000/api/auth/login/";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [showPreloader, setShowPreloader] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(false);
  
    try {
      const response = await axios.post(API_URL, { email, password }, {
        headers: { "Content-Type": "application/json" }
      });
  
      const accessToken = response.data.tokens.access;
      localStorage.setItem("access_token", accessToken);
      setLoginSuccess(true);
      setShowPreloader(true);
  
      // Fetch user details using the access token
      const userResponse = await axios.get("http://127.0.0.1:8000/api/user/profile/", {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        }
      });
  
      const user = userResponse.data;
  
      // Redirect based on user role
      setTimeout(() => {
        if (user.role === "general_user") {
          navigate("/prototypes");
        } else {
          navigate("/dashboard");
        }
      }, 3000);
  
    } catch (error) {
      console.error("Login failed:", error.response ? error.response.data : error);
      setLoginError("Invalid credentials or not approved yet!");
    }
  };

  return (
    <div className="formContents container-fluid mt-3 p-0 p-md-3">
      {showPreloader && <ClassicPreloader />}
      
      <img className="circles-blur d-none d-md-block" src={require("./assets/img/Circles.png")} width={400} height={400} alt="" />
      <div className="row justify-content-center align-items-center">
     
        {/* login form */}
        <div className="col-12 col-md-6 col-lg-4 position-relative p-4">
       
          <h2 className="heading-title text-center text-md-start">Sign In to </h2>
          <h2 className="heading-subtitle text-center text-md-start">Your Innovation Hub</h2>
          <p className="content-description text-center text-md-start">Join the community of creators and innovators. Access your personalized dashboard to manage and showcase your prototypes.</p>

          <form className="login-form" onSubmit={handleLogin}>
            <p className="content-description mx-2">Username</p>
            <div className="input-group input-group-lg mb-3">
              <span className="input-group-text" id="email-addon">
                <MdOutlineEmail />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                aria-label="Email"
                aria-describedby="email-addon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <p className="content-description mx-2">Password</p>
            <div className="input-group input-group-lg mb-3">
              <span className="input-group-text" id="password-addon">
                <TbPasswordFingerprint />
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                aria-label="Password"
                aria-describedby="password-addon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {loginSuccess && (
              <div className="alert alert-success" role="alert">
                Login successful!
              </div>
            )}
            {loginError && (
              <div className="alert alert-danger" role="alert">
                {loginError}
              </div>
            )}

            <button className="Signin w-100" type="submit">Login</button>
            <div className="mt-3 text-center">
            <p className="content-description">
              Not a member yet?{" "}
              <Link to="/register" className="fw-bold" style={{ color: "#64A293", textDecoration: "none" }}>
              Register here
              </Link>
            </p>
          </div>

          </form>
        </div>

        {/* apha image */}
        <div className="col-12 col-md-6 col-lg-4 d-none d-md-block position-relative">
          <img className="circle-blur mx-5" style={{ bottom: '0', left: '-40%', filter: 'blur(35px)', zIndex: '-1' }} src={require("./assets/img/Circles.png")} width={300} height={300} alt="" />
          <img className="Alpha_image shadow-lg mx-auto d-block" src={require('./assets/img/apha.jpeg')} alt="Image" style={{ borderRadius: '33px', border: '4px solid #ffffff', maxWidth: '100%', height: 'auto' }} width={600} height={830} />
        </div>
      </div>
    </div>
  );
};

export default Login;