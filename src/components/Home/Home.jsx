import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { auth, db } from "D:\\react\\EntreLocate_ml-master\\src\\firebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import logo from "D:\\react\\EntreLocate_ml-master\\src\\assets\\newlogob.png";
import heroImage from "../../assets/hero.png";

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [shopCategory, setShopCategory] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [subcollection, setSubcollection] = useState("");
  const navigate = useNavigate();

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
          setShowPopup(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setShowPopup(true);
      }
    } else {
      console.log("No user is logged in.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user && subcollection) {
      const subcollectionRef = doc(db, "users", user.email, subcollection, "profile");
      const data = { shopCategory, ownerName, shopAddress };
      try {
        await setDoc(subcollectionRef, data);
        alert("Details saved successfully!");
        navigate("/ProfilePage", { state: data });
      } catch (error) {
        console.error("Error saving data:", error);
        alert("Failed to save details.");
      }
    } else {
      console.log("No user is logged in or subcollection is not selected.");
    }
  };

  return (
    <div className="homes" style={{ backgroundColor: "#2E2E2E", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ backgroundColor: "rgb(173, 216, 230)", height: "55px" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <img src={logo} alt="Logo" className="logo" />
          </Typography>
          <Button style={{ color: "black" }} color="inherit">About</Button>
        </Toolbar>
      </AppBar>

      <main className="home-body" style={{ padding: "20px", color: "white", textAlign: "center", position: "relative" }}>
        <img 
          src={heroImage}
          alt="Background Image" 
          style={{ width: "100%", height: "auto", position: "absolute", top: 0, left: 0, zIndex: -1 }} 
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            right: "10%",
            bottom: "-1000%",
            transform: "translateY(-50%)",
            animation: "slideUp 1s ease-in-out",
            width: "400px",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/NewBusiness")}
            sx={{
              fontSize: "1.2rem",
              color: "black",
              borderColor: "blue",
              borderWidth: "3px",
              padding: "20px 24px",
              borderRadius: "8px",
              width: "120%",
              backgroundColor: "white",
              marginBottom: "15px",
            }}
          >
            Find your Business
          </Button>
          <Button
            variant="outlined"
            onClick={() => checkProfileData("existingBusinessUser")}
            sx={{
              fontSize: "1.2rem",
              color: "black",
              borderColor: "blue",
              borderWidth: "3px",
              padding: "20px 24px",
              borderRadius: "8px",
              width: "120%",
              backgroundColor: "white",
            }}
          >
            Improve your Business
          </Button>
        </div>
      </main>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-modal">
            <button className="close-btn" onClick={() => setShowPopup(false)}>&times;</button>
            <form onSubmit={handleSubmit}>
              <h2>Shop Details</h2>
              <select name="shop-category" value={shopCategory} onChange={(e) => setShopCategory(e.target.value)} required>
                <option value="" disabled>Shop Category</option>
                <option value="grocery">Grocery</option>
                <option value="clothing">Clothing</option>
                <option value="electronics">Electronics</option>
                <option value="restaurant">Restaurant</option>
              </select>
              <input type="text" name="owner-name" placeholder="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
              <input type="text" name="shop-address" placeholder="Shop Address" value={shopAddress} onChange={(e) => setShopAddress(e.target.value)} required />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;


