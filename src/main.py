import os
import secrets
from datetime import timedelta

import psycopg
from flask import Flask, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)
app.config.update(
    SECRET_KEY=os.environ.get('SECRET_KEY') or secrets.token_hex(32),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Strict',
    SESSION_COOKIE_SECURE=os.environ.get('COOKIE_SECURE') == '1',
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),
)


def get_conn():
    return psycopg.connect(os.environ['DATABASE_URL'])


def ensure_accounts(conn):
    conn.execute('''CREATE TABLE IF NOT EXISTS accounts (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )''')


@app.before_request
def check_origin():
    if request.path.startswith('/api/') and request.method == 'POST':
        origin = request.headers.get('Origin')
        if origin and origin != request.host_url.rstrip('/'):
            return jsonify(error='Request origin is not allowed.'), 403
        if not request.is_json:
            return jsonify(error='JSON is required.'), 415


@app.errorhandler(psycopg.Error)
def database_error(error):
    app.logger.error('Database operation failed: %s', type(error).__name__)
    return jsonify(error='Account services are unavailable. Please try again later.'), 503


@app.get('/api/session')
def current_session():
    if not session.get('user_id'):
        return jsonify(error='Please log in.'), 401
    with get_conn() as conn:
        user = conn.execute('SELECT id, name, email FROM accounts WHERE id = %s', (session['user_id'],)).fetchone()
    if not user:
        session.clear()
        return jsonify(error='Please log in.'), 401
    return jsonify(user=dict(zip(('id', 'name', 'email'), user)))


@app.post('/api/signup')
def signup():
    data = request.get_json()
    name, email, password = (data.get(key) for key in ('name', 'email', 'password'))
    if not all(isinstance(value, str) for value in (name, email, password)):
        return jsonify(error='Name, email and password are required.'), 400
    name, email = name.strip(), email.strip().lower()
    if not name or len(name) > 100 or '@' not in email or len(email) > 254 or not 8 <= len(password) <= 128:
        return jsonify(error='Enter a name, valid email and a password of 8–128 characters.'), 400
    with get_conn() as conn:
        ensure_accounts(conn)
        user = conn.execute('INSERT INTO accounts (name, email, password_hash) VALUES (%s, %s, %s) ON CONFLICT (email) DO NOTHING RETURNING id', (name, email, generate_password_hash(password))).fetchone()
    if not user:
        return jsonify(error='An account already uses this email. Please log in.'), 409
    return jsonify(message='Account created. Please log in.'), 201


@app.post('/api/login')
def login():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')
    if not isinstance(email, str) or not isinstance(password, str) or len(password) > 128:
        return jsonify(error='Enter your email and password.'), 400
    with get_conn() as conn:
        ensure_accounts(conn)
        user = conn.execute('SELECT id, name, email, password_hash FROM accounts WHERE email = %s', (email.strip().lower(),)).fetchone()
    if not check_password_hash(user[3] if user else generate_password_hash(secrets.token_hex(16)), password):
        return jsonify(error='Incorrect email or password.'), 401
    session.clear()
    session['user_id'] = user[0]
    session.permanent = True
    return jsonify(user=dict(zip(('id', 'name', 'email'), user[:3])))


@app.post('/api/logout')
def logout():
    session.clear()
    return jsonify(message='Logged out.')


@app.get('/')
def index():
    return 'Racquet Sport Management API'
