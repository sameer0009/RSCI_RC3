import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

class FileStorageService {
  private uploadsDir = path.join(__dirname, '../../uploads/profiles');

  /**
   * Upload and optimize profile picture
   */
  async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Generate unique filename
      const filename = `${userId}-${Date.now()}.jpg`;
      const filepath = path.join(this.uploadsDir, filename);

      // Optimize and resize image
      await sharp(file.path)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(filepath);

      // Delete original uploaded file
      await fs.unlink(file.path);

      // Return relative URL path
      return `/uploads/profiles/${filename}`;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(picturePath: string): Promise<void> {
    try {
      if (!picturePath) return;

      // Extract filename from path
      const filename = path.basename(picturePath);
      const filepath = path.join(this.uploadsDir, filename);

      // Check if file exists and delete
      try {
        await fs.access(filepath);
        await fs.unlink(filepath);
      } catch (error) {
        // File doesn't exist, ignore
        console.log('Profile picture not found:', filepath);
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw new Error('Failed to delete profile picture');
    }
  }

  /**
   * Optimize image buffer
   */
  async optimizeImage(buffer: Buffer): Promise<Buffer> {
    return await sharp(buffer)
      .jpeg({ quality: 85 })
      .toBuffer();
  }

  /**
   * Resize image buffer
   */
  async resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    return await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .toBuffer();
  }

  /**
   * Validate file type
   */
  validateFileType(mimetype: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return allowedTypes.includes(mimetype);
  }

  /**
   * Validate file size (max 5MB)
   */
  validateFileSize(size: number): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return size <= maxSize;
  }
}

export default new FileStorageService();
