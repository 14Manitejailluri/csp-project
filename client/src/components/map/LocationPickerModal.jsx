import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, LocateFixed } from 'lucide-react';
import Modal from '../common/Modal';
import { getCurrentPosition } from '../../utils/geo';

const LocationPickerModal = ({ isOpen, onClose, onConfirm, initial = null }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedLatLng, setSelectedLatLng] = useState(initial);
  const [locating, setLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }

      const startCenter = initial ? [initial.lat, initial.lng] : [20.5937, 78.9629];
      const map = L.map(containerRef.current, { center: startCenter, zoom: initial ? 15 : 5 });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      if (initial) {
        markerRef.current = L.marker([initial.lat, initial.lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const ll = markerRef.current.getLatLng();
          setSelectedLatLng({ lat: ll.lat, lng: ll.lng });
        });
        setSelectedLatLng(initial);
      }

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on('dragend', () => {
            const ll = markerRef.current.getLatLng();
            setSelectedLatLng({ lat: ll.lat, lng: ll.lng });
          });
        }
        setSelectedLatLng({ lat, lng });
      });

      mapRef.current = map;
      setMapReady(true);
    };

    // Wait a tick for modal to render before initializing
    const timeout = setTimeout(initMap, 100);
    return () => {
      clearTimeout(timeout);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      setMapReady(false);
    };
  }, [isOpen]);

  const handleLocate = async () => {
    setLocating(true);
    try {
      const pos = await getCurrentPosition();
      if (mapRef.current) {
        const L = (await import('leaflet')).default;
        mapRef.current.setView([pos.lat, pos.lng], 16);
        if (markerRef.current) {
          markerRef.current.setLatLng([pos.lat, pos.lng]);
        } else {
          markerRef.current = L.marker([pos.lat, pos.lng], { draggable: true }).addTo(mapRef.current);
          markerRef.current.on('dragend', () => {
            const ll = markerRef.current.getLatLng();
            setSelectedLatLng({ lat: ll.lat, lng: ll.lng });
          });
        }
        setSelectedLatLng(pos);
      }
    } catch {
      alert('Could not get your location. Please allow location access or click on the map.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pin Pickup Location" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Click anywhere on the map to drop a pin, or use the locate button.</p>

        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="flex items-center gap-2 text-sm font-medium text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-60"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          Use My Current Location
        </button>

        <div ref={containerRef} style={{ height: '350px' }} className="rounded-xl border border-slate-200" />

        {selectedLatLng && (
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
            {selectedLatLng.lat.toFixed(6)}, {selectedLatLng.lng.toFixed(6)}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => selectedLatLng && onConfirm(selectedLatLng)}
            disabled={!selectedLatLng}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LocationPickerModal;
