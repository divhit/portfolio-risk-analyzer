import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { LlamaParse } from '../../lib/llama_parse/src';
import { VectorStoreIndex, Document, OpenAIEmbedding } from 'llamaindex';

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

    // Parse the PDF using LlamaParse
    const parseResult = await llamaParse.load_data(fileContent);

    // Create documents from the parsed result
    const documents = parseResult.map(doc => new Document({ text: doc.text, extra_info: doc.metadata }));

    // Create an index from the documents
    const embedModel = new OpenAIEmbedding({ apiKey: process.env.OPENAI_API_KEY });
    const index = await VectorStoreIndex.fromDocuments(documents, { embedModel });

    // Create a query engine
    const queryEngine = index.asQueryEngine();

    // Perform initial analysis
    const riskMetrics = await queryEngine.query("Summarize the key risk metrics of the portfolio.");
    const sectorExposure = await queryEngine.query("What are the top 3 sectors by exposure in the portfolio?");
    const majorRiskFactors = await queryEngine.query("What are the top 3 risk factors affecting the portfolio?");

    res.status(200).json({
      message: 'PDF parsed successfully',
      riskMetrics: riskMetrics.response,
      sectorExposure: sectorExposure.response,
      majorRiskFactors: majorRiskFactors.response,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process portfolio' });
  }
}