import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdvancedRetailPortfolioAnalyzer = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-portfolio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse portfolio');
      }

      const data = await response.json();
      setPortfolio(data);
    } catch (err) {
      setError('An error occurred while parsing the portfolio. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async (question) => {
    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      return data.answer;
    } catch (err) {
      console.error(err);
      return 'Failed to get answer';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Advanced Portfolio Risk Analyzer</h1>
      
      <div className="mb-6">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="mb-2"
        />
        <button 
          onClick={handleFileUpload} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Portfolio'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {portfolio && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Risk Metrics</h3>
              <p>{portfolio.riskMetrics}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Sector Exposure</h3>
              <p>{portfolio.sectorExposure}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Major Risk Factors</h3>
              <p>{portfolio.majorRiskFactors}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2">Ask a Question</h3>
            <input 
              type="text" 
              placeholder="Enter your question"
              className="w-full p-2 text-black"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  askQuestion(e.target.value).then(answer => {
                    console.log(answer);
                    // Update UI with the answer
                  });
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedRetailPortfolioAnalyzer;