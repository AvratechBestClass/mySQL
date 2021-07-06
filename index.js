const mysql = require('mysql');
console.log(mysql);
var express = require('express');
var app = express();
app.use(express.json());

app.post('/createIntern', function(req, res) {
    var intern = req.body;
    var queryText = `INSERT INTO interns (${Object.keys(intern)}) VALUES ('${intern.name}', '${intern.phone}', ${intern.supervisor_id})`;
    console.log(queryText);
    con.query(queryText, function(err, result){
        console.log(err, result);
        if(err) {
            return res.status(500).send(err);
        }
        res.status(200).send(result);
    })
});
app.post('/intern', function(req, res) {
    const internId = req.body.id;
    con.query('SELECT name, phone FROM interns WHERE id = ' + internId, function(err, result) {
        if(err) {
            return res.status(500).send(err);
        }
        res.status(200).send(result);
    })
})

app.post('/interns', function(req, res) {
    const query = `INSERT INTO interns (name, phone, supervisor_id) VALUES
     ('Izik', '0548197615',1),
     ('Avi', '054444444',1),
     ('Anat', '052767676', 1),
     ('Chaim', '05345454', 1);
     `;
     con.query(query, function(err, result) {
         if(err) return error(res, err);
         res.status(200).send(result);
     });

})
function error(res, err) {
    res.status(500).send(err)
}

app.post('/createGroup', function(req, res) {
    const body = req.body 

    con.beginTransaction(function(err, result1) {
        con.query(`INSERT INTO groups_table (name, creator_id) VALUES(
            '${body.group.name}', ${body.group.creator_id})`, function(err, result) {

                if(err) {
                    con.rollback();
                    return res.status(500).send(err);
                }
                // create members for group
                con.query(`INSERT INTO members(user_id, is_manager, group_id) VALUES
                (${body.group.members[0].user_id}, ${body.group.members[0].is_manager}, ${result.insertId}),
                (${body.group.members[1].user_id}, ${body.group.members[1].is_manager}, ${result.insertId}),
                (${body.group.members[2].user_id}, ${body.group.members[2].is_manager}, ${result.insertId})
                `, function(err2, result2) {
                    if(err2) {
                        con.rollback(function(err4) {
                            return error(res, err4);
                       } );
                        
                    } else
                    con.commit(function(errCommit) {
                        console.log(errCommit);
                        res.status(201).send(result2);
                    })
                });
    
        })
    
    })
    // create group and get id 
})
app.listen(4001, function(err) {

})


const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'Mysql2021@',
    database: 'mydb' // use mydb;
})

con.connect(function(err) {
    console.log("connect error:",  err);
   // initTables();
   con.query("SELECt * FROM groups_table" , function(err, data) {
       console.log(data);
   })

})



function initTables() {

    con.query(`CREATE TABLE IF NOT EXISTS supervisors (
        name NVARCHAR(255), 
        id INT NOT NULL AUTO_INCREMENT,
        phone NVARCHAR(255) NOT NULL,
        PRIMARY KEY(id))`, function(err, result) {
            console.log(err, result);
            
    });

    con.query(`CREATE TABLE IF NOT EXISTS interns (
        name NVARCHAR(255), 
        id INT NOT NULL AUTO_INCREMENT,
        phone NVARCHAR(255) NOT NULL,
        supervisor_id INT NOT NULL,
        PRIMARY KEY(id),
        FOREIGN KEY (supervisor_id ) REFERENCES supervisors(id))`, function(err, result) {
            console.log(err, result);
            
    });


    
    con.query(`CREATE TABLE IF NOT EXISTS tests (
        name NVARCHAR(255),
        fileUrl NVARCHAR(255),
        creator_id INT NOT NULL,
        id INT NOT NULL AUTO_INCREMENT,
        avarage_score INT NOT NULL,
        PRIMARY KEY(id),
        FOREIGN KEY(creator_id) REFERENCES supervisors (id)
    )`);

    con.query(`CREATE TABLE IF NOT EXISTS results (
        id INT NOT NULL AUTO_INCREMENT,
        test_id INT NOT NULL,
        intern_id INT NOT NULL,
        score INT NOT NULL,
        fileUrl NVARCHAR(255),
        PRIMARY KEY(id),
        FOREIGN KEY(test_id) REFERENCES tests (id),
        FOREIGN KEY(intern_id) REFERENCES interns (id)
    )`);

    con.query(`CREATE TABLE IF NOT EXISTS groups_table (id INT NOT NULL AUTO_INCREMENT,
        name NVARCHAR(255), creator_id INT NOT NULL,
        imageUrl NVARCHAR(255),
        PRIMARY KEY(id),
        FOREIGN KEY(creator_id) REFERENCES users(id))`, function(err, result){
            console.log(err, result);
            
        });

        con.query(`CREATE TABLE IF NOT EXISTS members (
            id INT NOT NULL AUTO_INCREMENT,
            group_id INT NOT NULL,
            user_id INT NOT NULL,
            is_manager BOOLEAN,
            PRIMARY KEY(id),
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(group_id) REFERENCES groups_table(id),
            UNIQUE(group_id, user_id) )`)
    
    
}

