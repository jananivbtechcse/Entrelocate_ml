import React, { useRef, useState } from "react";
import "./Hero.css"; // Import CSS properly
import img from "../../assets/cube.png";
import { auth, db } from '../firebase/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import Signinwithgoogle from '../Signinwithgoogle';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  // Creating references for sections
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const navigate = useNavigate();

  // Modal and Form State
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loginMessage, setLoginMessage] = useState(null);

  // Function to scroll to the desired section
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  // Validate form inputs
  const validate = () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username.trim()) {
      errors.username = 'Username is required';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailPattern.test(email)) {
      errors.email = 'Invalid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    return errors;
  };

  // Load remembered email on component mount
  React.useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle Signup Submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await sendEmailVerification(user);
        alert('Verification email sent. Please check your inbox.');

        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          isVerified: user.emailVerified,
          createdAt: new Date(),
        });

        // Close modal after successful signup
        setIsSignupModalOpen(false);
        
        // Reset form fields
        setUsername('');
        setEmail('');
        setPassword('');
      } catch (error) {
        console.error('Error during sign-up:', error.message);
        setErrors({ firebase: error.message });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      setIsLoginModalOpen(false);
      navigate("/Mainpage");
    } catch (error) {
      setLoginError('Invalid email or password');
      console.error('Error signing in:', error);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      setLoginError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setLoginMessage("Verification code has been sent to your email.");
      setLoginError(null);
    } catch (error) {
      setLoginError('Failed to send password reset email. Please check your email address.');
      setLoginMessage(null);
      console.error('Error sending password reset email:', error);
    }
  };

  return (
    <div className='hero'>
      <section ref={homeRef} className='pg1'>
        <nav className='navbar'>
          <ul className="nav-links">
            <li onClick={() => scrollToSection(homeRef)}>Home</li>
            <li onClick={() => scrollToSection(aboutRef)}>About us</li>
            <li onClick={() => scrollToSection(servicesRef)}>Services</li>
          </ul>

          <img src="" className='logo' alt="logo"/>
          <div className="log">
            <button onClick={() => setIsLoginModalOpen(true)}>log in</button>
          </div>
        </nav>

        <div className='left'>
          <h1>Explore the Best Place to Find Your Business</h1>
          <p>Our mission is to empower entrepreneurs by providing data-driven insights to find the perfect location for their business. Let us guide you in making informed decisions that lead to success.</p>
          <div className='signup-btn'>
            <button onClick={() => setIsSignupModalOpen(true)}>Sign up</button>
          </div>
        </div>
        <div className="right">
        </div>
      </section>

      {/* Signup Modal */}
      {isSignupModalOpen && (
        <div className="signup-modal-overlay">
          <div className="signup-modal-content">
            <button 
              className="close-modal-btn" 
              onClick={() => setIsSignupModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="signup-head">Signup</h2>
            <form onSubmit={handleSignupSubmit} className="signup-text">
              <div className="signup-input">
                <h3>Username:</h3>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input 
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                {errors.username && <p className="error">{errors.username}</p>}
              </div>

              <div className="signup-input">
                <h3>Email:</h3>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                {errors.email && <p className="error">{errors.email}</p>}
              </div>

              <div className="signup-input">
                <h3>Password:</h3>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {errors.password && <p className="error">{errors.password}</p>}
              </div>

              <button type="submit" className="signup-submit">
                Sign Up
              </button>
              {errors.firebase && <p className="error">{errors.firebase}</p>}
              
              <p className="centered-text">or</p>

              <Signinwithgoogle />
            </form>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="login-modal-overlay">
          <div className="login-modal-content">
          <button 
              className="close-modal-btn" 
              onClick={() => setIsSignupModalOpen(false)}
            >
              &times;
            </button>
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="login-input">
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <div className="chumma3"></div>
                  <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-input">
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <div className="chumma3"></div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {loginError && <p className="error">{loginError}</p>}
              {loginMessage && <p className="message">{loginMessage}</p>}
              
              <div className="remember-forgot">
                <label>
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)} 
                  /> Remember me
                </label>
                <a href="#" onClick={handleForgotPassword} className="forgot-password">Forgot password?</a>
              </div>
              
              <button type="submit" className="login-submit">
                Login
              </button>
              
              <div className="register-link">
                <p>Don't have an account? <a href="#" onClick={() => {
                  setIsLoginModalOpen(false);
                  setIsSignupModalOpen(true);
                }}>Sign up!</a></p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rest of your existing sections */}
      <section ref={aboutRef} className='pg2'>
        <div className='left-content'>
          <h1>Discover Your Ideal Business Location with Data-Driven Insights</h1>
          <p>Our unique approach leverages advanced analytics to pinpoint the best locations for your business. By focusing on data-driven decisions, we empower entrepreneurs to thrive in competitive markets.</p>
          <ul className='list-items'>
            <li>Data analytics for informed business decisions.</li>
            <li>Tailored insights to enhance your business strategy.</li>
            <li>Unlock potential with our expert location analysis.</li>
          </ul>
        </div>
        <div className='right-content'>
          <img src="" className='pg2-pic' alt="pic"/>
        </div>
      </section>

      <section ref={servicesRef} className='pg3'>
        <h1>Unlock Your Business Potential with Our Services</h1>
        <p>We offer comprehensive services designed to help you identify the best locations for your business. Our expert analyses empower you to make informed decisions and enhance your operational strategies.</p>
        <div className='chumma3'></div>
        <div className='cards'>
          <div className='card'>
            <img src={img} alt="Card Image"/>
            <div className='card-content'>
              <h3>In-Depth Location Analysis for Your Business</h3>
              <p>Discover the ideal spot for your venture</p>
              <div className='chumma2'></div>
              {/* <button>Learn More</button> */}
            </div>
          </div>
          <div className='card'>
            <img src={img} alt="Card Image"/>
            <div className='card-content'>
              <h3>Competitive Analysis to Stay Ahead</h3>
              <p>Understand your competition and refine your strategy</p>
              <div className='chumma'></div>
            </div>
          </div>
          <div className='card'>
            <img src={img} alt="Card Image"/>
            <div className='card-content'>
              <h3>Tailored Business Improvement Plans for Growth</h3>
              <p>Implement actionable plans to boost your success</p>
              {/* <button>Learn More</button> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;