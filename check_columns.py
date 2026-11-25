import psycopg2
conn = psycopg2.connect('host=localhost dbname=PharmaERP user=postgres password=346134')
cur = conn.cursor()
cur.execute('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'Payments\';')
rows = cur.fetchall()
for r in rows:
    print(r)