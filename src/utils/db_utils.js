// EXTERNAL LIBRARY //
const sqlite3 = require('sqlite3').verbose(); // verbose 사용 이유 없음
const path = require('path'); 

// LOCAL VARAIBLE //
const dbFile = (path.join(__dirname, path.sep+'test.db').replace(path.sep+'app.asar', '').replace('\\src\\utils\\','/')).replace('\\','/');
console.log(dbFile)



function db_create() {
    let db = new sqlite3.Database('./test.db')
    // \(백슬래시) 추가 줄바꿈 ERROR 발생하는지 확인필요.
    db.run("create TABLE process \
    (id integer primary key AUTOINCREMENT , name VARCHAR(255), start_time time, end_time time, count INTEGER, date date)")
}

function db_conn() {
    let db = new sqlite3.Database(`${dbFile}`, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            //console.error(err.message);
        } else {
            //console.log('Connected to the mydb database.');
        }
    });
    return db
}

function db_disconn(db) {
    db.close((err) => {
        if (err) {
          return console.error(err.message);
        }
        //console.log('Close the database connection.');
      });
    
}

async function db_comm(db,type,query=''){
    if (type == 'INSERT'){
        db.serialize(()=> {
            db.run(query)
        })
    }
    if (type == 'SELECT'){
        return new Promise(function(resolve,reject){
            db.all(query, function(err,rows){
                if(err){return reject(err);}
                resolve(rows);
              });
        })
    }
}

//db_create()

exports.db_conn = db_conn;
exports.db_disconn = db_disconn;
exports.db_comm = db_comm;





