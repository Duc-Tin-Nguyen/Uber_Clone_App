import sqlite3

from flask_login import LoginManager
from app.models import User 

login_manager = LoginManager()
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(user_id):
    with sqlite3.connect("database.db") as con:
        con.row_factory = sqlite3.Row
        cur = con.cursor()
        cur.execute("SELECT * FROM users WHERE id=?", (user_id,))
        user_data = cur.fetchone()

    if user_data:
        user = User(user_data['id'], user_data['username'], user_data['password'], user_data['role'], user_data['email'])
        return user
    else:
        return None
