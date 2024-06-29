// MapComponent.jsx
import React, { useRef, useEffect } from 'react';

const MapDisplay = ({ lat, lng }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
    });

    new window.google.maps.Marker({
      position: { lat, lng },
      map,
    });
  }, [lat, lng]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
};

export default MapDisplay;
