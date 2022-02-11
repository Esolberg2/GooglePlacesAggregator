import sqlite3

def query(sql, args):
    conn = sqlite3.connect('searches.db')
    curs = conn.cursor()
    try:
        with conn:
            curs.execute(sql, args)
            return {"returned": curs.fetchall(), "lastRowID": curs.lastrowid}
    except sqlite3.IntegrityError:
        print("couldn't add Python twice")
        return {"returned": [], "lastRowID": 0}


# print(query("INSERT INTO sessions (user) VALUES(?)", ["aaaad"]))
# print(query("DELETE FROM sessions where sessionID =?", [5]))
# print(query("""DELETE FROM sessions where sessionID = 4"""))


# results = query("select * from sessions", [])
# print(results)
# for r in results["returned"]:
#     print(r)


#
#
# conn = sqlite3.connect('searches.db')
# c = conn.cursor()
# # c.execute("""DROP TABLE sessions""")

# """CREATE TRIGGER [IF NOT EXISTS] createGrid
#    AFTER INSERT
#    ON session
# BEGIN
#
# END;"""


# cur.execute("CREATE TRIGGER createGrid AFTER INSERT ON session BEGIN SELECT hello(NEW.x); END;")



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
