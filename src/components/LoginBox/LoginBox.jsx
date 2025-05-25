


// import React, { useState } from 'react';
// import './LoginBox.css';
// import { FaUser, FaLock } from "react-icons/fa";
// import { useNavigate } from 'react-router-dom';
// import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
// import { auth } from '../firebase/firebase'; // Correct the path to the firebase.js file

// const LoginBox = ({ onClose }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState(null);
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       // Authenticate the user with email and password
//       await signInWithEmailAndPassword(auth, email, password);
//       navigate("/Home"); // Adjust the path to your home page route

//     } catch (error) {
//       setError('Invalid email or password');
//       console.error('Error signing in:', error);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!email) {
//       setError("Please enter your email first.");
//       return;
//     }

//     try {
//       await sendPasswordResetEmail(auth, email);
//       setMessage("Verification code has been sent to your email.");
//     } catch (error) {
//       setError('Failed to send password reset email. Please check your email address.');
//       console.error('Error sending password reset email:', error);
//     }
//   };

//   return (
//     <div className="wrapper">
//       <form onSubmit={handleLogin}>
//         <h1>Login</h1>
//         <div className="input-box">
//           <input
//             type="text"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <FaUser className='icon' />
//         </div>
//         <div className="input-box">
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <FaLock className='icon' />
//         </div>
//         {error && <p className="error">{error}</p>}
//         {message && <p className="message">{message}</p>}
//         <div className="remember-forgot">
//           <label><input type="checkbox" /> Remember me</label>
//           <a href="#" onClick={handleForgotPassword}>Forgot password?</a>
//         </div>
//         <button type="submit">Login</button>
//         <div className="register-link">
//           <p> Don't have an account? <a href="/Signup">Sign up!</a></p>
//         </div>
//         <button className="close-button" onClick={onClose}>X</button>
//       </form>
//     </div>
//   );
// }

// export default LoginBox;





// import React, { useState } from 'react';
// import './LoginBox.css';
// import { FaUser, FaLock } from "react-icons/fa";
// import { useNavigate } from 'react-router-dom';
// import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
// import { auth } from '../firebase/firebase'; // Correct the path to the firebase.js file

// const LoginBox = ({ onClose }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState(null);
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     try {
//       // Authenticate the user with email and password
//       await signInWithEmailAndPassword(auth, email, password);
//       onClose();
//       navigate("/Home"); // Adjust the path to your home page route

//     } catch (error) {
//       setError('Invalid email or password');
//       console.error('Error signing in:', error);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!email) {
//       setError("Please enter your email first.");
//       return;
//     }

//     try {
//       await sendPasswordResetEmail(auth, email);
//       setMessage("Verification code has been sent to your email.");
//     } catch (error) {
//       setError('Failed to send password reset email. Please check your email address.');
//       console.error('Error sending password reset email:', error);
//     }
//   };

//   return (
//     <div className="wrapper">
//       <form onSubmit={handleLogin}>
//         <h1>Login</h1>
//         <div className="input-box">
//           <input
//             type="text"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <FaUser className='icon' />
//         </div>
//         <div className="input-box">
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//           <FaLock className='icon' />
//         </div>
//         {error && <p className="error">{error}</p>}
//         {message && <p className="message">{message}</p>}
//         <div className="remember-forgot">
//           <label><input type="checkbox" /> Remember me</label>
//           <a href="#" onClick={handleForgotPassword}>Forgot password?</a>
//         </div>
//         <button type="submit">Login</button>
//         <div className="register-link">
//           <p> Don't have an account? <a href="/Signup">Sign up!</a></p>
//         </div>
//         <button className="close-button" onClick={onClose}>X</button>
//       </form>
//     </div>
//   );
// }

// export default LoginBox;

import React, { useState, useEffect } from 'react';
import './LoginBox.css';
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const LoginBox = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      onClose();
      navigate("/Home");
    } catch (error) {
      setError('Invalid email or password');
      console.error('Error signing in:', error);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Verification code has been sent to your email.");
    } catch (error) {
      setError('Failed to send password reset email. Please check your email address.');
      console.error('Error sending password reset email:', error);
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        <div className="input-box">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FaUser className='icon' />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FaLock className='icon' />
        </div>
        {error && <p className="error">{error}</p>}
        {message && <p className="message">{message}</p>}
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
        <button type="submit">Login</button>
        <div className="register-link">
          <p>Don't have an account? <a href="/Signup">Sign up!</a></p>
        </div>
        <button className="close-button" onClick={onClose}>X</button>
      </form>
    </div>
  );
};

export default LoginBox;
