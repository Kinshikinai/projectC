from fastapi import FastAPI, HTTPException, Request
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
from psycopg2 import sql

app = FastAPI()

@app.middleware("http")
async def add_request_time(request: Request, call_next):
    start_time = datetime.utcnow()
    response = await call_next(request)
    print(f"[{start_time.isoformat()}] {request.method} {request.url.path}")
    return response

origins = [
    "http://localhost:3000"
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
    status INTEGER DEFAULT 1,
    role VARCHAR(5) DEFAULT 'user',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    address TEXT DEFAULT NULL);""",
    "categories": """
        CREATE TABLE IF NOT EXISTS categories (category_id SERIAL PRIMARY KEY,
        category_name VARCHAR(100));""",
    "products": """
        CREATE TABLE IF NOT EXISTS products (product_id SERIAL PRIMARY KEY,
        product_name TEXT NOT NULL,
        product_description TEXT DEFAULT 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. 
        Eos voluptatibus consequuntur, iste ea culpa distinctio officia atque veritatis maiores doloremque ab officiis repellat, 
        rerum quia eaque placeat? Aliquam, voluptate numquam!',
        category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
        sold INTEGER DEFAULT 0,
        price DECIMAL(10, 2) NOT NULL,
        rating DECIMAL(2, 1) DEFAULT NULL,
        thumbnail TEXT DEFAULT NULL);""",
    "orders": """
        CREATE TABLE IF NOT EXISTS orders (order_id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
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
    cursor.execute("INSERT INTO users (login, password, name, role) VALUES (%s, %s, %s, %s)",
                    (alogin, hashed_password, 'Administrator', 'admin'))
    conn.commit()
cursor.close()
conn.close()

# Restoring backup
# with open("./app/projectCdb", "r", encoding="utf-8") as f:
#     sql = f.read()

# cursor.execute(sql)
# conn.commit()
# cursor.close()
# conn.close()

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
    product_description: str
    price: float
    rating: float = 0.0
    thumbnail: str = ""
    token: str

class OrderItem(BaseModel):
    product_id: int
    token: str

class ResetPassword(BaseModel):
    current_password: str
    new_password: str
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
async def root():
    return JSONResponse(content={"message": "Hi"}, status_code=status.HTTP_200_OK)

# User endpoints
@app.post('/register', status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
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
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/login', status_code=status.HTTP_200_OK)
async def login(user: UserLogin):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT password, user_id, role, name, registered_at FROM users WHERE login = %s", (user.login,))
        result = cursor.fetchone()
        if not result or not pwd_context.verify(user.password, result[0]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        access_token = create_access_token(data={"login": user.login, "id": result[1], "role": result[2], 'name': result[3], 'registered_at': result[4].strftime("%Y-%m-%d %H:%M:%S")})
        return JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    finally:
        cursor.close()
        conn.close()

@app.delete('/delete-account', status_code=status.HTTP_200_OK)
async def delete_account(user: UserLogin):
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
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/user', status_code=status.HTTP_200_OK)
async def get_user(token: Token):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        return JSONResponse(content={'login': payload['login'], 'id': payload['id'], 'role': payload['role'], 'name': payload['name'], 'registered_at': payload['registered_at']}, status_code=status.HTTP_200_OK)
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

@app.get('/products', status_code=status.HTTP_200_OK)
async def get_products():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM products")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT product_id, product_name, price, rating, thumbnail, product_description, sold FROM products")
        products = cursor.fetchall()
        products_list = [{"product_id": p[0], "product_name": p[1], "price": float(p[2]),
                        "rating": float(p[3]), "thumbnail": p[4], "product_description": p[5], "sold": p[6]} for p in products]
        return JSONResponse(content={"products": products_list, "total": total}, status_code=status.HTTP_200_OK)
    finally:
        cursor.close()
        conn.close()

@app.get('/categories', status_code=status.HTTP_200_OK)
async def get_categories():
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM categories")
        categories = cursor.fetchall()
        categories_list = [{"category_id": c[0], "category_name": c[1]} for c in categories]
        conn.commit()
        return JSONResponse(content=categories_list, status_code=status.HTTP_200_OK)
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get('/productsofcategory', status_code=status.HTTP_200_OK)
async def get_products_of_category(category_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT product_id, product_name, price, rating, thumbnail, product_description, sold FROM products WHERE category_id = %s", [category_id,])
        productsofcategory = cursor.fetchall()
        prodcuts_list = [{"product_id": p[0], "product_name": p[1], "price": float(p[2]),
                         "rating": float(p[3]), "thumbnail": p[4], "product_description": p[5], "sold": p[6]} for p in productsofcategory]
        conn.commit()
        return JSONResponse(content=prodcuts_list, status_code=status.HTTP_200_OK)
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/resetpw', status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPassword):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT password FROM users WHERE login = %s", [login])
        result = cursor.fetchone()
        if not result or not pwd_context.verify(request.current_password, result[0]):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        else:
            validatation = validate_password(request.new_password)
            if not validatation['v']:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=validatation['msg'])
            newpassword = pwd_context.hash(request.new_password)
            cursor.execute("UPDATE users SET password = %s WHERE login = %s", [newpassword, login])
            conn.commit()
            return JSONResponse(content={"message": "Password updated successfully"})
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/orderitem', status_code=status.HTTP_200_OK)
async def order_item(orderitem: OrderItem):
    try:
        payload = jwt.decode(orderitem.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE products SET sold = 1 WHERE product_id = %s", (orderitem.product_id,))
        conn.commit()
        cursor.execute("INSERT INTO orders (product_id, user_id) VALUES (%s, %s)", (orderitem.product_id, payload['id'],))
        conn.commit()
        return JSONResponse(content={'message': 'Product ordered successfully'}, status_code=status.HTTP_200_OK)
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/ordersofuser', status_code=status.HTTP_200_OK)
async def orders_of_user(token: Token):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT product_id, order_date FROM orders WHERE user_id = %s", (payload['id'],))
        result = cursor.fetchall()
        pids = []
        for o in result:
            pids.append(o[0])
        query = sql.SQL(
            "SELECT product_id, product_name, price, rating, thumbnail, product_description, sold "
            "FROM products WHERE product_id IN ({})"
        ).format(sql.SQL(',').join(sql.Placeholder() * len(pids)))

        cursor.execute(query, pids)
        products = cursor.fetchall()
        for i in result:
            orders_list = [{"product_id": p[0], "product_name": p[1], "price": float(p[2]),
                        "rating": float(p[3]), "thumbnail": p[4], "product_description": p[5], "sold": p[6], "order_date": i[1].isoformat()} for p in products]
        return JSONResponse(content=orders_list, status_code=status.HTTP_200_OK)
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

# Admin endpoints
@app.post('/admin/users', status_code=status.HTTP_200_OK)
async def get_users_admin_token(token: Token, page: int = 1, per_page: int = 10):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
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
async def delete_account(user_id: int, token: Token):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
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
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/ban', status_code=status.HTTP_200_OK)
async def ban_user(token: Token, user_id: int):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
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
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/unban', status_code=status.HTTP_200_OK)
async def unban_user(token: Token, user_id: int):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
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
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/orders', status_code=status.HTTP_200_OK)
async def get_order_admin(token: Token, page: int = 1, per_page: int = 10):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
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
async def get_couriers_admin(token: Token, page: int = 1, per_page: int = 10):
    try:
        payload = jwt.decode(token.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
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

@app.post('/admin/products/add', status_code=status.HTTP_201_CREATED)
async def add_product(product: ProductCreate):
    try:
        payload = jwt.decode(product.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
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
        cursor.execute("INSERT INTO products (product_name, price, rating, thumbnail, product_description) VALUES (%s, %s, %s, %s, %s)",
                        (product.product_name, product.price, product.rating, product.thumbnail, product.product_description))
        conn.commit()
        return JSONResponse(content={"message": "Product added successfully", "product_id": cursor.lastrowid})
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.post('/admin/products/delete', status_code=status.HTTP_200_OK)
async def delete_product(product: ProductDelete):
    try:
        payload = jwt.decode(product.token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload['login']
        alogin = os.getenv('ADMIN_LOGIN')
        if login != alogin:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
    except jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT product_id FROM products WHERE product_id = %s", (product.product_id,))
    if not cursor.fetchone():
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
        print(e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        cursor.close()
        conn.close()