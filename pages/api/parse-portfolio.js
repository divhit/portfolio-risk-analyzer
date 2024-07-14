import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { LlamaParse } from '../../lib/llama-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

const llamaParse = new LlamaParse({ apiKey: process.env.LLAMA_CLOUD_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = data.files.file;
    const filePath = file.filepath;

    // Read the file
    const fileContent = await fs.readFile(filePath);

    // Parse the PDF using LlamaParse API
    const parseResult = await llamaParse.load_data(fileContent);

    // Process the parseResult to extract portfolio data
    // This is a placeholder implementation. You'll need to adapt this based on the actual structure of the parsed data
    const portfolioData = {
      totalValue: 10000000,
      riskScore: 65,
      sectors: [
        { name: 'Technology', value: 30 },
        { name: 'Finance', value: 25 },
        { name: 'Healthcare', value: 15 },
        { name: 'Consumer Goods', value: 12 },
        { name: 'Energy', value: 8 },
        { name: 'Others', value: 10 },
      ],
      // Add more mock data here
    };

    res.status(200).json(portfolioData);
  } catch (error) {
    console.error('Error processing portfolio:', error);
    res.status(500).json({ error: 'Failed to process portfolio', details: error.message });
  }
}