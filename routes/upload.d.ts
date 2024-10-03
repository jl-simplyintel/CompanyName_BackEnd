// upload.d.ts
declare module './upload' {
    import { NextApiRequest, NextApiResponse } from 'next';
  
    export default function uploadHandler(req: NextApiRequest, res: NextApiResponse): void;
  }
  