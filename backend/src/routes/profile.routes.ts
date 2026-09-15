import { fields, problemFields } from '../middleware/input.middleware';
import { Router } from 'express';
import profileController from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/multer';

const router = Router();

// Public routes
router.get('/:username/profile', profileController.getProfile);

// Protected routes (require authentication)
router.put('/profile', authenticate, fields(['fullName','bio','location']), profileController.updateProfile);
router.post(
  '/profile/picture',
  authenticate,
  upload.single('picture'),
  profileController.uploadProfilePicture
);
router.delete('/profile/picture', authenticate, profileController.deleteProfilePicture);
router.put('/profile/social', authenticate, fields(['linkedinUrl','githubUrl','twitterUrl','websiteUrl']), profileController.updateSocialLinks);

export default router;
