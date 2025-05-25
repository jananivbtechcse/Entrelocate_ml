// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import './Business2.css'; // Import the CSS file for styling

// const Business2 = () => {
//   const location = useLocation();
//   const results = location.state?.results; // Retrieve results passed via navigation
//   const navigate = useNavigate();

//   const handleCardClick = (categoryInfo) => {
//     navigate('/cluster-details', { state: { categoryInfo } }); // Navigate to CategoryDetails page
//   };

//   return (
//     <div className="business-container">
//       <h2>Business Recommendations</h2>
//       {results ? (
//         <>
//           {results.length > 0 ? (
//             <>
//               {results.map((categoryInfo, index) => (
//                 <div
//                   key={index}
//                   className="business-card"
//                   onClick={() => handleCardClick(categoryInfo)}
//                 >
//                   <h3>Category: {categoryInfo.category}</h3>
//                   <h4>Recommended Cluster:</h4>
//                   <p>Cluster {categoryInfo.max_score_cluster}</p>
//                   <h4>Score:</h4>
//                   <p>{categoryInfo.max_score}</p>
//                   <h4>Neighborhoods:</h4>
//                   {categoryInfo.neighborhood.length > 0 ? (
//                     <ul>
//                       {categoryInfo.neighborhood.map((neighborhood, idx) => (
//                         <li key={idx}>{neighborhood}</li>
//                       ))}
//                     </ul>
//                   ) : (
//                     <p>No neighborhoods found.</p>
//                   )}
//                 </div>
//               ))}
//             </>
//           ) : (
//             <p>No business recommendations found.</p>
//           )}
//         </>
//       ) : (
//         <p>No results available.</p>
//       )}
//     </div>
//   );
// };

// export default Business2;
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Business2.css';

const Business2 = () => {
  const location = useLocation();
  const results = location.state?.results;
  const navigate = useNavigate();

  // Add debug logging
  console.log("Full location state:", location.state);
  console.log("Results:", results);

  const handleCardClick = (categoryInfo) => {
    // Debug log the category info
    console.log("Category Info being passed:", categoryInfo);
    navigate('/cluster-details', { state: { categoryInfo } });
  };

  return (
    <div className="business-container">
      <h2>Business Recommendations</h2>
      {results ? (
        <>
          {results.length > 0 ? (
            <>
              {results.map((categoryInfo, index) => {
                // Debug log each category's neighborhood data
                console.log(`Category ${index} neighborhoods:`, categoryInfo.neighborhood);
                
                return (
                  <div
                    key={index}
                    className="business-card"
                    onClick={() => handleCardClick(categoryInfo)}
                  >
                    <h3>Category: {categoryInfo.category}</h3>
                    <h4>Recommended Cluster:</h4>
                    <p>Cluster {categoryInfo.max_score_cluster}</p>
                    <h4>Score:</h4>
                    <p>{categoryInfo.max_score}</p>
                    <h4>Neighborhoods:</h4>
                    {/* Debug log the neighborhood array length */}
                    {console.log(`Category ${index} neighborhood length:`, 
                               categoryInfo.neighborhood ? categoryInfo.neighborhood.length : 0)}
                    {Array.isArray(categoryInfo.neighborhood) && categoryInfo.neighborhood.length > 0 ? (
                      <ul>
                        {categoryInfo.neighborhood.map((neighborhood, idx) => (
                          <li key={idx}>{neighborhood}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No neighborhoods found.</p>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <p>No business recommendations found.</p>
          )}
        </>
      ) : (
        <p>No results available.</p>
      )}
    </div>
  );
};

export default Business2;