from flask import Flask
from config import Config
from .database import setup_sqlite

app = Flask(__name__)
app.config.from_object(Config)

setup_sqlite() 

from app import models, routes
