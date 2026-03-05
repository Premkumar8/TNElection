import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
# Example: postgresql://username:password@localhost:5432/tnelection
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/tnelection')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Survey(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    area = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    age_category = db.Column(db.String(50), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    last_voted = db.Column(db.String(100), nullable=False)
    this_time_vote = db.Column(db.String(100), nullable=False)
    who_will_win = db.Column(db.String(100), nullable=False)
    mla_work = db.Column(db.String(100), nullable=False)
    expected_changes = db.Column(db.String(100), nullable=False)
    law_and_order = db.Column(db.String(100), nullable=False)
    drug_usage = db.Column(db.String(100), nullable=False)
    additional_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'area': self.area,
            'gender': self.gender,
            'ageCategory': self.age_category,
            'district': self.district,
            'lastVoted': self.last_voted,
            'thisTimeVote': self.this_time_vote,
            'whoWillWin': self.who_will_win,
            'mlaWork': self.mla_work,
            'expectedChanges': self.expected_changes,
            'lawAndOrder': self.law_and_order,
            'drugUsage': self.drug_usage,
            'additionalNotes': self.additional_notes,
            'createdAt': self.created_at.isoformat()
        }

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

# Create tables
with app.app_context():
    # Note: This will fail if DB is not reachable, but it's fine for now
    try:
        db.create_all()
    except Exception as e:
        print(f"Error creating tables: {e}")

# API Routes
@app.route('/api/survey', methods=['POST'])
def create_survey():
    try:
        data = request.json
        
        required_fields = ['name', 'area', 'gender', 'ageCategory', 'district']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400

        survey = Survey(
            name=data.get('name'),
            area=data.get('area'),
            gender=data.get('gender'),
            age_category=data.get('ageCategory'),
            district=data.get('district'),
            last_voted=data.get('lastVoted'),
            this_time_vote=data.get('thisTimeVote'),
            who_will_win=data.get('whoWillWin'),
            mla_work=data.get('mlaWork'),
            expected_changes=data.get('expectedChanges'),
            law_and_order=data.get('lawAndOrder'),
            drug_usage=data.get('drugUsage'),
            additional_notes=data.get('additionalNotes')
        )

        db.session.add(survey)
        db.session.commit()

        return jsonify({'success': True, 'id': survey.id})
    except Exception as e:
        db.session.rollback()
        print(f"Error saving survey: {e}")
        return jsonify({'error': 'Failed to save survey'}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        admin = Admin.query.filter_by(email=email).first()

        if admin and admin.password == password:
            return jsonify({'success': True, 'token': 'admin-token-123'})
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Error admin login: {e}")
        return jsonify({'error': 'Failed to login'}), 500

@app.route('/api/reports', methods=['GET'])
def get_reports():
    try:
        total_surveys = Survey.query.count()

        # Helper to get stats
        def get_stats(column):
            results = db.session.query(column, db.func.count(column)).group_by(column).all()
            return [{'name': label, 'value': count} for label, count in results]

        by_gender = get_stats(Survey.gender)
        by_age = get_stats(Survey.age_category)
        by_district = get_stats(Survey.district)
        by_party = get_stats(Survey.this_time_vote)
        win_prediction = get_stats(Survey.who_will_win)

        return jsonify({
            'totalSurveys': total_surveys,
            'byGender': by_gender,
            'byAge': by_age,
            'byDistrict': by_district,
            'byParty': by_party,
            'winPrediction': win_prediction
        })
    except Exception as e:
        print(f"Error fetching reports: {e}")
        return jsonify({'error': 'Failed to fetch reports'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
