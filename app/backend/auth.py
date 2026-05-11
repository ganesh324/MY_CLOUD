import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer

# USE A FIXED STRING - DO NOT USE os.urandom() for development reloads
SECRET_KEY = "GANESH_CLOUD_PRIVATE_KEY_99" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440 # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user_from_token(db, token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        print(f"DEBUG: Token decoded for user: {username}") # Check your terminal for this
        
        if username is None:
            return None
            
        from . import models
        user = db.query(models.User).filter(models.User.username == username).first()
        
        if user is None:
            print(f"DEBUG: User '{username}' not found in the database!") # Check your terminal
            
        return user
    except JWTError as e:
        print(f"DEBUG: JWT Decode Error: {str(e)}")
        return None