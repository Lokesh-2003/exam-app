import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getExam, saveAnswer, submitExam } from '../services/exam';

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (remainingTime === 0 && examData) {
      handleSubmit();
    }
  }, [remainingTime, examData]);

  const fetchExam = async () => {
    try {
      const response = await getExam(examId);
      setExamData(response.data);
      setRemainingTime(response.data.remaining_time);
    
      const initialAnswers = {};
      response.data.questions.forEach((q, index) => {
        if (q.selected_answer) {
          initialAnswers[index] = q.selected_answer;
        }
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch exam');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer) => {
    try {
      const questionId = examData.questions[currentQuestion].id;
      await saveAnswer(examData.attempt_id, questionId, answer);
      
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: answer
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save answer');
    }
  };

  const handleNext = () => {
    if (currentQuestion < examData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await submitExam(examData.attempt_id);
      alert(`Exam submitted! Your score: ${response.data.score}/${response.data.total_questions}`);
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit exam');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={errorStyle}>{error}</div>;
  if (!examData) return <div>No exam data found</div>;

  const question = examData.questions[currentQuestion];

  return (
    <div style={containerStyle}>
      <div style={timerStyle}>
        Time Remaining: {formatTime(remainingTime)}
      </div>
      
      <div style={questionCounterStyle}>
        Question {currentQuestion + 1} of {examData.questions.length}
      </div>
      
      <div style={questionStyle}>
        <h3>{question.question_text}</h3>
        <div style={optionsStyle}>
          {['a', 'b', 'c', 'd'].map(option => (
            <div key={option} style={optionStyle}>
              <label>
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={() => handleAnswerSelect(option)}
                />
                {question[`option_${option}`]}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div style={navigationStyle}>
        <button 
          onClick={handlePrevious} 
          disabled={currentQuestion === 0}
          style={navButtonStyle}
        >
          Previous
        </button>
        
        {currentQuestion === examData.questions.length - 1 ? (
          <button onClick={handleSubmit} style={submitButtonStyle}>
            Submit Exam
          </button>
        ) : (
          <button onClick={handleNext} style={navButtonStyle}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};

const containerStyle = {
  maxWidth: '800px',
  margin: '20px auto',
  padding: '20px'
};

const timerStyle = {
  position: 'fixed',
  top: '70px',
  right: '20px',
  padding: '10px',
  backgroundColor: '#333',
  color: 'white',
  borderRadius: '5px',
  fontWeight: 'bold'
};

const questionCounterStyle = {
  marginBottom: '20px',
  fontSize: '18px',
  fontWeight: 'bold'
};

const questionStyle = {
  marginBottom: '30px'
};

const optionsStyle = {
  marginTop: '20px'
};

const optionStyle = {
  marginBottom: '10px',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  cursor: 'pointer'
};

const navigationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '30px'
};

const navButtonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '3px',
  cursor: 'pointer'
};

const submitButtonStyle = {
  padding: '10px 20px',
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

export default Exam;
