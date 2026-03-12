import os
import requests as http_requests
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy import text, inspect as sa_inspect

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
    area_problems = db.Column(db.Text, nullable=True)
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
            'areaProblems': self.area_problems,
            'createdAt': self.created_at.isoformat()
        }

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=True)

# Create tables
with app.app_context():
    try:
        db.create_all()
        # Migration: add area_problems column if not exists
        inspector = sa_inspect(db.engine)
        columns = [c['name'] for c in inspector.get_columns('survey')]
        if 'area_problems' not in columns:
            with db.engine.connect() as conn:
                conn.execute(text('ALTER TABLE survey ADD COLUMN area_problems TEXT'))
                conn.commit()
    except Exception as e:
        print(f"Error creating tables: {e}")

# --- Helpers ---

def get_setting(key, default=None):
    s = Settings.query.filter_by(key=key).first()
    return s.value if s else default

def send_sms_fast2sms(phone_number, message):
    api_key = os.getenv('FAST2SMS_API_KEY', '')
    if not api_key:
        print("FAST2SMS_API_KEY not set")
        return False
    # Normalize: strip country code, keep last 10 digits
    number = str(phone_number).strip().lstrip('+')
    if number.startswith('91') and len(number) == 12:
        number = number[2:]
    url = "https://www.fast2sms.com/dev/bulkV2"
    headers = {"authorization": api_key, "Content-Type": "application/json"}
    payload = {
        "route": "q",
        "message": message,
        "language": "english",
        "flash": 0,
        "numbers": number
    }
    try:
        resp = http_requests.post(url, json=payload, headers=headers, timeout=10)
        result = resp.json()
        print(f"Fast2SMS response: {result}")
        return result.get('return', False)
    except Exception as e:
        print(f"Fast2SMS error: {e}")
        return False

# --- API Routes ---
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
            additional_notes=data.get('additionalNotes'),
            area_problems=data.get('areaProblems')
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

def apply_filters(query):
    district = request.args.get('district')
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    if district:
        query = query.filter(Survey.district == district)
    if from_date:
        query = query.filter(Survey.created_at >= datetime.strptime(from_date, '%Y-%m-%d'))
    if to_date:
        dt = datetime.strptime(to_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
        query = query.filter(Survey.created_at <= dt)
    return query

@app.route('/api/districts', methods=['GET'])
def get_districts():
    try:
        results = db.session.query(Survey.district).distinct().all()
        return jsonify({'districts': sorted([r[0] for r in results if r[0]])})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/surveys', methods=['GET'])
def get_surveys():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        query = apply_filters(Survey.query).order_by(Survey.created_at.desc())
        total = query.count()
        surveys = query.offset((page - 1) * per_page).limit(per_page).all()
        return jsonify({
            'surveys': [s.to_dict() for s in surveys],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': max(1, (total + per_page - 1) // per_page)
        })
    except Exception as e:
        print(f"Error fetching surveys: {e}")
        return jsonify({'error': 'Failed to fetch surveys'}), 500

@app.route('/api/reports', methods=['GET'])
def get_reports():
    try:
        base = apply_filters(Survey.query)
        total_surveys = base.count()

        def get_stats(column):
            results = apply_filters(db.session.query(column, db.func.count(column))).group_by(column).all()
            return [{'name': label, 'value': count} for label, count in results]

        by_gender = get_stats(Survey.gender)
        by_age = get_stats(Survey.age_category)
        by_district = get_stats(Survey.district)
        by_party = get_stats(Survey.this_time_vote)
        win_prediction = get_stats(Survey.who_will_win)

        problem_counts = {}
        for survey in apply_filters(Survey.query).filter(Survey.area_problems != None).all():
            if survey.area_problems:
                for problem in survey.area_problems.split(','):
                    problem = problem.strip()
                    if problem:
                        problem_counts[problem] = problem_counts.get(problem, 0) + 1
        problem_breakdown = sorted(
            [{'name': k, 'value': v} for k, v in problem_counts.items()],
            key=lambda x: -x['value']
        )

        return jsonify({
            'totalSurveys': total_surveys,
            'byGender': by_gender,
            'byAge': by_age,
            'byDistrict': by_district,
            'byParty': by_party,
            'winPrediction': win_prediction,
            'problemBreakdown': problem_breakdown
        })
    except Exception as e:
        print(f"Error fetching reports: {e}")
        return jsonify({'error': 'Failed to fetch reports'}), 500

@app.route('/webhook/missed-call', methods=['GET', 'POST'])
def missed_call_webhook():
    """Servetel missed call webhook — called when someone calls the virtual number."""
    try:
        data = request.form if request.form else request.args
        caller_id = data.get('caller_id') or data.get('mobile_no') or data.get('CallerNumber') or ''
        if not caller_id:
            return jsonify({'error': 'No caller_id'}), 400

        app_url = get_setting('app_url', '')
        sms_template = get_setting('sms_message',
            'Thank you for calling! Please share your feedback here: {link}')

        if not app_url:
            return jsonify({'error': 'app_url not configured in settings'}), 500

        message = sms_template.replace('{link}', app_url)
        success = send_sms_fast2sms(caller_id, message)
        return jsonify({'success': success, 'caller': caller_id})
    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/settings', methods=['GET'])
def get_settings():
    try:
        rows = Settings.query.all()
        return jsonify({row.key: row.value for row in rows})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/settings', methods=['POST'])
def update_settings():
    try:
        data = request.json
        for key, value in data.items():
            row = Settings.query.filter_by(key=key).first()
            if row:
                row.value = value
            else:
                db.session.add(Settings(key=key, value=value))
        db.session.commit()
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
