// MapDisplay.js
import React from 'react';

const MapDisplay = ({ mapUrl }) => {
  return (
    <iframe
      title="Google Maps"
      width="400"
      height="450"
      loading="lazy"
      allowFullScreen
      src={mapUrl}
    />
  );
};

export default MapDisplay;
