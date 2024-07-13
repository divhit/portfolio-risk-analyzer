export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  try {
    // Here you would typically use the query engine to get the answer
    // For now, we'll just return a mock response
    const answer = `This is a mock answer to the question: ${question}`;

    res.status(200).json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process question' });
  }
}