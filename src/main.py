import os
import psycopg
from flask import Flask

app = Flask(__name__)

def get_conn():
    return psycopg.connect(os.environ["DATABASE_URL"])

@app.route("/")
def index():
    with get_conn() as conn:
        version = conn.execute("SELECT version()").fetchone()[0]
    return f"Connected to: {version}"