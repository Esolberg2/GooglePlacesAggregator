import sqlite3
import contextlib

def query(sql, args):
    with contextlib.closing(sqlite3.connect('searches.db')) as conn:
        conn = sqlite3.connect('searches.db')
        curs = conn.cursor()
        try:
            curs.execute(sql, args)
            conn.commit()
        except:
            print("failed")
            curs.rollback()

        close = {"returned": curs.fetchall(), "lastRowID": curs.lastrowid}
        conn.close()
        return close

# conn = sqlite3.connect('searches.db')
#
# cur = conn.cursor()
#     cur.execute("SELECT * FROM tasks")
#
#     rows = cur.fetchall()
#
#     for row in rows:
#         print(row)

# print(query("INSERT INTO sessions (user) VALUES(?)", ["aaaaf"]))
# print(query("DELETE FROM sessions where sessionID =?", [5]))
# print(query("""DELETE FROM sessions where sessionID = 4"""))
#
results = query("select * from sessions", [])
for r in results["returned"]:
    print(r)

# conn = sqlite3.connect('searches.db')
# c = conn.cursor()
# c.execute("""DROP TABLE sessions""")
#
# c.execute("""CREATE TABLE sessions (
#     sessionID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
#     salt INTEGER NOT NULL  DEFAULT (abs(random()) % (10000 - 1000) + 1000),
#     user TEXT NOT NULL,
#     dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
#     regions json
# )""")
#
# c.execute("""CREATE TABLE searches (
#     sessionID INTEGER NOT NULL,
#     salt INTEGER NOT NULL,
#     user TEXT NOT NULL,
#     searchCoordinate json,
#     resultCoordinates json,
#     FOREIGN KEY(sessionID) REFERENCES sessions(sessionID),
#     FOREIGN KEY(salt) REFERENCES sessions(salt),
#     FOREIGN KEY(user) REFERENCES sessions(user)
# )""")
#
# c.execute("""CREATE TABLE archive (
#     sessionID INTEGER NOT NULL,
#     searchCoordinate json,
#     category TEXT,
#     result json,
#     radius REAL
# )""")
#
# c.execute("""CREATE TABLE sessionProgress (
#     sessionID INTEGER NOT NULL,
#     salt INTEGER NOT NULL,
#     user TEXT NOT NULL,
#     unsearchedCoordinates json,
#     searchedCoordinates json,
#     FOREIGN KEY(sessionID) REFERENCES sessions(sessionID),
#     FOREIGN KEY(salt) REFERENCES sessions(salt),
#     FOREIGN KEY(user) REFERENCES sessions(user)
# )""")
#
# conn.commit()
# conn.close()
