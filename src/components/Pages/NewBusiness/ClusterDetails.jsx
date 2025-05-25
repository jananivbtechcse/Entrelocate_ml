// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import './ClusterDetails.css'; // Import the CSS file for styling

// const ClusterDetails = () => {
//   const location = useLocation();
//   const clusterInfo = location.state?.clusterInfo;

//   // Extract the first neighborhood for mapping
//   const firstNeighborhood = clusterInfo?.neighborhood_areas[0] || '';

//   return (
//     <div className="details-container">
//       <div className="details-left">
//         <h2>Cluster {clusterInfo?.cluster}</h2>
//         <h4>Recommended Neighborhoods:</h4>
//         <ul>
//           {clusterInfo?.neighborhood_areas.map((neighborhood, index) => (
//             <li key={index}>{neighborhood}</li>
//           ))}
//         </ul>
//       </div>
//       <div className="details-right">
//         {firstNeighborhood ? (
//           <iframe
//             title="Google Maps"
//             src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(
//               firstNeighborhood
//             )}`}
//             width="100%"
//             height="100%"
//             style={{ border: 0 }}
//             allowFullScreen
//           ></iframe>
//         ) : (
//           <p>Map not available</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ClusterDetails;


import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LeafletMap from "./LeafletMap";
import "./ClusterDetails.css";

const ClusterDetails = () => {
  const location = useLocation();
  const clusterInfo = location.state?.clusterInfo;
  const [locations, setLocations] = useState([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchCoordinates = async (address) => {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          name: address,
        };
      } else {
        console.error(`Failed to fetch coordinates for: ${address}`);
        return null;
      }
    };

    const loadCoordinates = async () => {
      if (clusterInfo?.neighborhood_areas) {
        const results = await Promise.all(
          clusterInfo.neighborhood_areas.map((address) =>
            fetchCoordinates(address)
          )
        );
        setLocations(results.filter(Boolean)); // Remove null values
      }
    };

    loadCoordinates();
  }, [clusterInfo]);

  return (
    <div className="fullpage-container">
      {/* Map with border takes full page */}
      <LeafletMap cluster={clusterInfo} locations={locations} />
      
      {/* Floating info panel with toggle button */}
      <div className="info-toggle-button" onClick={() => setShowInfo(!showInfo)}>
        {showInfo ? '✕' : 'ℹ'}
      </div>
      
      {showInfo && (
        <div className="floating-info-panel">
          <h2>Cluster {clusterInfo?.cluster}</h2>
          <h4>Recommended Neighborhoods:</h4>
          <ul>
            {clusterInfo?.neighborhood_areas.map((neighborhood, index) => (
              <li key={index}>{neighborhood}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClusterDetails;
// import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
// import LeafletMap from "./LeafletMap"; // Import LeafletMap
// import "./ClusterDetails.css";

// const ClusterDetails = () => {
//   const location = useLocation();
//   const clusterInfo = location.state?.clusterInfo;
//   const [locations, setLocations] = useState([]);

//   useEffect(() => {
//     const fetchCoordinates = async (address) => {
//       const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//         address
//       )}&format=json&limit=1`;
//       const response = await fetch(url);
//       const data = await response.json();
//       if (data && data[0]) {
//         return {
//           lat: parseFloat(data[0].lat),
//           lon: parseFloat(data[0].lon),
//           name: address,
//         };
//       } else {
//         console.error(`Failed to fetch coordinates for: ${address}`);
//         return null;
//       }
//     };

//     const loadCoordinates = async () => {
//       if (clusterInfo?.neighborhood_areas) {
//         const results = await Promise.all(
//           clusterInfo.neighborhood_areas.map((address) =>
//             fetchCoordinates(address)
//           )
//         );
//         setLocations(results.filter(Boolean)); // Remove null values
//       }
//     };

//     loadCoordinates();
//   }, [clusterInfo]);

//   return (
//     <div className="details-container">
//       <div className="details-left">
//         <h2>Cluster {clusterInfo?.cluster}</h2>
//         <h4>Recommended Neighborhoods:</h4>
//         <ul>
//           {clusterInfo?.neighborhood_areas.map((neighborhood, index) => (
//             <li key={index}>{neighborhood}</li>
//           ))}
//         </ul>
//       </div>
//       <div className="details-right">
//         <LeafletMap locations={locations} /> {/* Pass locations dynamically */}
//       </div>
//     </div>
//   );
// };

// export default ClusterDetails;

