import psycopg2
conn = psycopg2.connect('host=localhost dbname=PharmaERP user=postgres password=346134')
cur = conn.cursor()
cur.execute('SELECT "Id", "UserName" FROM "AbpUsers";')
rows = cur.fetchall()
for r in rows:
    print(r)
cur.execute('SELECT "UserId" FROM "AbpUserRoles" WHERE "RoleId" = \'3a2408e3-f584-5d58-6c99-f60d35dffbd2\';')
rows = cur.fetchall()
for r in rows:
    print("Admin role user:", r)