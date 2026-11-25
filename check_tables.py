import psycopg2
conn = psycopg2.connect('host=localhost dbname=PharmaERP user=postgres password=346134')
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%Payment%';")
rows = cur.fetchall()
for r in rows:
    print(r)