import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime

from helpers import login_required, lookup

# Configure application
app = Flask(__name__)


# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///score.db")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])
    return render_template("./u_index.html", username=username[0])


@app.route("/login", methods=["GET", "POST"])
def login():

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return render_template("error.html", error="must provide username")

        # Ensure password was submitted
        elif not request.form.get("password"):
            return render_template("error.html", error="must provide password")

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            return render_template("error.html", error="invalid username and/or password")

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("./u_login.html")


@app.route("/logout")
def logout():

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        # Checking the input.
        if not request.form.get("username"):
            return render_template("error.html", error="must provide username")

        elif not request.form.get("password"):
            return render_template("error.html", error="must provide password")

        elif not request.form.get("confirmation"):
            return render_template("error.html", error="please type in your password again")

        elif request.form.get("password") != request.form.get("confirmation"):
            return render_template("error.html", error="your passwords do not match; please try again")

        # Getting the information about the user to check whether the user exists.
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        if len(rows) >= 1:
            return render_template("error.html", error="username already exists")

        # Hashing the password and storing that into the database.
        hashed_password = generate_password_hash(request.form.get("password"))

        db.execute(
            "INSERT INTO users (username, hash, high_score, high_accuracy) VALUES (?, ?, ?, ?)",
            request.form.get("username"),
            hashed_password,
            0,
            0
        )

        return redirect("/")

    else:
        return render_template("u_register.html")

@app.route('/intropage')
def intro_page():
    return render_template("intropage.html")

@app.route('/endpage', methods=["GET", "POST"])
def end_page():
    if request.method == "POST":
        data = request.get_json()  # Get JSON data from the request body

        shots = data.get('shots')
        score = data.get('score')
        accuracy = data.get('accuracy')
        time = datetime.now()
        formatted_time = time.strftime("%Y-%m-%d %H:%M:%S")

        # Update the database with the fetched variables.
        db.execute("INSERT INTO history (user_id, shots, score, accuracy, time) VALUES (?, ?, ?, ?, ?)",
                session["user_id"],
                shots,
                score,
                accuracy,
                formatted_time)
        past = db.execute("SELECT high_score, high_accuracy FROM users WHERE id = ?",
                          session["user_id"])

        db.execute("UPDATE users SET high_score = ?, high_accuracy = ? WHERE id = ?",
                   max(past[0]["high_score"],score),
                   max(past[0]["high_accuracy"],accuracy),
                   session["user_id"])

        return render_template("endpage.html", shots=shots, score=score, accuracy=accuracy, time=formatted_time)
    else:
        return render_template("endpage.html")


@app.route('/game')
def game():
    return render_template("index.html")

@app.route('/homepage')
def home_page():
    return render_template("homepage.html")

@app.route("/profile")
@login_required
def profile():
    """Show history of transactions"""

    # Getting information about the user.
    username = db.execute("SELECT username FROM users WHERE id = ?", session["user_id"])
    his = db.execute(
        "SELECT * FROM history WHERE user_id = ?", session["user_id"]
    )
    # Get the records and histories podcast that to profile.
    records = db.execute("SELECT high_score, high_accuracy FROM users WHERE id = ?", session["user_id"])
    if not his:
        his = [
            {
                "shots": "N/A",
                "score": "N/A",
                "accuracy": "N/A",
                "time": "N/A",
            }
        ]
        return render_template("profile.html", his=his, username=username[0], records=records)
    else:
        return render_template("profile.html", his=his, username=username[0], records=records)

@app.route("/leaderboard")
def leaderboard():
    users = db.execute("SELECT id FROM users")

    # Go through every user and write the information into the dictionary.
    user_list = []

    # Go through every user and write the information into the list of dictionaries
    for user in users:
        user_info = {}
        user_info["id"] = user["id"]
        user_info["username"] = db.execute(
            "SELECT username FROM users WHERE id = ?", user["id"]
        )[0]["username"]
        user_info["high_score"] = db.execute("SELECT high_score FROM users WHERE id = ?", user["id"])[0]["high_score"]
        user_info["high_accuracy"] = db.execute("SELECT high_accuracy FROM users WHERE id = ?", user["id"])[0]["high_accuracy"]
        user_list.append(user_info)

    # Sort users based on high_score (if tie, sort based on high_accuracy)
    a_sorted_users = sorted(user_list, key=lambda x: (x["high_score"], x["high_accuracy"]), reverse=True)

    # Sort users based on high_accuracy (if tie, sort based on high_score)
    b_sorted_users = sorted(user_list, key=lambda x: (x["high_accuracy"], x["high_score"]), reverse=True)

    return render_template("leaderboard.html", ausers=a_sorted_users, busers=b_sorted_users)

