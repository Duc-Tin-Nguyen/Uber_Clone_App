import sqlite3
from pymongo import MongoClient

import os

def setup_sqlite():
    with sqlite3.connect(os.getenv("SQLITE_DB_NAME")) as con:
        con.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT, role TEXT)")

def setup_mongo():
    url = os.getenv("MONGO_DB_URL")
    client = MongoClient(url, tls=True, tlsAllowInvalidCertificates=True)
    db = client[os.getenv("MONGO_DB_NAME")]
    chat_collection = db["chat_history"]
    return db, chat_collection
