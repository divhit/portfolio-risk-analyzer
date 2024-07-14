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
      totalValue: 0,
      riskScore: 0,
      sectors: [],
      holdings: [],
      riskMetrics: {
        alpha: 0,
        beta: 0,
        sharpeRatio: 0,
        treynorRatio: 0,
        informationRatio: 0,
        var: 0,
        maxDrawdown: 0,
      },
      historicalPerformance: [],
    };

    // Extract data from parseResult
    parseResult.forEach(item => {
      if (item.metadata && item.metadata.type === 'portfolio_summary') {
        portfolioData.totalValue = parseFloat(item.text.match(/Total Value: \$([0-9,.]+)/)[1].replace(/,/g, ''));
        portfolioData.riskScore = parseInt(item.text.match(/Risk Score: (\d+)/)[1]);
      } else if (item.metadata && item.metadata.type === 'sector_allocation') {
        const sectorMatches = item.text.matchAll(/(\w+): ([\d.]+)%/g);
        for (const match of sectorMatches) {
          portfolioData.sectors.push({ name: match[1], value: parseFloat(match[2]) });
        }
      } else if (item.metadata && item.metadata.type === 'holding') {
        portfolioData.holdings.push({
          symbol: item.metadata.symbol,
          name: item.metadata.name,
          value: parseFloat(item.text.match(/Value: \$([0-9,.]+)/)[1].replace(/,/g, '')),
          weight: parseFloat(item.text.match(/Weight: ([\d.]+)%/)[1]) / 100,
          beta: parseFloat(item.text.match(/Beta: ([\d.]+)/)[1]),
          alpha: parseFloat(item.text.match(/Alpha: ([\d.]+)%/)[1]) / 100,
        });
      } else if (item.metadata && item.metadata.type === 'risk_metrics') {
        portfolioData.riskMetrics = {
          alpha: parseFloat(item.text.match(/Alpha: ([\d.]+)%/)[1]) / 100,
          beta: parseFloat(item.text.match(/Beta: ([\d.]+)/)[1]),
          sharpeRatio: parseFloat(item.text.match(/Sharpe Ratio: ([\d.]+)/)[1]),
          treynorRatio: parseFloat(item.text.match(/Treynor Ratio: ([\d.]+)/)[1]),
          informationRatio: parseFloat(item.text.match(/Information Ratio: ([\d.]+)/)[1]),
          var: parseFloat(item.text.match(/VaR \(95%\): \$([0-9,.]+)/)[1].replace(/,/g, '')),
          maxDrawdown: parseFloat(item.text.match(/Max Drawdown: ([\d.]+)%/)[1]) / 100,
        };
      } else if (item.metadata && item.metadata.type === 'historical_performance') {
        const performanceMatches = item.text.matchAll(/(\d{4}-\d{2}): \$([0-9,.]+)/g);
        for (const match of performanceMatches) {
          portfolioData.historicalPerformance.push({
            date: match[1],
            value: parseFloat(match[2].replace(/,/g, '')),
          });
        }
      }
    });

    // Sort historical performance by date
    portfolioData.historicalPerformance.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json(portfolioData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process portfolio', details: error.message });
  }
}