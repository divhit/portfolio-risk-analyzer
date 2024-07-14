import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#8884D8'];

const BloombergStylePortfolioAnalyzer = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [whatIfScenario, setWhatIfScenario] = useState({});
  const [goalSettings, setGoalSettings] = useState({ targetReturn: 10, maxDrawdown: 20 });

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

  const handleWhatIfChange = (holding, newWeight) => {
    setWhatIfScenario({ ...whatIfScenario, [holding]: newWeight });
  };

  const handleGoalSettingChange = (setting, value) => {
    setGoalSettings({ ...goalSettings, [setting]: value });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Bloomberg-Style Portfolio Analyzer</h1>
      
      <div className="mb-6">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="mb-2 text-sm text-gray-300
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-lg font-bold">{formatCurrency(portfolio.totalValue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Risk Score</p>
                <p className="text-lg font-bold">{portfolio.riskScore}/100</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="text-lg font-bold">{portfolio.riskMetrics.sharpeRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Beta</p>
                <p className="text-lg font-bold">{portfolio.riskMetrics.beta.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
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

          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Historical Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portfolio.historicalPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{backgroundColor: '#333', border: 'none'}} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Risk Metrics</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm text-gray-400">Alpha</p>
                <p className="font-bold">{formatPercentage(portfolio.riskMetrics.alpha)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Beta</p>
                <p className="font-bold">{portfolio.riskMetrics.beta.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Sharpe Ratio</p>
                <p className="font-bold">{portfolio.riskMetrics.sharpeRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Treynor Ratio</p>
                <p className="font-bold">{portfolio.riskMetrics.treynorRatio.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">VaR (95%)</p>
                <p className="font-bold">{formatCurrency(portfolio.riskMetrics.var)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Max Drawdown</p>
                <p className="font-bold">{formatPercentage(portfolio.riskMetrics.maxDrawdown)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Holdings Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis type="number" dataKey="beta" name="Beta" stroke="#888" />
                <YAxis type="number" dataKey="alpha" name="Alpha" stroke="#888" />
                <ZAxis type="number" dataKey="value" range={[50, 400]} name="Value" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{backgroundColor: '#333', border: 'none'}} />
                <Legend />
                <Scatter name="Stocks" data={portfolio.holdings} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Holdings</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-2 text-left">Symbol</th>
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Value</th>
                    <th className="p-2 text-left">Weight</th>
                    <th className="p-2 text-left">Beta</th>
                    <th className="p-2 text-left">Alpha</th>
                    <th className="p-2 text-left">What-If Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-900' : ''}>
                      <td className="p-2">{holding.symbol}</td>
                      <td className="p-2">{holding.name}</td>
                      <td className="p-2">{formatCurrency(holding.value)}</td>
                      <td className="p-2">{formatPercentage(holding.weight)}</td>
                      <td className="p-2">{holding.beta.toFixed(2)}</td>
                      <td className="p-2">{formatPercentage(holding.alpha)}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={whatIfScenario[holding.symbol] || holding.weight * 100}
                          onChange={(e) => handleWhatIfChange(holding.symbol, parseFloat(e.target.value))}
                          className="w-20 bg-gray-700 text-white p-1 rounded"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Goal Settings</h2>
            <div className="flex space-x-4">
              <div>
                <label className="block text-sm text-gray-400">Target Return (%)</label>
                <input
                  type="number"
                  value={goalSettings.targetReturn}
                  onChange={(e) => handleGoalSettingChange('targetReturn', parseFloat(e.target.value))}
                  className="w-20 bg-gray-700 text-white p-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Max Drawdown (%)</label>
                <input
                  type="number"
                  value={goalSettings.maxDrawdown}
                  onChange={(e) => handleGoalSettingChange('maxDrawdown', parseFloat(e.target.value))}
                  className="w-20 bg-gray-700 text-white p-1 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloombergStylePortfolioAnalyzer;