import psycopg2
conn = psycopg2.connect('host=localhost dbname=PharmaERP user=postgres password=346134')
cur = conn.cursor()
cur.execute('SELECT "ClaimType", "ClaimValue" FROM "AbpRoleClaims" WHERE "RoleId" = \'3a2408e3-f584-5d58-6c99-f60d35dffbd2\';')
rows = cur.fetchall()
for r in rows:
    print("Admin role claims:", r)
cur.execute('SELECT "ClaimType", "ClaimValue" FROM "AbpRoleClaims";')
rows = cur.fetchall()
for r in rows:
    print("All role claims:", r)