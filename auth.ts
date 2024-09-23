// auth.ts
import { createAuth } from '@keystone-6/auth';
import { statelessSessions } from '@keystone-6/core/session';

// Configure session and authentication
const sessionMaxAge = 60 * 60 * 24 * 30;
const sessionSecret = process.env.SESSION_SECRET || '-- DEV COOKIE SECRET; CHANGE ME --';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'name role createdAt', // Include 'role' in session data
  initFirstItem: {
    fields: ['name', 'email', 'password', 'role'],
  },
});

const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret,
  secure: false, // Set to 'true' if using HTTPS in production
  sameSite: 'lax', // Ensure cookies are sent with the right requests
  path: '/', // Make sure the cookie is available throughout the app
});

export { withAuth, session };
