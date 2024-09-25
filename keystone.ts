import { config } from '@keystone-6/core';
import { lists } from './schema';
import { withAuth, session } from './auth';

export default withAuth(
  config({
    server: {
      cors: {
<<<<<<< HEAD
        origin: ['https://lightslategray-mink-295930.hostingersite.com', 'https://hotpink-eel-680709.hostingersite.com'],
=======
        origin: [
      'https://lightyellow-reindeer-503269.hostingersite.com', 
      'https://simply-intel-vjuz.vercel.app', 
      'https://simply-intel-vjuz-git-main-sepis-projects.vercel.app'
    ],
>>>>>>> 3d9ba61 (Initial commit)
        credentials: true,
      },
      port: 7000,
      host: '0.0.0.0',
    },
    db: {
      provider: 'sqlite',
      url: 'file:./keystone.db',
    },
    lists,
    session,
    ui: {
      // Allow access to the Admin UI only for users with an 'admin' role
      isAccessAllowed: ({ session }) => {
        return !!session && session.data.role === 'admin';
      },
    },
    graphql: {
      // Enable public access to specific mutations like authenticateUserWithPassword
      apolloConfig: {
        introspection: true, // This allows GraphQL playground introspection
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
