import psycopg2

def get_connection():
    return psycopg2.connect(
        host="localhost",
        database="projectC",
        user="yerah",
        password="asdiopzxc",
        port=5432
    )