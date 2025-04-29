import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import './assets/css/LoginForm.css';
import { MdOutlineEmail } from "react-icons/md";
import { TbPasswordFingerprint } from "react-icons/tb";
import { FaUserAlt } from "react-icons/fa";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';

const API_URL = "http://127.0.0.1:8000/api/auth/register/"; // API endpoint for registration

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
  const navigate = useNavigate();

  // Function to validate passwords
  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(false);
    
    if (!validatePasswords()) return;  // Stop submission if passwords don't match

    try {
      const response = await axios.post(
        API_URL,
        { full_name: fullName, email, phone, password },
        { headers: { "Content-Type": "application/json" } }
      );

      setRegisterSuccess(true);
      setTimeout(() => {
        navigate("/");  // Redirect to login page after successful registration
      }, 1500);
    } catch (error) {
      console.error("Registration failed:", error.response ? error.response.data : error);
      setRegisterError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="formContents container-fluid mt-3 p-0 p-md-3">
      <div className="row justify-content-center align-items-center">
        <div className="col-12 col-md-6 col-lg-4 position-relative p-4">
          <h2 className="heading-title text-center text-md-start">Create an Account</h2>
          <h2 className="heading-subtitle text-center text-md-start">Welcome to the Innovation Hub</h2>
          <p className="content-description text-center text-md-start">
            Fill in your details below. Admin approval is required before you can log in.
          </p>

          <form className="registration-form" onSubmit={handleRegister}>
            <p className="content-description mx-2">Full Name</p>
            <div className="input-group input-group-lg mb-3">
              <span className="input-group-text" id="full-name-addon">
                <FaUserAlt />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <p className="content-description mx-2">Email</p>
            <div className="input-group input-group-lg mb-3">
              <span className="input-group-text" id="email-addon">
                <MdOutlineEmail />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <p className="content-description mx-2">Phone</p>
            <div className="input-group input-group-lg mb-3">
              <PhoneInput
                country={'us'}
                value={phone}
                onChange={(phone) => setPhone(phone)}
                inputProps={{
                  name: "phone",
                  required: true,
                  autoFocus: true
                }}
                countryCodeEditable={false}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <p className="content-description mx-2">Confirm Password</p>
            <div className="input-group input-group-lg mb-3">
              <span className="input-group-text" id="confirm-password-addon">
                <TbPasswordFingerprint />
              </span>
              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {passwordError && (
              <div className="alert alert-danger" role="alert">
                {passwordError}
              </div>
            )}

            {registerSuccess && (
              <div className="alert alert-success" role="alert">
                Registration successful wait for the  Admin Approval! Redirecting to login...
              </div>
            )}

            {registerError && (
              <div className="alert alert-danger" role="alert">
                {registerError}
              </div>
            )}

            <button className="Signin w-100" type="submit">Register</button>

            <p className="mt-3 text-center">
          Already have an account?{" "}
          <Link to="/" className="fw-bold" style={{ color: "#64A293", textDecoration: "none" }}>
            Login here
          </Link>
        </p>
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

export default Register;
