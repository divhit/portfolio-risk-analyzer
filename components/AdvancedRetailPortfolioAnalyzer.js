import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdvancedRetailPortfolioAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a file');
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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score < 20) return 'Very Low';
    if (score < 40) return 'Low';
    if (score < 60) return 'Moderate';
    if (score < 80) return 'High';
    return 'Very High';
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Advanced Portfolio Risk Analyzer</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept=".pdf" 
          className="mb-2"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Portfolio'}
        </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {portfolio && (
        <div>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h2 className="text-2xl font-semibold mb-4">Portfolio Overview</h2>
            <p className="text-lg">Total Value: ${portfolio.totalValue.toLocaleString()}</p>
            <p className="text-lg">Risk Score: {portfolio.riskScore}/100 (Risk Level: {getRiskLevel(portfolio.riskScore)})</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Sector Allocation</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={portfolio.sectors}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {portfolio.sectors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Asset Allocation</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portfolio.assetAllocation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Historical Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolio.historicalPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Recommendations</h2>
            {portfolio.recommendations.map((recommendation, index) => (
              <div key={index} className="bg-yellow-100 p-4 rounded mb-2">
                <p>{recommendation}</p>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Educational Resources</h2>
            <ul className="list-disc pl-5">
              <li><a href="#" className="text-blue-500 hover:underline">Understanding Risk Scores</a></li>
              <li><a href="#" className="text-blue-500 hover:underline">Basics of Diversification</a></li>
              <li><a href="#" className="text-blue-500 hover:underline">Asset Allocation Strategies</a></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedRetailPortfolioAnalyzer;