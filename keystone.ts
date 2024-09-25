import { config } from '@keystone-6/core';
import { lists } from './schema';
import { withAuth, session } from './auth';
import csurf from 'csurf';

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
        // Add CSRF protection
        app.use(csurf({ cookie: { secure: process.env.NODE_ENV === 'production' } }));
      },
    },
    db: {
      provider: 'sqlite',
      url: 'file:./keystone.db',
    },
    lists,
    session,
    ui: {
      isAccessAllowed: ({ session }) => !!session && session.data.role === 'admin',
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
