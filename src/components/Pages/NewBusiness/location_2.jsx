

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './location_2.css'; // Import the CSS file for styling

const Location_2 = () => {
  const location = useLocation(); 
  const results = location.state?.results; // Retrieve results passed via navigation
  const navigate = useNavigate();

  const handleCardClick = (clusterInfo) => {
    navigate(`/cluster-details`, { state: { clusterInfo } }); // Navigate to ClusterDetails page
  };

  return (
    <div className="cluster-container">
      <h2>Cluster Recommendations</h2>
      {results ? (
        <>
          {results.recommended_clusters && results.recommended_clusters.length > 0 ? (
            <>
{results.recommended_clusters.map((clusterInfo, index) => (
  <div
    key={index}
    className={`cluster-card ${index % 2 === 0 ? "left-slide" : "right-slide"}`}
    onClick={() => handleCardClick(clusterInfo)}
  >
    <h3>Cluster {clusterInfo.cluster}</h3>
    <h4>Recommended Neighborhoods:</h4>
    {clusterInfo.neighborhood_areas && clusterInfo.neighborhood_areas.length > 0 ? (
      <ul>
        {clusterInfo.neighborhood_areas.map((neighborhood, i) => (
          <li key={i}>{neighborhood}</li>
        ))}
      </ul>
    ) : (
      <p>No neighborhoods found for this cluster.</p>
    )}
  </div>
))}

             
            </>
          ) : (
            <p>No cluster recommendations found.</p>
          )}
        </>
      ) : (
        <p>No results available.</p>
      )}
    </div>
  );
};

export default Location_2;

