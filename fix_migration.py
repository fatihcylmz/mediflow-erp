import psycopg2
conn = psycopg2.connect('host=localhost dbname=PharmaERP user=postgres password=346134')
cur = conn.cursor()
cur.execute('DELETE FROM "__EFMigrationsHistory" WHERE "MigrationId" = \'20261125164617_AddFeeAmountToPaymentTransaction\';')
conn.commit()
print('SUCCESS')