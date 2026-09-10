/**
 * Geo utility helpers – browser-based, no external API required.
 */

/**
 * Get the user's current geolocation as a Promise.
 * @returns {Promise<{lat: number, lng: number}>}
 */
export const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => reject(new Error(err.message)),
      { timeout: 10000 }
    );
  });

/**
 * Calculate the great-circle distance between two coordinates using Haversine.
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number} distance in kilometres
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Build a Google Maps directions URL for two lat/lng pairs.
 */
export const buildDirectionsUrl = (fromLat, fromLng, toLat, toLng) =>
  `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=driving`;

/**
 * Build a static OpenStreetMap tile URL to show a pin (for fallback display).
 */
export const buildStaticMapUrl = (lat, lng, zoom = 14) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
