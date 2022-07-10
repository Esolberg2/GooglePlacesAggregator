import sqlite3

def query(sql, args=[]):
    conn = sqlite3.connect('searches.sqlite')
        # conn = sqlite3.connect('../dbVol/searches.sqlite')

    curs = conn.cursor()
    try:
        with conn:
            curs.execute(sql, args)
            return {"returned": curs.fetchall(), "lastRowID": curs.lastrowid}
    except sqlite3.IntegrityError:
        print("couldn't add Python twice")
        return {"returned": [], "lastRowID": -1}


q = '''CREATE TABLE IF NOT EXISTS searchIDs (
id integer PRIMARY KEY
)'''
# #
q2 = '''select * from searchIDs'''
# #
q3 = '''insert into searchIDs values(NULL)'''
# #
# # q4 = '''drop table searchIDs '''
# #
# q5 = '''insert into searchIDs values(?)'''
#
query(q,[])
# query(q3)
# print(query(q2))
