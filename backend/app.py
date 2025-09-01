from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from models import User, Exam, Question, ExamAttempt, UserAnswer
from database import db
from auth import jwt, jwt_required, create_access_token
import os
from dotenv import load_dotenv

load_dotenv()
def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
    db.init_app(app)
    CORS(app, origins=["http://localhost:3000"])
    
    from auth import init_auth
    init_auth(app)
  
    @app.route('/api/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return jsonify({'error': 'Username and password are required'}), 400
                
            if User.query.filter_by(username=username).first():
                return jsonify({'error': 'Username already exists'}), 409
                
            user = User(username=username)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            
            return jsonify({'message': 'User created successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                return jsonify({'error': 'Username and password are required'}), 400
                
            user = User.query.filter_by(username=username).first()
            
            if user and user.check_password(password):
                access_token = create_access_token(identity=user)
                return jsonify({'access_token': access_token}), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/exams', methods=['GET'])
    @jwt_required()
    def get_exams():
        try:
            exams = Exam.query.all()
            return jsonify([{
                'id': exam.id,
                'title': exam.title,
                'duration': exam.duration
            } for exam in exams]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/exam/<int:exam_id>', methods=['GET'])
    @jwt_required()
    def get_exam(exam_id):
        try:
            current_user_id = get_jwt_identity()
            active_attempt = ExamAttempt.query.filter_by(
                user_id=current_user_id, 
                exam_id=exam_id,
                end_time=None
            ).first()
            
            if active_attempt:
                elapsed_time = datetime.utcnow() - active_attempt.start_time
                remaining_seconds = max(0, (active_attempt.exam.duration * 60) - elapsed_time.total_seconds())
                
                questions = Question.query.filter_by(exam_id=exam_id).all()
                user_answers = {ua.question_id: ua.selected_answer for ua in active_attempt.answers}
                
                return jsonify({
                    'attempt_id': active_attempt.id,
                    'remaining_time': remaining_seconds,
                    'questions': [{
                        'id': q.id,
                        'question_text': q.question_text,
                        'option_a': q.option_a,
                        'option_b': q.option_b,
                        'option_c': q.option_c,
                        'option_d': q.option_d,
                        'selected_answer': user_answers.get(q.id)
                    } for q in questions]
                }), 200
            else:
                exam = Exam.query.get_or_404(exam_id)
                new_attempt = ExamAttempt(
                    user_id=current_user_id,
                    exam_id=exam_id,
                    start_time=datetime.utcnow()
                )
                db.session.add(new_attempt)
                db.session.commit()
                questions = Question.query.filter_by(exam_id=exam_id).order_by(db.func.random()).all()
                
                return jsonify({
                    'attempt_id': new_attempt.id,
                    'remaining_time': exam.duration * 60,
                    'questions': [{
                        'id': q.id,
                        'question_text': q.question_text,
                        'option_a': q.option_a,
                        'option_b': q.option_b,
                        'option_c': q.option_c,
                        'option_d': q.option_d,
                        'selected_answer': None
                    } for q in questions]
                }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/answer', methods=['POST'])
    @jwt_required()
    def save_answer():
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            attempt_id = data.get('attempt_id')
            question_id = data.get('question_id')
            selected_answer = data.get('selected_answer')
            
            if not all([attempt_id, question_id, selected_answer]):
                return jsonify({'error': 'Missing required fields'}), 400
            
            attempt = ExamAttempt.query.filter_by(id=attempt_id, user_id=current_user_id).first()
            if not attempt:
                return jsonify({'error': 'Invalid attempt'}), 404
              
            user_answer = UserAnswer.query.filter_by(
                attempt_id=attempt_id, 
                question_id=question_id
            ).first()
            
            if user_answer:
                user_answer.selected_answer = selected_answer
            else:
                user_answer = UserAnswer(
                    attempt_id=attempt_id,
                    question_id=question_id,
                    selected_answer=selected_answer
                )
                db.session.add(user_answer)
            
            db.session.commit()
            return jsonify({'message': 'Answer saved successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/submit', methods=['POST'])
    @jwt_required()
    def submit_exam():
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            attempt_id = data.get('attempt_id')
            
            if not attempt_id:
                return jsonify({'error': 'Attempt ID is required'}), 400
            
            attempt = ExamAttempt.query.filter_by(id=attempt_id, user_id=current_user_id).first()
            if not attempt:
                return jsonify({'error': 'Invalid attempt'}), 404
            
            answers = UserAnswer.query.filter_by(attempt_id=attempt_id).all()
            questions = {q.id: q for q in Question.query.filter_by(exam_id=attempt.exam_id).all()}
            
            score = 0
            for answer in answers:
                if answer.selected_answer == questions[answer.question_id].correct_answer:
                    score += 1
            
            attempt.end_time = datetime.utcnow()
            attempt.score = score
            
            db.session.commit()
            
            return jsonify({
                'score': score,
                'total_questions': len(questions),
                'message': 'Exam submitted successfully'
            }), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/results', methods=['GET'])
    @jwt_required()
    def get_results():
        try:
            current_user_id = get_jwt_identity()
            attempts = ExamAttempt.query.filter_by(
                user_id=current_user_id
            ).filter(ExamAttempt.end_time.isnot(None)).all()
            
            return jsonify([{
                'exam_title': attempt.exam.title,
                'score': attempt.score,
                'total_questions': len(attempt.exam.questions),
                'completion_date': attempt.end_time.isoformat()
            } for attempt in attempts]), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    @app.route('/api/seed', methods=['POST'])
    def seed_database():
        try:
            exam = Exam(title="Python Programming Test", duration=30)
            db.session.add(exam)
            db.session.commit()
            
            questions = [
                {
                    "question_text": "Which keyword is used to define a function in Python?",
                    "option_a": "function",
                    "option_b": "def",
                    "option_c": "define",
                    "option_d": "func",
                    "correct_answer": "b"
                },
                {
                    "question_text": "Which data type is mutable in Python?",
                    "option_a": "tuple",
                    "option_b": "string",
                    "option_c": "list",
                    "option_d": "integer",
                    "correct_answer": "c"
                },
                {
                    "question_text": "What does the 'len()' function do?",
                    "option_a": "Returns the length of an object",
                    "option_b": "Converts a value to integer",
                    "option_c": "Returns the largest item in an iterable",
                    "option_d": "Reads input from the user",
                    "correct_answer": "a"
                },
                {
                    "question_text": "Which operator is used for exponentiation in Python?",
                    "option_a": "^",
                    "option_b": "**",
                    "option_c": "//",
                    "option_d": "%%",
                    "correct_answer": "b"
                },
                {
                    "question_text": "What is the output of 'Hello'[1:]?",
                    "option_a": "H",
                    "option_b": "He",
                    "option_c": "ello",
                    "option_d": "Hello",
                    "correct_answer": "c"
                }
            ]
            
            for q_data in questions:
                question = Question(
                    exam_id=exam.id,
                    question_text=q_data["question_text"],
                    option_a=q_data["option_a"],
                    option_b=q_data["option_b"],
                    option_c=q_data["option_c"],
                    option_d=q_data["option_d"],
                    correct_answer=q_data["correct_answer"]
                )
                db.session.add(question)
            
            db.session.commit()
            return jsonify({'message': 'Database seeded successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
