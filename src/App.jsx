import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import LoginBox from './components/LoginBox/LoginBox';
import Signup from './components/Pages/Signup/Signup'; 
import Home from './components/Home/Home';  
import NewBusiness from './components/Pages/NewBusiness/NewBusiness'; 
import Location_2 from './components/Pages/NewBusiness/location_2';
import ProfilePage from './components/Pages/ProfilePage/ProfilePage';
import ClusterDetails from './components/Pages/NewBusiness/ClusterDetails';
import ExpenditurePage from './components/Pages/Expenditure/ExpenditurePage'; // Correct import path
import Business2 from './components/Pages/NewBusiness/Business2';
import Mainpage from './components/Mainpage/Mainpage';


const App = () => {
  const [isHeroContentVisible, setHeroContentVisible] = useState(true);
  const [showLoginBox, setShowLoginBox] = useState(false);

  const handleLoginClick = () => {
    setHeroContentVisible(false);
    setShowLoginBox(true);
  };

  const handleCloseLoginBox = () => {
    setHeroContentVisible(true);
    setShowLoginBox(false);
  };

  return (
    <Router>
      <AppWithNavbar
        handleLoginClick={handleLoginClick}
        handleCloseLoginBox={handleCloseLoginBox}
        isHeroContentVisible={isHeroContentVisible}
        showLoginBox={showLoginBox}
      />
    </Router>
  );
};

const AppWithNavbar = ({ handleLoginClick, handleCloseLoginBox, isHeroContentVisible, showLoginBox }) => {
  const location = useLocation(); // useLocation must be inside the Router component

  return (
    <div>
      {location.pathname === '/' && <Navbar onLoginClick={handleLoginClick} />}
      <Routes>
        <Route path="/" element={<Hero isVisible={isHeroContentVisible} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} /> {/* Home page route */}
        <Route path="/ProfilePage" element={<ProfilePage />} />
        <Route path="/login" element={
          showLoginBox ? <LoginBox onClose={handleCloseLoginBox} /> : <Hero isVisible={isHeroContentVisible} />
        } />
         <Route path="/NewBusiness" element={<NewBusiness />} />
         {/* <Route path="/Popup" element={<Popup />} /> */}
         <Route path="/location_2" element={<Location_2 />} />
         <Route path="/cluster-details" element={<ClusterDetails />} />
         <Route path="/expenditure" element={<ExpenditurePage />} />
         <Route path = "/business2" element = {<Business2/>}/>;
         <Route path = "/Mainpage" element = {<Mainpage/>}/>;

      </Routes>
    
      {showLoginBox && <LoginBox onClose={handleCloseLoginBox} />}
    </div>
  );
};

export default App;



  