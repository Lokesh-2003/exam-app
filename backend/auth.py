from flask import jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import User
from database import db
jwt = JWTManager()
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id
@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.get(identity)
def init_auth(app):
    jwt.init_app(app)
