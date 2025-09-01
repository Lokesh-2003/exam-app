import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getExams, seedDatabase } from '../services/exam';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await getExams();
      setExams(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      await seedDatabase();
      alert('Database seeded successfully!');
      fetchExams();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to seed database');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <div style={containerStyle}>
      <h2>Available Exams</h2>
      {exams.length === 0 ? (
        <div>
          <p>No exams available.</p>
          <button onClick={handleSeed} style={buttonStyle}>
            Seed Database with Sample Exam
          </button>
        </div>
      ) : (
        <div style={examListStyle}>
          {exams.map(exam => (
            <div key={exam.id} style={examItemStyle}>
              <h3>{exam.title}</h3>
              <p>Duration: {exam.duration} minutes</p>
              <Link to={`/exam/${exam.id}`} style={linkStyle}>
                Start Exam
              </Link>
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

const examListStyle = {
  display: 'grid',
  gap: '20px'
};

const examItemStyle = {
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  backgroundColor: '#f9f9f9'
};

const linkStyle = {
  display: 'inline-block',
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  textDecoration: 'none',
  borderRadius: '3px'
};

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer'
};

const errorStyle = {
  color: 'red',
  marginBottom: '15px'
};

export default ExamList;
