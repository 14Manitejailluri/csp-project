import { v2 as cloudinary } from 'cloudinary';
import { config } from './env.js';
import fs from 'fs';
import path from 'path';

const isCloudinaryConfigured = Boolean(
  config.cloudinary.cloudName &&
  config.cloudinary.apiKey &&
  config.cloudinary.apiSecret
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export const uploadImageToStorage = async (file) => {
  if (!file) return null;

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'foodrescue/donations',
        resource_type: 'image',
      });
      // Delete temporary local file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (err) {
      console.warn('[Cloudinary upload failed, using local URL]:', err.message);
    }
  }

  // Fallback to local static serve
  const normalizedPath = `/uploads/${path.basename(file.path)}`;
  return normalizedPath;
};

export { cloudinary, isCloudinaryConfigured };
