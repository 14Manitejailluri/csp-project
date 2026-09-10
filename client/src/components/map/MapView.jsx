import React, { useEffect, useRef } from 'react';

/**
 * MapView – renders an interactive Leaflet map with optional markers.
 * Uses dynamic import so Leaflet only loads in the browser.
 *
 * markers: Array<{ lat, lng, popup?: string, color?: 'green' | 'blue' | 'red' }>
 */
const MapView = ({ markers = [], center, zoom = 13, height = '300px', className = '' }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const initMap = async () => {
      // Dynamically import Leaflet to avoid SSR issues
      const L = (await import('leaflet')).default;

      // Fix Leaflet's default icon path issue with Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const defaultCenter = center ||
        (markers[0] ? [markers[0].lat, markers[0].lng] : [20.5937, 78.9629]);

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        center: defaultCenter,
        zoom,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      markers.forEach(({ lat, lng, popup }) => {
        const marker = L.marker([lat, lng]).addTo(map);
        if (popup) marker.bindPopup(popup);
      });

      mapRef.current = map;
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markers, center, zoom]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={`rounded-xl overflow-hidden border border-slate-200 ${className}`}
    />
  );
};

export default MapView;
