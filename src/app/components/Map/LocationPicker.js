'use client';
import { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon in NextJS
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function DraggableMarker({ position, setPosition, isEditing }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={isEditing}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

function MapEvents({ setPosition, isEditing }) {
  useMapEvents({
    click(e) {
      if (isEditing) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

export default function LocationPicker({ defaultAddress, onLocationChange, isEditing }) {
  // Default to central India geometry
  const [position, setPosition] = useState([20.5937, 78.9629]); 
  const [hasInit, setHasInit] = useState(false);

  useEffect(() => {
    if (!hasInit) {
      let isAddressValid = false;
      if (defaultAddress) {
        const parts = defaultAddress.split(',');
        if (parts.length === 2) {
          const lat = parseFloat(parts[0]);
          const lng = parseFloat(parts[1]);
          if (!isNaN(lat) && !isNaN(lng)) {
            setPosition([lat, lng]);
            isAddressValid = true;
            setHasInit(true);
          }
        }
      }

      // If no valid coordinates were found, try to use device GPS
      if (!isAddressValid) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setPosition([pos.coords.latitude, pos.coords.longitude]);
              setHasInit(true);
            },
            (err) => {
              console.warn("Geolocation denied or unavailable.", err);
              // Fallback map position stays at default
              setHasInit(true); 
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          setHasInit(true);
        }
      }
    }
  }, [defaultAddress, hasInit]);

  useEffect(() => {
    if (hasInit && isEditing) {
      onLocationChange(`${position[0].toFixed(5)}, ${position[1].toFixed(5)}`);
    }
  }, [position, hasInit, isEditing]);

  const handleSetPosition = (newPos) => {
    if (!isEditing) return;
    setPosition(newPos);
    setHasInit(true);
  };

  return (
    <MapContainer 
      center={position} 
      zoom={hasInit ? 14 : 4} 
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={isEditing}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DraggableMarker position={position} setPosition={handleSetPosition} isEditing={isEditing} />
      <MapEvents setPosition={handleSetPosition} isEditing={isEditing} />
    </MapContainer>
  );
}
