import psycopg2
conn = psycopg2.connect('host=localhost dbname=PharmaERP user=postgres password=346134')
cur = conn.cursor()
cur.execute('SELECT "Id", "Name" FROM "AbpRoles";')
rows = cur.fetchall()
for r in rows:
    print(r)
cur.execute('SELECT "UserId", "RoleId" FROM "AbpUserRoles";')
rows = cur.fetchall()
for r in rows:
    print("UserRole:", r)
cur.execute('SELECT "ClaimType", "ClaimValue" FROM "AbpRoleClaims" WHERE "RoleId" = (SELECT "Id" FROM "AbpRoles" WHERE "Name" = \'Admin\');')
rows = cur.fetchall()
for r in rows:
    print("Admin role claims:", r)