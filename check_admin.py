import psycopg2
conn = psycopg2.connect('host=localhost dbname=PharmaERP user=postgres password=346134')
cur = conn.cursor()
cur.execute('SELECT "UserName", "PasswordHash", "SecurityStamp" FROM "AbpUsers" WHERE "UserName" = \'admin_mehmet\';')
rows = cur.fetchall()
for r in rows:
    print(r)