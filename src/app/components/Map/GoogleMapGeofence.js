'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon in NextJS
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Helper to update map view when props change external to the map
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center);
    }
  }, [center, map]);
  return null;
}

function DraggableMarker({ position, setPosition, radius }) {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos.lat, newPos.lng);
        }
      },
    }),
    [setPosition],
  );

  return (
    <>
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
      />
      <Circle
        center={position}
        radius={radius}
        pathOptions={{
          color: '#3b3bff',
          fillColor: '#3b3bff',
          fillOpacity: 0.2,
          weight: 2
        }}
      />
    </>
  );
}

function MapEvents({ setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LeafletGeofenceMap({ latitude, longitude, radius, onLocationChange, onRadiusChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Default to a sensible location if 0,0 provided (India central)
  const pos = [latitude || 20.5937, longitude || 78.9629];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onLocationChange(parseFloat(lat), parseFloat(lon));
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Search Header Overlay */}
      <form 
        onSubmit={handleSearch}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          gap: '10px'
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for hostel location..."
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            outline: 'none',
            backgroundColor: 'white',
            color: '#111827'
          }}
        />
        <button 
          type="submit"
          disabled={isSearching}
          style={{
            padding: '0 20px',
            backgroundColor: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          {isSearching ? '...' : 'Search'}
        </button>
      </form>

      <MapContainer 
        center={pos} 
        zoom={15} 
        style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={pos} />
        <DraggableMarker 
          position={pos} 
          setPosition={onLocationChange} 
          radius={radius} 
        />
        <MapEvents setPosition={onLocationChange} />
      </MapContainer>

      {/* Floating Radius indicator for feedback */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#3b3bff',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        Radius: {radius}m
      </div>
    </div>
  );
}
