import React from 'react';
import './Navbar.css';
import logo from '../../assets/logo.png';
import { Button } from '@mui/material';

const Navbar = ({ onLoginClick }) => {
  return (
    <nav className='container'>
      <img src={logo} alt="" className='logo'/>
      <ul>


        {/* <li><button className='overview'>Overview</button></li> */}
        <li><Button 
        variant="outlined"
        className='btn' onClick={onLoginClick}>
        Login</Button></li>


      </ul>
    </nav>
  );
};

export default Navbar;