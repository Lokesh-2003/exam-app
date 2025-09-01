import React, { useState, useEffect } from 'react';
import { getResults } from '../services/exam';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await getResults();
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <div style={containerStyle}>
      <h2>Your Exam Results</h2>
      {results.length === 0 ? (
        <p>No results found. Complete an exam to see your results here.</p>
      ) : (
        <div style={resultsStyle}>
          {results.map((result, index) => (
            <div key={index} style={resultItemStyle}>
              <h3>{result.exam_title}</h3>
              <p>Score: {result.score}/{result.total_questions}</p>
              <p>Percentage: {((result.score / result.total_questions) * 100).toFixed(2)}%</p>
              <p>Completed on: {new Date(result.completion_date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const containerStyle = {
  maxWidth: '800px',
  margin: '20px auto',
  padding: '20px'
};

const resultsStyle = {
  display: 'grid',
  gap: '20px'
};

const resultItemStyle = {
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  backgroundColor: '#f9f9f9'
};

const errorStyle = {
  color: 'red',
  marginBottom: '15px'
};

export default Results;
