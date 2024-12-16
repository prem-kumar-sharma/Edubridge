from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
import os

# Initialize Flask app
app = Flask(__name__)

# Configuration settings
app.config['SECRET_KEY'] = 'your-secret-key'  # Used for session management
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///edubridge.db'  # Database location
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'  # Folder for document uploads

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager(app)

# Database Models
class User(UserMixin, db.Model):
    """User model storing all user types (teachers, students, admins, clerks)"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(20), nullable=False)  # teacher, student, admin, clerk
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Attendance(db.Model):
    """Attendance records for students"""
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    class_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # present, absent, late
    marked_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Leave(db.Model):
    """Leave requests from staff and students"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    reason = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    document_path = db.Column(db.String(200))  # Path to uploaded documents

class Document(db.Model):
    """Document management system"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(200), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    document_type = db.Column(db.String(50))  # assignment, notice, etc.

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Authentication Routes
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.check_password(data.get('password')):
        login_user(user)
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'role': user.role,
                'name': f"{user.first_name} {user.last_name}"
            }
        })
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'message': 'Username already exists'}), 400
    
    user = User(
        username=data.get('username'),
        email=data.get('email'),
        role=data.get('role'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name')
    )
    user.set_password(data.get('password'))
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'Registration successful'})

# Attendance Management Routes
@app.route('/attendance/mark', methods=['POST'])
@login_required
def mark_attendance():
    if current_user.role != 'teacher':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    attendance = Attendance(
        student_id=data.get('student_id'),
        class_date=datetime.strptime(data.get('date'), '%Y-%m-%d').date(),
        status=data.get('status'),
        marked_by=current_user.id
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance marked successfully'})

@app.route('/attendance/view/<student_id>')
@login_required
def view_attendance(student_id):
    attendance = Attendance.query.filter_by(student_id=student_id).all()
    return jsonify([{
        'date': str(a.class_date),
        'status': a.status
    } for a in attendance])

# Leave Management Routes
@app.route('/leave/request', methods=['POST'])
@login_required
def request_leave():
    data = request.get_json()
    leave = Leave(
        user_id=current_user.id,
        start_date=datetime.strptime(data.get('start_date'), '%Y-%m-%d').date(),
        end_date=datetime.strptime(data.get('end_date'), '%Y-%m-%d').date(),
        reason=data.get('reason')
    )
    
    if 'document' in request.files:
        file = request.files['document']
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        leave.document_path = filename

    db.session.add(leave)
    db.session.commit()
    return jsonify({'message': 'Leave request submitted successfully'})

@app.route('/leave/approve/<leave_id>', methods=['POST'])
@login_required
def approve_leave(leave_id):
    if current_user.role not in ['admin', 'principal']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    leave = Leave.query.get_or_404(leave_id)
    leave.status = 'approved'
    db.session.commit()
    return jsonify({'message': 'Leave approved successfully'})

# Document Management Routes
@app.route('/document/upload', methods=['POST'])
@login_required
def upload_document():
    if 'file' not in request.files:
        return jsonify({'message': 'No file provided'}), 400
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    
    document = Document(
        title=request.form.get('title'),
        file_path=filename,
        uploaded_by=current_user.id,
        document_type=request.form.get('type')
    )
    db.session.add(document)
    db.session.commit()
    return jsonify({'message': 'Document uploaded successfully'})

@app.route('/document/view/<document_id>')
@login_required
def view_document(document_id):
    document = Document.query.get_or_404(document_id)
    return send_file(
        os.path.join(app.config['UPLOAD_FOLDER'], document.file_path),
        as_attachment=True
    )

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True)