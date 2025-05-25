

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Mainpage.css";
import { auth, db } from "D:\\react\\EntreLocate_ml-master\\src\\firebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Newnavbar from "../Newnavbar/Newnavbar"
import analytics2 from "D:\\react\\EntreLocate_ml-master\\src\\assets\\analytics2.png";
import location from "D:\\react\\EntreLocate_ml-master\\src\\assets\\location.avif";

const Mainpage = () => {
  const [popupAOpen, setPopupAOpen] = useState(false);
  const [popupBOpen, setPopupBOpen] = useState(false);
  const [popupCOpen, setPopupCOpen] = useState(false);
  const [city, setCity] = useState("");
  const [business, setBusiness] = useState("");
  const [shopCategory, setShopCategory] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [subcollection, setSubcollection] = useState("");

  const navigate = useNavigate();

  // Disable scrolling when popup is open
  useEffect(() => {
    const isAnyPopupOpen = popupAOpen || popupBOpen || popupCOpen;
    
    if (isAnyPopupOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to body to prevent scrolling and maintain position
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
    } else {
      // Get the scroll position from the top property
      const scrollY = document.body.style.top;
      
      // Remove styles
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
      }
    }
    
    // Cleanup function to ensure scrolling is enabled when component unmounts
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [popupAOpen, popupBOpen, popupCOpen]);

  // Button A popup functions
  const handleButtonAClick = () => {
    setPopupAOpen(true);
  };

  const closePopupA = () => {
    setPopupAOpen(false);
  };

  const handleSubmitA = (e) => {
    e.preventDefault();
    const data = { city, business };
    fetch("http://127.0.0.1:5000/api/location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        navigate("/location_2", { state: { results: data } });
        closePopupA();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  // Button B functionality
  const handleButtonBClick = () => {
    setPopupBOpen(true);
  };

  const closePopupB = () => {
    setPopupBOpen(false);
  };

  const handleBusinessSubmit = (e) => {
    e.preventDefault();
    const data = { city };

    fetch('http://127.0.0.1:5000/api/business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Business Success:', data);
        navigate('/business2', { state: { results: data } });
        closePopupB();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  // Button C popup functions
  const handleButtonCClick = () => {
    checkProfileData("existingBusinessUser");
  };

  const closePopupC = () => {
    setPopupCOpen(false);
  };

  const checkProfileData = async (subcollectionName) => {
    const user = auth.currentUser;
    if (user) {
      const subcollectionRef = doc(db, "users", user.email, subcollectionName, "profile");
      try {
        const docSnap = await getDoc(subcollectionRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          navigate("/ProfilePage", { state: userData });
        } else {
          setSubcollection(subcollectionName);
          setPopupCOpen(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setPopupCOpen(true);
      }
    } else {
      console.log("No user is logged in.");
    }
  };

  const handleSubmitC = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user && subcollection) {
      const subcollectionRef = doc(db, "users", user.email, subcollection, "profile");
      const data = { shopCategory, ownerName, shopAddress };
      try {
        await setDoc(subcollectionRef, data);
        alert("Details saved successfully!");
        navigate("/ProfilePage", { state: data });
        closePopupC();
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Failed to save details.");
      }
    } else {
      console.log("No user is logged in or subcollection is not selected.");
    }
  };

  return (
    <div className="mainpage">
      <Newnavbar/>
      <div className="chumma"></div>
      <section className="sec1">
        <img src={location} alt="loc" />
        <div className="loc-content">
          <h1>Smart Location Finder</h1>
          <p>Unlock the best locations to launch your business with AI-driven insights and interactive maps.</p>
          <div className="chumma1"></div>
          <button type="button" className="mainp-btn1" onClick={handleButtonAClick}>
            click here
          </button>
        </div>
      </section>
      <div className="chumma"></div>
      <section className="sec2">
        <div className="bus-content">
          <h1>Business Matchmaker</h1>
          <p>Enter a location, and we'll reveal the best business opportunities tailored to market demand.</p>
          <div className="chumma1"></div>
          <button type="button" className="mainp-btn2" onClick={handleButtonBClick}>
            click here
          </button>
        </div>
        <img src="" alt="loc" />
      </section>
      <div className="chumma"></div>
      <section className="sec3">
        <img src={analytics2} alt="loc" />
        <div className="loc-content">
          <h1> Growth Tracker</h1>
          <p>Track profits, expenses, and trends in a sleek, visual way to grow your business smarter.</p>
          <div className="chumma1"></div>
          <button type="button" className="mainp-btn1" onClick={handleButtonCClick}>
            click here
          </button>
        </div>
      </section>
      <div className="chumma"></div>

      {/* Popup A - Location Finder */}
      {popupAOpen && (
        <div className="loc-popup-overlay">
          <div className="loc-popup-container">
            <form className="loc-popup-form" onSubmit={handleSubmitA}>
              <button type="button" className="loc-popup-close-btn" onClick={closePopupA}>×</button>
              <h2 className="loc-popup-heading">Preferred Location</h2>
              <input
                type="text"
                placeholder="Preferred Location"
                className="loc-popup-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <h2 className="loc-popup-heading">Preferred Business type</h2>
              <input
                type="text"
                placeholder="Preferred Business"
                className="loc-popup-input"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
              />
              <button type="submit" className="loc-popup-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup B - Business Matchmaker */}
      {popupBOpen && (
        <div className="loc-popup-overlay">
          <div className="loc-popup-container">
            <form className="loc-popup-form" onSubmit={handleBusinessSubmit}>
              <button type="button" className="loc-popup-close-btn" onClick={closePopupB}>×</button>
              <h2 className="loc-popup-heading">Preferred Location</h2>
              <input
                type="text"
                placeholder="City"
                className="loc-popup-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <button type="submit" className="loc-popup-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup C - Shop Details */}
      {popupCOpen && (
        <div className="loc-popup-overlay">
          <div className="loc-popup-container">
            <form className="loc-popup-form" onSubmit={handleSubmitC}>
              <button type="button" className="loc-popup-close-btn" onClick={closePopupC}>×</button>
              <h2 className="loc-popup-heading">Shop Details</h2>
              
              <select 
                className="loc-popup-input"
                value={shopCategory} 
                onChange={(e) => setShopCategory(e.target.value)} 
                required
              >
                <option value="" disabled>Shop Category</option>
                <option value="grocery">Grocery</option>
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="restaurant">Restaurant</option>
              </select>
              
              <input 
                type="text" 
                placeholder="Owner Name" 
                className="loc-popup-input"
                value={ownerName} 
                onChange={(e) => setOwnerName(e.target.value)} 
                required 
              />
              
              <input 
                type="text" 
                placeholder="Shop Address" 
                className="loc-popup-input"
                value={shopAddress} 
                onChange={(e) => setShopAddress(e.target.value)} 
                required 
              />
              
              <button type="submit" className="loc-popup-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mainpage;