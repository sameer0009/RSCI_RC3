import axios from 'axios';
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
        const email = (profile as any)._json?.email_verified === true ? profile.emails?.[0].value : undefined;
        if (!email) return done(new Error('No email found from Google'));

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) return done(new Error('Contact an admin to provision your account'));

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
        const { data: emails } = await axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' }, timeout: 10000 });
        const email = emails.find((item: any) => item.primary && item.verified)?.email;
        if (!email) return done(new Error('A verified primary email is required'));

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) return done(new Error('Contact an admin to provision your account'));

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
