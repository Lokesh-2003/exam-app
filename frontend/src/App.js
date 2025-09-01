import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ExamList from './pages/ExamList';
import Exam from './pages/Exam';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/exams" element={
            <PrivateRoute>
              <ExamList />
            </PrivateRoute>
          } />
          <Route path="/exam/:examId" element={
            <PrivateRoute>
              <Exam />
            </PrivateRoute>
          } />
          <Route path="/results" element={
            <PrivateRoute>
              <Results />
            </PrivateRoute>
          } />
          <Route path="/" element={
            <PrivateRoute>
              <ExamList />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
