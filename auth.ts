import { createAuth } from '@keystone-6/auth';
import { statelessSessions } from '@keystone-6/core/session';

// Define your own Session type based on what you include in sessionData
type Session = {
  data: {
    id: string;
    name: string;
    role: string; // Store the role as a string instead of boolean flags
    createdAt: string;
  };
};

// Configure session and authentication
const sessionMaxAge = 60 * 60 * 24 * 30; // 30 days
const sessionSecret = process.env.SESSION_SECRET || '-- DEV COOKIE SECRET; CHANGE ME --';

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  sessionData: 'id name role createdAt', // Include role in sessionData instead of boolean fields
  initFirstItem: {
    fields: ['name', 'email', 'password', 'role'], // First user can set their role
  },
});

// Session configuration
const session = statelessSessions({
  maxAge: sessionMaxAge,
  secret: sessionSecret,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  sameSite: 'lax', // Ensure cookies are sent with the right requests
  path: '/', // Make sure the cookie is available throughout the app
});

export { withAuth, session };
