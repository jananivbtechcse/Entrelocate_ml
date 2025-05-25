import React, { useState } from 'react'; // Removed useEffect since it's not used
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import heroVideo from '../../../assets/hero1.mp4';
import logo from 'D:\\react\\EntreLocate_ml-master\\src\\assets\\logo.png';
import Signinwithgoogle from 'D:\\react\\EntreLocate_ml-master\\src\\components\\Signinwithgoogle.jsx';
import { auth, db } from 'D:\\react\\EntreLocate_ml-master\\src\\components\\firebase\\firebase.js'; // Firebase Auth and Firestore
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Firebase Auth methods
import { doc, setDoc } from 'firebase/firestore'; // Firestore methods
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";




const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User signed up:', user);

        await sendEmailVerification(user);
        alert('Verification email sent. Please check your inbox.');

        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          isVerified: user.emailVerified,
          createdAt: new Date(),
        });

        // Polling to check email verification status
        const intervalId = setInterval(async () => {
          await user.reload();
          if (user.emailVerified) {
            clearInterval(intervalId);
            navigate('/home');
          }
        }, 3000); // Check every 3 seconds
      } catch (error) {
        console.error('Error during sign-up:', error.message);
        setErrors({ firebase: error.message });
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="signup-container">
      <video className='hero-video' autoPlay muted loop>
        <source src={heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="logo-signup">
        <img src={logo} alt="Logo" className="logo" />
      </div>
      <div className="form-container">
        <h2>Signup</h2>
        <form onSubmit={handleSubmit} className="signup-text">
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



          <button type="submit" className="signup-submit">
            Sign Up
          </button>
          {errors.firebase && <p className="error">{errors.firebase}</p>}
          
          <p className="centered-text">or</p>

          <Signinwithgoogle />
        </form>
      </div>
    </div>
  );
};

export default Signup;