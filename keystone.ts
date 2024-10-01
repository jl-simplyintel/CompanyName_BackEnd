import { config } from '@keystone-6/core';
import { lists } from './schema';
import { withAuth, session } from './auth';
import cors from 'cors';

export default withAuth(
  config({
    server: {
      cors: {
        origin: [
          'https://companynameadmin-008a72cce60a.herokuapp.com', 
          'https://company-name-cyan.vercel.app', 
          'https://company-name-git-main-sepis-projects.vercel.app'
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
            'https://company-name-git-main-sepis-projects.vercel.app'
          ],
          credentials: true,
        }));
      }
    },
    db: {
      provider: 'sqlite',
      url: 'file:./keystone.db',
    },
    lists,
    session,
    ui: {
      isAccessAllowed: ({ session }) => !!session && session.data.role === 'admin' || session.data.role === 'manager',
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
