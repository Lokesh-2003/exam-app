import api from './api';

export const getExams = () => {
  return api.get('/exams');
};

export const getExam = (examId) => {
  return api.get(`/exam/${examId}`);
};

export const saveAnswer = (attemptId, questionId, selectedAnswer) => {
  return api.post('/answer', { attempt_id: attemptId, question_id: questionId, selected_answer: selectedAnswer });
};

export const submitExam = (attemptId) => {
  return api.post('/submit', { attempt_id: attemptId });
};

export const getResults = () => {
  return api.get('/results');
};

export const seedDatabase = () => {
  return api.post('/seed');
};
