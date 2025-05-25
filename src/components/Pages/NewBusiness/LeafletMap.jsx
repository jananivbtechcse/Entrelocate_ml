import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css"; 
import "leaflet.markercluster/dist/MarkerCluster.Default.css"; // Import MarkerCluster Default CSS
import "leaflet.markercluster"; // Import MarkerCluster JS

const LeafletMap = ({ locations }) => {
  const mapRef = useRef(null); // Reference for the map container
  const leafletMapRef = useRef(null); // Reference for the Leaflet map instance
  const markerClusterGroupRef = useRef(null); // Reference for marker cluster group

  useEffect(() => {
    // Initialize the map only once
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 13); // Default to NYC
      // console.log("Not mapped sorrry for the inconvenience")
      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMapRef.current);

      // Initialize the marker cluster group
      markerClusterGroupRef.current = L.markerClusterGroup();
      leafletMapRef.current.addLayer(markerClusterGroupRef.current);
    }

    // Update markers when locations change
    if (locations && locations.length > 0) {
      // Clear existing markers
      markerClusterGroupRef.current.clearLayers();


      // Custom icon for markers
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: #4A3AF0FF;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            animation: bounce 1s infinite;">
            📍
          </div>`,
        className: "custom-div-icon",
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50],
      });

      // Add new markers
      locations.forEach(({ lat, lon, name }) => {
        const marker = L.marker([lat, lon], { icon: customIcon }).bindPopup(
          `
          <div style="text-align: center;">
            <h2 style="color: #2D51F6; font-family: Arial, sans-serif;">${name}</h2>
            <p style="font-size: 14px; color: gray;">Click the button below to view more details.</p>
            <button
              style="padding: 10px 20px; background-color: #5C29F2FF; color: white; border: none; border-radius: 5px; cursor: pointer;"
              onclick="alert('More details about ${name}')">
              View Details
            </button>
          </div>
          `
        );
        markerClusterGroupRef.current.addLayer(marker);
      });

      // Fit the map to the bounds of all markers
      const bounds = locations.map(({ lat, lon }) => [lat, lon]);
      leafletMapRef.current.fitBounds(bounds);
    }
  }, [locations]); // Re-run effect when locations change

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "10px",
      }}
    ></div>
  );
};

export default LeafletMap;
