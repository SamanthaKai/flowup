import os
import time
from datetime import date, datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, session
from sqlalchemy import inspect, text
from sqlalchemy.exc import OperationalError
from werkzeug.security import check_password_hash, generate_password_hash

from models import Task, User, db

load_dotenv()

ALLOWED_STATUSES = {"todo", "in_progress", "done"}
ALLOWED_PRIORITIES = {"low", "medium", "high"}

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///flowboard.db"
)
app.secret_key = os.environ.get("SECRET_KEY", "dev-only-not-secure")

db.init_app(app)

# create_all() never alters existing tables, so add columns introduced after
# the first deploy. Small enough that a migration framework isn't worth it.
NEW_COLUMNS = {
    "user": {"name": "VARCHAR(120)"},
    "task": {
        "description": "TEXT",
        "priority": "VARCHAR(10) DEFAULT 'medium'",
        "due_date": "DATE",
        "completed_at": "TIMESTAMP",
    },
}


def add_missing_columns():
    insp = inspect(db.engine)
    with db.engine.begin() as conn:
        for table, cols in NEW_COLUMNS.items():
            existing = {c["name"] for c in insp.get_columns(table)}
            for col, ddl in cols.items():
                if col not in existing:
                    conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN {col} {ddl}'))


with app.app_context():
    for attempt in range(5):
        try:
            db.create_all()
            add_missing_columns()
            break
        except OperationalError:
            if attempt == 4:
                raise
            time.sleep(2)


def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return db.session.get(User, user_id)


def require_login():
    user = current_user()
    if not user:
        return None, (jsonify({"error": "Not authenticated"}), 401)
    return user, None


# ---------- auth & account ----------

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists"}), 409

    user = User(email=email, password_hash=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()
    session["user_id"] = user.id
    return jsonify(user.to_dict()), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = user.id
    return jsonify(user.to_dict())


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"ok": True})


@app.route("/api/auth/me")
def me():
    user = current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify(user.to_dict())


@app.route("/api/auth/me", methods=["PATCH"])
def update_me():
    user, err = require_login()
    if err:
        return err
    data = request.get_json(silent=True) or {}
    if "name" in data:
        user.name = str(data["name"] or "").strip()[:120]
    db.session.commit()
    return jsonify(user.to_dict())


@app.route("/api/auth/password", methods=["POST"])
def change_password():
    user, err = require_login()
    if err:
        return err
    data = request.get_json(silent=True) or {}
    current = str(data.get("current_password", ""))
    new = str(data.get("new_password", ""))
    if not check_password_hash(user.password_hash, current):
        return jsonify({"error": "Current password is incorrect"}), 400
    if len(new) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400
    user.password_hash = generate_password_hash(new)
    db.session.commit()
    return jsonify({"ok": True})


@app.route("/api/auth/me", methods=["DELETE"])
def delete_me():
    user, err = require_login()
    if err:
        return err
    data = request.get_json(silent=True) or {}
    if not check_password_hash(user.password_hash, str(data.get("password", ""))):
        return jsonify({"error": "Password is incorrect"}), 400
    Task.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()
    session.clear()
    return jsonify({"ok": True})


# ---------- tasks ----------

def apply_task_fields(task, data):
    """Validate and copy editable fields from request data. Returns an error string or None."""
    if "title" in data:
        title = str(data["title"] or "").strip()
        if not title:
            return "Title cannot be empty"
        task.title = title[:500]
    if "description" in data:
        task.description = str(data["description"] or "").strip()[:5000]
    if "priority" in data:
        if data["priority"] not in ALLOWED_PRIORITIES:
            return "Invalid priority"
        task.priority = data["priority"]
    if "due_date" in data:
        raw = data["due_date"]
        if raw in (None, ""):
            task.due_date = None
        else:
            try:
                task.due_date = date.fromisoformat(str(raw))
            except ValueError:
                return "Invalid due date"
    if "status" in data:
        if data["status"] not in ALLOWED_STATUSES:
            return "Invalid status"
        if data["status"] == "done" and task.status != "done":
            task.completed_at = datetime.now(timezone.utc)
        elif data["status"] != "done":
            task.completed_at = None
        task.status = data["status"]
    return None


@app.route("/api/tasks", methods=["GET"])
def list_tasks():
    user, err = require_login()
    if err:
        return err
    tasks = (
        Task.query.filter_by(user_id=user.id).order_by(Task.created_at.asc()).all()
    )
    return jsonify([t.to_dict() for t in tasks])


@app.route("/api/tasks", methods=["POST"])
def create_task():
    user, err = require_login()
    if err:
        return err
    data = request.get_json(silent=True) or {}
    if not str(data.get("title", "")).strip():
        return jsonify({"error": "Title is required"}), 400

    task = Task(user_id=user.id, title="", status="todo", priority="medium")
    error = apply_task_fields(task, data)
    if error:
        return jsonify({"error": error}), 400
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@app.route("/api/tasks/completed", methods=["DELETE"])
def clear_completed():
    user, err = require_login()
    if err:
        return err
    count = Task.query.filter_by(user_id=user.id, status="done").delete()
    db.session.commit()
    return jsonify({"deleted": count})


@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    user, err = require_login()
    if err:
        return err
    task = Task.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404

    error = apply_task_fields(task, request.get_json(silent=True) or {})
    if error:
        db.session.rollback()
        return jsonify({"error": error}), 400
    db.session.commit()
    return jsonify(task.to_dict())


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    user, err = require_login()
    if err:
        return err
    task = Task.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"ok": True})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    static_dir = app.static_folder
    if path and os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    return send_from_directory(static_dir, "index.html")


if __name__ == "__main__":
    app.run(debug=True, port=5001)
