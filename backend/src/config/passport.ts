import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from './database';
import { Role } from '@prisma/client';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error('No email found from Google'));

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              username: `google_${profile.id}`,
              email,
              passwordHash: '', // Social users don't have passwords
              provider: 'google',
              providerId: profile.id,
              fullName: profile.displayName,
              isEmailVerified: true, // Google verifies emails
              role: Role.STUDENT,
              notificationSetting: { create: {} }
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy',
      callbackURL: '/api/auth/github/callback',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0].value || `${profile.username}@github.com`;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              username: profile.username || `github_${profile.id}`,
              email,
              passwordHash: '',
              provider: 'github',
              providerId: profile.id.toString(),
              fullName: profile.displayName || profile.username,
              isEmailVerified: true,
              role: Role.STUDENT,
              notificationSetting: { create: {} }
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
