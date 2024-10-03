import { config } from '@keystone-6/core';
import { lists } from './schema';
import { withAuth, session } from './auth';
import cors from 'cors';
import uploadHandler from './routes/upload'; // Ensure this path is correct

export default withAuth(
  config({
    server: {
      cors: {
        origin: [
          'https://companynameadmin-008a72cce60a.herokuapp.com',
          'https://company-name-cyan.vercel.app',
          'https://company-name-git-main-sepis-projects.vercel.app',
          'http://localhost:3000'
        ],
        credentials: true,
      },
      port: 7000,
      extendExpressApp: (app) => {
        // Use the CORS middleware with your configuration
        app.use(cors({
          origin: [
            'https://companynameadmin-008a72cce60a.herokuapp.com',
            'https://company-name-cyan.vercel.app',
            'https://company-name-git-main-sepis-projects.vercel.app',
            'http://localhost:3000'
          ],
          credentials: true,
        }));

        // Register the upload route
        app.post('/api/upload', uploadHandler); // This line adds the upload route
      }
    },
    db: {
      provider: 'sqlite',
      url: 'file:./keystone.db',
    },
    lists,
    session,
    ui: {
      isAccessAllowed: ({ session }) => {
        // Check if session exists and user is an admin
        return !!session && session.data.role === 'admin';
      },
    },
    graphql: {
      apolloConfig: {
        introspection: true,
      },
    },
    storage: {
      local_images: {
        kind: 'local',
        type: 'image',
        generateUrl: (path) => `/images${path}`,
        serverRoute: {
          path: '/images',
        },
        storagePath: 'public/images',
      },
    },
  })
);
