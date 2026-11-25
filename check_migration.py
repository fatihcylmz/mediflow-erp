import psycopg2
conn = psycopg2.connect('host=localhost dbname=PharmaERP user=postgres password=346134')
cur = conn.cursor()
cur.execute('SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY "MigrationId";')
rows = cur.fetchall()
for r in rows:
    print(r[0])