import psycopg

inf = "host=localhost port=5432 dbname=tennis user=tennis password=tennis"
with psycopg.connect(inf) as conn:
    with conn.cursor() as curr:
        curr.execute("SELECT version()")
        print(curr.fetchone())