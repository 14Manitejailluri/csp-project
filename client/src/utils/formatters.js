export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMinutes = Math.round((date - now) / 60000);

  if (diffMinutes < 0) {
    const passedMins = Math.abs(diffMinutes);
    if (passedMins < 60) return `${passedMins}m ago`;
    const hours = Math.floor(passedMins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } else {
    if (diffMinutes < 60) return `in ${diffMinutes}m`;
    const hours = Math.floor(diffMinutes / 60);
    if (hours < 24) return `in ${hours}h ${diffMinutes % 60}m`;
    return `in ${Math.floor(hours / 24)}d`;
  }
};

export const formatDistance = (km) => {
  if (km === null || km === undefined) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const getStorageLabel = (storage) => {
  const map = {
    ROOM_TEMP: 'Room Temperature',
    REFRIGERATED: 'Refrigerated',
    FROZEN: 'Frozen',
    HEATED: 'Heated / Hot',
  };
  return map[storage] || storage || 'Standard';
};

