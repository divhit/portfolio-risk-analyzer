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

    // For now, we'll return mock data
    const mockPortfolioData = {
      totalValue: 1000000,
      riskScore: 65,
      sectors: [
        { name: 'Technology', value: 30 },
        { name: 'Finance', value: 25 },
        { name: 'Healthcare', value: 20 },
        { name: 'Consumer Goods', value: 15 },
        { name: 'Energy', value: 10 },
      ],
      assetAllocation: [
        { name: 'Stocks', value: 60 },
        { name: 'Bonds', value: 30 },
        { name: 'Cash', value: 5 },
        { name: 'Real Estate', value: 5 },
      ],
      historicalPerformance: [
        { date: '2020-01', value: 800000 },
        { date: '2020-07', value: 850000 },
        { date: '2021-01', value: 920000 },
        { date: '2021-07', value: 980000 },
        { date: '2022-01', value: 1000000 },
      ],
      recommendations: [
        "Consider diversifying your technology sector holdings to reduce risk.",
        "Your bond allocation is appropriate for your risk level, but consider increasing it slightly for more stability.",
        "Look into adding more international exposure to your portfolio for better diversification.",
      ],
    };

    res.status(200).json(mockPortfolioData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process portfolio' });
  }
}