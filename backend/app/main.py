from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi import status
from pydantic import BaseModel
from .db import get_connection
from datetime import datetime, timedelta, timezone
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# SQL statements to create tables
tables = {
    "users": """
        CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status INTEGER DEFAULT 1);""",
    "couriers": """
        CREATE TABLE IF NOT EXISTS couriers (courier_id SERIAL PRIMARY KEY,
        courier_name VARCHAR(100) NOT NULL,
        main_vehicle VARCHAR(50) NOT NULL,
        secondary_vehicle VARCHAR(50) DEFAULT NULL);""",
    "products": """
        CREATE TABLE IF NOT EXISTS products (product_id SERIAL PRIMARY KEY,
        product_name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INTEGER NOT NULL,
        rating DECIMAL(2, 1) DEFAULT NULL,
        thumbnail VARCHAR(255) DEFAULT NULL,
        photos_urls TEXT DEFAULT NULL);""",
    "orders": """
        CREATE TABLE IF NOT EXISTS orders (order_id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        courier_id INTEGER REFERENCES couriers(courier_id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP);"""
}

# Initialize database tables
for table in tables.values():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(table)
    conn.commit()
    cursor.close()
    conn.close()

# Register admin account if not exists
alogin = os.getenv('ADMIN_LOGIN')
apassword = os.getenv('ADMIN_PASSWORD')
conn = get_connection()
cursor = conn.cursor()
cursor.execute("SELECT login FROM users WHERE login = %s", (alogin,))
if not cursor.fetchone():
    hashed_password = pwd_context.hash(apassword)
    cursor.execute("INSERT INTO users (login, password, name) VALUES (%s, %s, %s)",
                    (alogin, hashed_password, 'Administrator'))
    conn.commit()
cursor.close()
conn.close()

# Pydantic models
class UserCreate(BaseModel):
    login: str
    password: str
    name: str

class UserLogin(BaseModel):
    login: str
    password: str

class OrderCreate(BaseModel):
    product_id: int
    user_id: int
    courier_id: int
    quantity: int

class ProductCreate(BaseModel):
    product_name: str
    price: float
    stock_quantity: int
    rating: float = None
    thumbnail: str = None
    photos_urls: str = None
    token: str

class ProductDelete(BaseModel):
    product_id: int
    token: str

class Token(BaseModel):
    token: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def validate_password(password: str) -> {str, bool}:
    if len(password) < 8:
        return {"msg": "!Password must be at least 8 characters long", "v": False}
    if not any(c.isupper() for c in password):
        return {"msg": "!Password must contain at least one uppercase letter", "v": False}
    if not any(c.islower() for c in password):
        return {"msg": "!Password must contain at least one lowercase letter", "v": False}
    if not any(c.isdigit() for c in password):
        return {"msg": "!Password must contain at least one digit", "v": False}
    if not any(not c.isalnum() for c in password):
        return {"msg": "!Password must contain at least one special character", "v": False}
    return {"msg": "Password is valid", "v": True}

# API Endpoints
@app.get('/')
def root():
    return JSONResponse(content={"message": "Hi"}, status_code=status.HTTP_200_OK)

# User endpoints
@app.post('/register', status_code=status.HTTP_201_CREATED)
def register(user: UserCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT login FROM users WHERE login = %s OR name = %s", (user.login, user.name))
        if cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login or name already in use")
        password_validation = validate_password(user.password)
        if not password_validation["v"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=password_validation["msg"])
        hashed_password = pwd_context.hash(user.password)
        cursor.execute("INSERT INTO users (login, password, name) VALUES (%s, %s, %s)",
                        (user.login, hashed_password, user.name))
        conn.commit()
        return JSONResponse(content={"message": "User registered successfully", "success": True})
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/login', status_code=status.HTTP_200_OK)
def login(user: UserLogin):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT password, user_id FROM users WHERE login = %s", (user.login,))
        result = cursor.fetchone()
        if not result or not pwd_context.verify(user.password, result[0]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        access_token = create_access_token(data={"sub": {"login": user.login, "user_id": result[1]}})
        return JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    finally:
        cursor.close()
        conn.close()

@app.delete('/delete-account', status_code=status.HTTP_200_OK)
def delete_account(user: UserLogin):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT password FROM users WHERE login = %s", (user.login,))
        result = cursor.fetchone()
        if not result or not pwd_context.verify(user.password, result[0]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        cursor.execute("DELETE FROM users WHERE login = %s", (user.login,))
        conn.commit()
        return JSONResponse(content={"message": "Account deleted successfully"})
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# Admin endpoints
@app.post('/admin/users', status_code=status.HTTP_200_OK)
def get_users_admin_token(token: Token, page: int = 1, per_page: int = 10):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM users")
        total = cursor.fetchone()[0]
        
        offset = (page - 1) * per_page
        cursor.execute("SELECT user_id, login, name, status, password FROM users LIMIT %s OFFSET %s", (per_page, offset))
        users = cursor.fetchall()
        users_list = [{"user_id": u[0], "login": u[1], "name": u[2], "status": u[3], "password": u[4]} for u in users]
        return JSONResponse(content={"users": users_list, "total": total, "page": page, "per_page": per_page}, status_code=status.HTTP_200_OK)
    finally:
        cursor.close()
        conn.close()

@app.delete('/admin/delete-account', status_code=status.HTTP_200_OK)
def delete_account(user_id: int, token: Token):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        if cursor.fetchone():
            return JSONResponse(content={"message": "Account deleted successfully"})
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@app.post('/admin/ban', status_code=status.HTTP_200_OK)
def ban_user(token: Token, user_id: int):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        cursor.execute("UPDATE users SET status = 0 WHERE user_id = %s", (user_id,))
        conn.commit()
        return JSONResponse(content={"message": "User banned successfully", "user_id": user_id}, status_code=status.HTTP_200_OK)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/unban', status_code=status.HTTP_200_OK)
def unban_user(token: Token, user_id: int):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        cursor.execute("UPDATE users SET status = 1 WHERE user_id = %s", (user_id,))
        conn.commit()
        return JSONResponse(content={"message": "User unbanned successfully", "user_id": user_id}, status_code=status.HTTP_200_OK)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/orders', status_code=status.HTTP_200_OK)
def get_order_admin(token: Token, page: int = 1, per_page: int = 10):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM orders")
        total = cursor.fetchone()[0]
        
        offset = (page - 1) * per_page
        cursor.execute("SELECT order_id, product_id, user_id, courier_id, quantity, status, order_date FROM orders LIMIT %s OFFSET %s", (per_page, offset))
        orders = cursor.fetchall()
        orders_list = [{"order_id": o[0], "product_id": o[1], "user_id": o[2], "courier_id": o[3],
                        "quantity": o[4], "status": o[5], "order_date": o[6]} for o in orders]
        return JSONResponse(content={"orders": orders_list, "total": total, "page": page, "per_page": per_page}, status_code=status.HTTP_200_OK)
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/couriers', status_code=status.HTTP_200_OK)
def get_couriers_admin(token: Token, page: int = 1, per_page: int = 10):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM couriers")
        total = cursor.fetchone()[0]
        
        offset = (page - 1) * per_page
        cursor.execute("SELECT courier_id, courier_name, main_vehicle, secondary_vehicle FROM couriers LIMIT %s OFFSET %s", (per_page, offset))
        couriers = cursor.fetchall()
        couriers_list = [{"courier_id": c[0], "courier_name": c[1], "main_vehicle": c[2],
                        "secondary_vehicle": c[3]} for c in couriers]
        return JSONResponse(content={"couriers": couriers_list, "total": total, "page": page, "per_page": per_page}, status_code=status.HTTP_200_OK)
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/products', status_code=status.HTTP_200_OK)
def get_products_admin(token: Token, page: int = 1, per_page: int = 10):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM products")
        total = cursor.fetchone()[0]
        
        offset = (page - 1) * per_page
        cursor.execute("SELECT product_id, product_name, price, stock_quantity, rating, thumbnail, photos_urls FROM products LIMIT %s OFFSET %s",
                       (per_page, offset))
        products = cursor.fetchall()
        products_list = [{"product_id": p[0], "product_name": p[1], "price": float(p[2]),
                        "stock_quantity": p[3], "rating": p[4], "thumbnail": p[5], "photos_urls": p[6]} for p in products]
        return JSONResponse(content={"products": products_list, "total": total, "page": page, "per_page": per_page}, status_code=status.HTTP_200_OK)
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/products/add', status_code=status.HTTP_201_CREATED)
def add_product(product: ProductCreate):
    try:
        payload = jwt.decode(product.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT product_id FROM products WHERE product_name = %s", (product.product_name,))
    if cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product name already exists")
    cursor.close()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO products (product_name, price, stock_quantity, rating, thumbnail, photos_urls) VALUES (%s, %s, %s, %s, %s, %s)",
                        (product.product_name, product.price, product.stock_quantity, product.rating, product.thumbnail, product.photos_urls))
        conn.commit()
        return JSONResponse(content={"message": "Product added successfully", "product_id": cursor.lastrowid})
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.delete('/admin/products/delete', status_code=status.HTTP_200_OK)
def delete_product(product: ProductDelete):
    try:
        payload = jwt.decode(product.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    conn = get_connection()
    cursor = conn.cursor()
    result = cursor.execute("SELECT product_id FROM products WHERE product_id = %s", (product.product_id,))
    if not result.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM products WHERE product_id = %s", (product.product_id,))
        conn.commit()
        return JSONResponse(content={"message": "Product deleted successfully", "product_id": product.product_id})
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()
