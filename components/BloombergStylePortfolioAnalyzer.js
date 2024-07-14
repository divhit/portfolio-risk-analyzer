import React, { useState } from 'react';
import styles from './BloombergStylePortfolioAnalyzer.module.css';

const BloombergStylePortfolioAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleAnalyze = async () => {
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
      setPortfolioData(data);
    } catch (err) {
      setError('An error occurred while parsing the portfolio. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Bloomberg-Style Portfolio Analyzer</h1>
      <div className={styles.uploadSection}>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf"
          className={styles.fileInput}
        />
        <button onClick={handleAnalyze} className={styles.analyzeButton} disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze Portfolio'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {portfolioData && (
        <div className={styles.results}>
          <h2>Analysis Results</h2>
          <pre>{JSON.stringify(portfolioData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default BloombergStylePortfolioAnalyzer;