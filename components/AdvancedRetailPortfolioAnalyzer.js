import React, { useState } from 'react';

const AdvancedRetailPortfolioAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
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
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept=".pdf" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze Portfolio'}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div>
          <h2>Analysis Results</h2>
          <p>Risk Metrics: {result.riskMetrics}</p>
          <p>Sector Exposure: {result.sectorExposure}</p>
          <p>Major Risk Factors: {result.majorRiskFactors}</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedRetailPortfolioAnalyzer;