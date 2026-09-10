/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
export const calculateDistanceKm = (coord1, coord2) => {
  if (!coord1 || !coord2) return null;
  const [lon1, lat1] = Array.isArray(coord1) ? coord1 : [coord1.longitude, coord1.latitude];
  const [lon2, lat2] = Array.isArray(coord2) ? coord2 : [coord2.longitude, coord2.latitude];

  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // 1 decimal place
};

export const toGeoJSONPoint = (longitude, latitude) => {
  return {
    type: 'Point',
    coordinates: [parseFloat(longitude), parseFloat(latitude)],
  };
};
