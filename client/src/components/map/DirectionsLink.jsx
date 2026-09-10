import React from 'react';
import { ExternalLink, Navigation } from 'lucide-react';
import { buildDirectionsUrl } from '../../utils/geo';

const DirectionsLink = ({ fromLat, fromLng, toLat, toLng, label = 'Get Directions', className = '' }) => {
  if (!toLat || !toLng) return null;

  const url = buildDirectionsUrl(fromLat || '', fromLng || '', toLat, toLng);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors ${className}`}
    >
      <Navigation className="h-4 w-4" />
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
};

export default DirectionsLink;
