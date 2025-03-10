"use client";
import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "600px",
  height: "400px",
};

const center = {
  lat: 40.7431, // Center on Newark, NJ
  lng: -74.179,
};

const locations = [
  {
    id: 1,
    name: "NJIT",
    position: { lat: 40.7431, lng: -74.179 },
    description: "New Jersey Institute of Technology",
  },
  {
    id: 2,
    name: "Branch Brook Park",
    position: { lat: 40.7645, lng: -74.1718 },
    description: "Largest county park in the United States",
  },
  {
    id: 3,
    name: "Newark Museum of Art",
    position: { lat: 40.7441, lng: -74.1711 },
    description: "New Jersey's largest museum",
  },
  {
    id: 4,
    name: "Prudential Center",
    position: { lat: 40.7334, lng: -74.1712 },
    description: "Multi-purpose indoor arena",
  },
  {
    id: 5,
    name: "Newark Penn Station",
    position: { lat: 40.7347, lng: -74.1642 },
    description: "Major transportation hub",
  },
];

function MyMap() {
  const [selectedMarker, setSelectedMarker] = useState(null);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_REACT_APP_GOOGLE_MAPS_API_KEY}
    >
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            onClick={() => setSelectedMarker(location)}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <h3>{selectedMarker.name}</h3>
              <p>{selectedMarker.description}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default React.memo(MyMap);
