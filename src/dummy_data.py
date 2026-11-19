import psycopg

inf = "host=localhost port=5432 dbname=tennis user=tennis password=tennis"
with psycopg.connect(inf) as conn:
    with conn.cursor() as curr:
        curr.execute("""
        INSERT INTO players (student_id, name, class_year, password, is_manager) 
        VALUES (%s, %s, %s, %s, %s)
        """, ("017966338", "jeffery", 3, "password", False))

        curr.execute("SELECT * FROM players")
        print(curr.fetchone())


        conn.commit()