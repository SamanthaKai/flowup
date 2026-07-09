import os
import time

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, session
from sqlalchemy.exc import OperationalError
from werkzeug.security import check_password_hash, generate_password_hash

from models import Task, User, db

load_dotenv()

ALLOWED_STATUSES = {"todo", "in_progress", "done"}

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
    "DATABASE_URL", "sqlite:///flowboard.db"
)
app.secret_key = os.environ.get("SECRET_KEY", "dev-only-not-secure")

db.init_app(app)
with app.app_context():
    for attempt in range(5):
        try:
            db.create_all()
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
    title = str(data.get("title", "")).strip()
    if not title:
        return jsonify({"error": "Title is required"}), 400

    task = Task(user_id=user.id, title=title[:500], status="todo")
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@app.route("/api/tasks/<int:task_id>", methods=["PATCH"])
def update_task(task_id):
    user, err = require_login()
    if err:
        return err
    task = Task.query.filter_by(id=task_id, user_id=user.id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json(silent=True) or {}
    if "title" in data:
        title = str(data["title"]).strip()
        if not title:
            return jsonify({"error": "Title cannot be empty"}), 400
        task.title = title[:500]
    if "status" in data:
        if data["status"] not in ALLOWED_STATUSES:
            return jsonify({"error": "Invalid status"}), 400
        task.status = data["status"]

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
