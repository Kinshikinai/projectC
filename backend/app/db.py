import psycopg2

def get_connection():
    return psycopg2.connect(
        host="db",
        database="projectC",
        user="yerah",
        password="asdiopzxc",
        port=5432
    )
