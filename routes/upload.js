// pages/api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable the built-in body parser for file uploads
  },
};

export default async function handler(req, res) {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form data:', err);
      return res.status(500).json({ error: 'Error parsing the form data' });
    }

    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded or multiple files uploaded' });
    }

    console.log('File uploaded:', file);

    const uploadDir = path.join(process.cwd(), 'public/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const newFilename = `${Date.now()}_${file.newFilename}`;
    const newPath = path.join(uploadDir, newFilename);

    // Move the file to the uploads directory
    fs.rename(file.filepath, newPath, async (err) => {
      if (err) {
        console.error('Error moving file:', err);
        return res.status(500).json({ error: 'Error moving the uploaded file' });
      }

      try {
        // Construct the URL of the image
        const imageUrl = `/images/${newFilename}`;

        // Assuming `productId` is sent from the client
        const productId = fields.productId;

        // Send the GraphQL mutation request
        const graphqlResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
          method: 'POST',
          headers: {
            'Apollo-Require-Preflight': 'true', // This header to bypass CSRF check
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          },
          body: JSON.stringify({
            query: `
              mutation ($data: ImageCreateInput!) {
                createImage(data: $data) {
                  id
                  file {
                    id
                    url
                  }
                }
              }
            `,
            variables: {
              data: {
                file: { upload: newFilename },
                product: { connect: { id: productId } },
              },
            },
          }),
        });

        const graphqlResult = await graphqlResponse.json();

        console.log('Full GraphQL Response:', graphqlResult); // Log the full response for debugging

        if (graphqlResult.errors) {
          console.error('GraphQL Errors:', graphqlResult.errors);
          return res.status(500).json({ error: graphqlResult.errors });
        }

        if (graphqlResponse.ok && graphqlResult.data && graphqlResult.data.createImage) {
          // Successful upload
          res.status(200).json({
            message: 'Image uploaded and associated with product',
            image: graphqlResult.data.createImage,
          });
        } else {
          console.error('Unexpected GraphQL Response:', graphqlResult);
          return res.status(500).json({ error: 'Unexpected response from GraphQL' });
        }
      } catch (error) {
        console.error('Error during GraphQL request:', error);
        return res.status(500).json({ error: 'Error uploading file to Keystone via GraphQL' });
      }
    });
  });
}
