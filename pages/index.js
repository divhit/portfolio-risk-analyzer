import React from 'react';
import AdvancedRetailPortfolioAnalyzer from '../components/AdvancedRetailPortfolioAnalyzer';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Portfolio Risk Analyzer</h1>
      <AdvancedRetailPortfolioAnalyzer />
    </div>
  );
}