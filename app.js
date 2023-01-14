const {Client} = require('pg');
const cors = require('cors');
const express = require('express');

const client = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: 'rootUser',
    database: 'config'
});
client.connect();

function getTableValues(tableName, success, failure) {
    client.query(`select * from ${tableName}`, (err, res) => {
        if(!err) success(res.rows)
        else failure(err);
    });
}

const app = express();
app.use(cors());

app.get('*', (req, res) => {
    const tableName = req.path.slice(1);
    getTableValues(tableName, (json) => res.send(json), (err) => res.send(err))
});


const PORT = 5000;

app.listen(PORT, () => console.log(`Listening on ${PORT}`));