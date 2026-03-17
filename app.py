import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy import text, inspect as sa_inspect
from twilio.rest import Client

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
    planning_to_vote = db.Column(db.String(50), nullable=True)
    knows_candidates = db.Column(db.String(50), nullable=True)
    biggest_issue = db.Column(db.String(100), nullable=True)
    biggest_issue_other = db.Column(db.String(255), nullable=True)
    government_performance = db.Column(db.String(50), nullable=True)
    candidate_quality = db.Column(db.String(100), nullable=True)
    manifesto_priority = db.Column(db.String(100), nullable=True)
    mla_immediate_problem = db.Column(db.Text, nullable=True)
    governance_improvements = db.Column(db.Text, nullable=True)
    website_usefulness = db.Column(db.String(50), nullable=True)
    platform_features = db.Column(db.Text, nullable=True)
    homepage_poll_issue = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        biggest_issue_display = self.biggest_issue
        if biggest_issue_display == 'Other' and self.biggest_issue_other:
            biggest_issue_display = f"Other: {self.biggest_issue_other}"
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
            'planningToVote': self.planning_to_vote or self.last_voted,
            'knowsCandidates': self.knows_candidates or self.this_time_vote,
            'biggestIssue': self.biggest_issue or self.who_will_win,
            'biggestIssueOther': self.biggest_issue_other,
            'biggestIssueDisplay': biggest_issue_display or self.biggest_issue or self.who_will_win,
            'governmentPerformance': self.government_performance or self.mla_work,
            'candidateQuality': self.candidate_quality or self.expected_changes,
            'manifestoPriority': self.manifesto_priority or self.law_and_order,
            'mlaImmediateProblem': self.mla_immediate_problem or self.area_problems,
            'governanceImprovements': self.governance_improvements or self.additional_notes,
            'websiteUsefulness': self.website_usefulness or self.drug_usage,
            'platformFeatures': self.platform_features,
            'homepagePollIssue': self.homepage_poll_issue,
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
        inspector = sa_inspect(db.engine)
        columns = [c['name'] for c in inspector.get_columns('survey')]
        column_definitions = {
            'area_problems': 'TEXT',
            'planning_to_vote': 'VARCHAR(50)',
            'knows_candidates': 'VARCHAR(50)',
            'biggest_issue': 'VARCHAR(100)',
            'biggest_issue_other': 'VARCHAR(255)',
            'government_performance': 'VARCHAR(50)',
            'candidate_quality': 'VARCHAR(100)',
            'manifesto_priority': 'VARCHAR(100)',
            'mla_immediate_problem': 'TEXT',
            'governance_improvements': 'TEXT',
            'website_usefulness': 'VARCHAR(50)',
            'platform_features': 'TEXT',
            'homepage_poll_issue': 'VARCHAR(100)',
        }
        missing_columns = [name for name in column_definitions if name not in columns]
        if missing_columns:
            with db.engine.connect() as conn:
                for column_name in missing_columns:
                    conn.execute(text(f"ALTER TABLE survey ADD COLUMN {column_name} {column_definitions[column_name]}"))
                conn.commit()
    except Exception as e:
        print(f"Error creating tables: {e}")

# --- Helpers ---

def get_setting(key, default=None):
    s = Settings.query.filter_by(key=key).first()
    return s.value if s else default

def send_sms_twilio(phone_number, message):
    account_sid = os.getenv('TWILIO_ACCOUNT_SID', '')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN', '')
    from_number = os.getenv('TWILIO_FROM_NUMBER', '')
    if not account_sid or not auth_token or not from_number:
        print("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER not set")
        return False

    raw = str(phone_number).strip()
    digits = ''.join(ch for ch in raw if ch.isdigit())
    if raw.startswith('+') and digits:
        to_number = f"+{digits}"
    elif len(digits) == 10:
        to_number = f"+91{digits}"
    elif len(digits) == 12 and digits.startswith('91'):
        to_number = f"+{digits}"
    else:
        print(f"Invalid phone number for Twilio: {phone_number}")
        return False

    try:
        client = Client(account_sid, auth_token)
        sms = client.messages.create(
            body=message,
            from_=from_number,
            to=to_number,
        )
        print(f"Twilio SMS sent: sid={sms.sid}, to={to_number}")
        return True
    except Exception as e:
        print(f"Twilio error: {e}")
        return False

# --- API Routes ---
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'service': 'TN Election API',
        'status': 'ok',
        'endpoints': ['/api/survey', '/api/admin/login', '/api/reports', '/api/surveys', '/api/districts']
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/survey', methods=['POST'])
def create_survey():
    try:
        data = request.json
        
        required_fields = [
            'name', 'area', 'gender', 'ageCategory', 'district', 'planningToVote',
            'knowsCandidates', 'biggestIssue', 'governmentPerformance',
            'candidateQuality', 'manifestoPriority', 'mlaImmediateProblem',
            'governanceImprovements', 'websiteUsefulness', 'platformFeatures',
            'homepagePollIssue'
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'தேவையான புலம் இல்லை: {field}'}), 400

        if data.get('biggestIssue') in ['Other', 'மற்றவை'] and not data.get('biggestIssueOther'):
            return jsonify({'error': 'தேவையான புலம் இல்லை: biggestIssueOther'}), 400

        survey = Survey(
            name=data.get('name'),
            area=data.get('area'),
            gender=data.get('gender'),
            age_category=data.get('ageCategory'),
            district=data.get('district'),
            last_voted=data.get('planningToVote'),
            this_time_vote=data.get('knowsCandidates'),
            who_will_win=data.get('biggestIssue'),
            mla_work=data.get('governmentPerformance'),
            expected_changes=data.get('candidateQuality'),
            law_and_order=data.get('manifestoPriority'),
            drug_usage=data.get('websiteUsefulness'),
            additional_notes=data.get('governanceImprovements'),
            area_problems=data.get('mlaImmediateProblem'),
            planning_to_vote=data.get('planningToVote'),
            knows_candidates=data.get('knowsCandidates'),
            biggest_issue=data.get('biggestIssue'),
            biggest_issue_other=data.get('biggestIssueOther'),
            government_performance=data.get('governmentPerformance'),
            candidate_quality=data.get('candidateQuality'),
            manifesto_priority=data.get('manifestoPriority'),
            mla_immediate_problem=data.get('mlaImmediateProblem'),
            governance_improvements=data.get('governanceImprovements'),
            website_usefulness=data.get('websiteUsefulness'),
            platform_features=data.get('platformFeatures'),
            homepage_poll_issue=data.get('homepagePollIssue')
        )

        db.session.add(survey)
        db.session.commit()

        return jsonify({'success': True, 'id': survey.id})
    except Exception as e:
        db.session.rollback()
        print(f"Error saving survey: {e}")
        return jsonify({'error': 'கணக்கெடுப்பை சேமிக்க முடியவில்லை'}), 500

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
            return jsonify({'error': 'தவறான உள்நுழைவு விவரங்கள்'}), 401
    except Exception as e:
        print(f"Error admin login: {e}")
        return jsonify({'error': 'உள்நுழைய முடியவில்லை'}), 500

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
        return jsonify({'error': 'கணக்கெடுப்பு பதிவுகளை பெற முடியவில்லை'}), 500

@app.route('/api/reports', methods=['GET'])
def get_reports():
    try:
        base = apply_filters(Survey.query)
        total_surveys = base.count()

        def get_stats(column):
            results = apply_filters(db.session.query(column, db.func.count(column))).group_by(column).all()
            return [{'name': label, 'value': count} for label, count in results if label]

        by_gender = get_stats(Survey.gender)
        by_age = get_stats(Survey.age_category)
        by_district = get_stats(Survey.district)
        by_planning_to_vote = get_stats(Survey.planning_to_vote)
        by_government_performance = get_stats(Survey.government_performance)
        by_website_usefulness = get_stats(Survey.website_usefulness)
        by_homepage_poll = get_stats(Survey.homepage_poll_issue)
        by_biggest_issue = []
        issue_counts = {}
        for survey in apply_filters(Survey.query).all():
            label = survey.biggest_issue
            if not label:
                continue
            if label in ['Other', 'மற்றவை'] and survey.biggest_issue_other:
                label = f"மற்றவை: {survey.biggest_issue_other}"
            issue_counts[label] = issue_counts.get(label, 0) + 1
        by_biggest_issue = sorted(
            [{'name': name, 'value': count} for name, count in issue_counts.items()],
            key=lambda item: (-item['value'], item['name'])
        )

        return jsonify({
            'totalSurveys': total_surveys,
            'byGender': by_gender,
            'byAge': by_age,
            'byDistrict': by_district,
            'byPlanningToVote': by_planning_to_vote,
            'byBiggestIssue': by_biggest_issue,
            'byGovernmentPerformance': by_government_performance,
            'byWebsiteUsefulness': by_website_usefulness,
            'byHomepagePoll': by_homepage_poll
        })
    except Exception as e:
        print(f"Error fetching reports: {e}")
        return jsonify({'error': 'அறிக்கைகளை பெற முடியவில்லை'}), 500

@app.route('/webhook/missed-call', methods=['GET', 'POST'])
def missed_call_webhook():
    """Servetel missed call webhook — called when someone calls the virtual number."""
    try:
        data = request.form if request.form else request.args
        caller_id = data.get('caller_id') or data.get('mobile_no') or data.get('CallerNumber') or ''
        if not caller_id:
            return jsonify({'error': 'caller_id இல்லை'}), 400

        app_url = get_setting('app_url', '')
        sms_template = get_setting('sms_message',
            'Thank you for calling! Please share your feedback here: {link}')

        if not app_url:
            return jsonify({'error': 'settings-இல் app_url அமைக்கப்படவில்லை'}), 500

        message = sms_template.replace('{link}', app_url)
        success = send_sms_twilio(caller_id, message)
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
