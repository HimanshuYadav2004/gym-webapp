import multer from 'multer';
import path from 'path';
import { supabase } from '../config/supabase.js';

// Memory storage for Supabase upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const uploadMemory = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload to Supabase Storage
export const uploadToSupabase = async (file, folder = 'members') => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const fileExt = path.extname(file.originalname);
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;

  const { data, error } = await supabase.storage
    .from('gym-photos')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('gym-photos')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

// Delete from Supabase Storage
export const deleteFromSupabase = async (photoUrl) => {
  if (!supabase || !photoUrl) {
    return;
  }

  try {
    // Extract file path from URL
    const urlParts = photoUrl.split('/gym-photos/');
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];

    await supabase.storage
      .from('gym-photos')
      .remove([filePath]);
  } catch (error) {
    console.error('Error deleting from Supabase:', error);
  }
};
