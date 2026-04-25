import prisma from '../config/database';
import fileStorageService from './fileStorage.service';

interface UpdateProfileDto {
  fullName?: string;
  bio?: string;
  location?: string;
}

interface SocialLinks {
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

class ProfileService {
  /**
   * Get user profile by username
   */
  async getProfile(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        profilePicture: true,
        location: true,
        linkedinUrl: true,
        githubUrl: true,
        twitterUrl: true,
        websiteUrl: true,
        rating: true,
        rank: true,
        problemsSolved: true,
        totalSubmissions: true,
        acceptedSubmissions: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get recent submissions
    const recentSubmissions = await prisma.submission.findMany({
      where: {
        userId: user.id,
      },
      take: 10,
      orderBy: { submittedAt: 'desc' },
      include: {
        problem: {
          select: {
            title: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    });

    // Activity Calendar
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    
    const allYearSubmissions = await prisma.submission.findMany({
      where: {
        userId: user.id,
        submittedAt: {
          gte: oneYearAgo
        }
      },
      select: {
        submittedAt: true
      }
    });

    const activityMap: Record<string, number> = {};
    allYearSubmissions.forEach(sub => {
      const dateStr = sub.submittedAt.toISOString().split('T')[0];
      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
    });

    const activityData = [];
    for (let i = 365; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      let level = 0;
      if (count > 0) level = 1;
      if (count > 3) level = 2;
      if (count > 6) level = 3;
      if (count > 8) level = 4;
      activityData.push({ date: dateStr, count, level });
    }

    // Difficulty Breakdown
    const solvedSubmissions = await prisma.submission.findMany({
      where: {
        userId: user.id,
        verdict: 'Accepted',
      },
      distinct: ['problemId'],
      select: {
        problem: {
          select: {
            difficulty: true
          }
        }
      }
    });

    const difficultyBreakdown = { Easy: 0, Medium: 0, Hard: 0 };
    solvedSubmissions.forEach(sub => {
      if (sub.problem && sub.problem.difficulty) {
        difficultyBreakdown[sub.problem.difficulty as 'Easy' | 'Medium' | 'Hard']++;
      }
    });

    // Rating History
    const contestParticipations = await prisma.contestParticipant.findMany({
      where: {
        userId: user.id,
        newRating: { not: null },
      },
      include: { contest: true },
      orderBy: { contest: { endTime: 'asc' } },
    });

    const ratingHistory = contestParticipations.map(cp => ({
      contestName: cp.contest.title,
      date: cp.contest.endTime.toISOString(),
      newRating: cp.newRating,
      oldRating: cp.oldRating,
    }));

    return {
      ...user,
      recentSubmissions,
      activityData,
      difficultyBreakdown,
      ratingHistory,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileDto) {
    // Validate bio length
    if (data.bio && data.bio.length > 500) {
      throw new Error('Bio must be less than 500 characters');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        bio: data.bio,
        location: data.location,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        profilePicture: true,
        location: true,
        linkedinUrl: true,
        githubUrl: true,
        twitterUrl: true,
        websiteUrl: true,
      },
    });

    return user;
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    // Validate file
    if (!fileStorageService.validateFileType(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (!fileStorageService.validateFileSize(file.size)) {
      throw new Error('File size must be less than 5MB');
    }

    // Get current user to delete old picture
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    // Delete old profile picture if exists
    if (user?.profilePicture) {
      await fileStorageService.deleteProfilePicture(user.profilePicture);
    }

    // Upload new picture
    const picturePath = await fileStorageService.uploadProfilePicture(file, userId);

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: picturePath },
      select: {
        id: true,
        username: true,
        profilePicture: true,
      },
    });

    return updatedUser;
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });

    if (user?.profilePicture) {
      await fileStorageService.deleteProfilePicture(user.profilePicture);

      await prisma.user.update({
        where: { id: userId },
        data: { profilePicture: null },
      });
    }

    return { success: true };
  }

  /**
   * Update social media links
   */
  async updateSocialLinks(userId: string, links: SocialLinks) {
    // Validate URLs
    const urlRegex = /^https?:\/\/.+/;

    if (links.linkedinUrl && !urlRegex.test(links.linkedinUrl)) {
      throw new Error('Invalid LinkedIn URL');
    }
    if (links.githubUrl && !urlRegex.test(links.githubUrl)) {
      throw new Error('Invalid GitHub URL');
    }
    if (links.twitterUrl && !urlRegex.test(links.twitterUrl)) {
      throw new Error('Invalid Twitter URL');
    }
    if (links.websiteUrl && !urlRegex.test(links.websiteUrl)) {
      throw new Error('Invalid website URL');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        linkedinUrl: links.linkedinUrl,
        githubUrl: links.githubUrl,
        twitterUrl: links.twitterUrl,
        websiteUrl: links.websiteUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        linkedinUrl: true,
        githubUrl: true,
        twitterUrl: true,
        websiteUrl: true,
      },
    });

    return user;
  }
}

export default new ProfileService();
