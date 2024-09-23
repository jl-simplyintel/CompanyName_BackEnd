// express-session.d.ts
import { Session } from '@keystone-6/core/session';

declare module 'express-serve-static-core' {
  interface Request {
    session?: Session;
  }
}
