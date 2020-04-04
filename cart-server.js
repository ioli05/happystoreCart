// Libraries
const express = require('express')
var bodyParser = require('body-parser')
var mysql = require('mysql2');
const axios = require("axios");

// Server prop
const app = express()
const port = 5002

// Custom helpers
const query = require('./query');

// Final vars
const SERVICE_NAME = "CartService";

// Endpoints
// const MONITORING_URL = "http://localhost:5005/log"; 
const MONITORING_URL = "http://monitoring-service:5005/log";

// create application/json parser
var jsonParser = bodyParser.json()

// DB Conn
var promisePool;

// Define paths

// Get cart details for guid
app.get('/cart/:guid', jsonParser, async function (req, res) {
    postAsyncLog(`Fetch cart data endpoind called with ${req.params.guid}`)

    const [cartDetails, fields] = await promisePool.query(`SELECT * FROM cart where guid = '${req.params.guid}'`);
    postAsyncLog(`Cart Results fetched: ${cartDetails}`)

    res.json({ cartDetails });
})

// Add to cart with guid
app.post('/cart/:guid', jsonParser, async function (req, res) {
    const item = req.body.item
    const quantity = req.body.quantity
    postAsyncLog(`Add to cart ${req.params.guid} data endpoind called with item: ${item}, quantity: ${quantity}`)

    const queryString = `INSERT INTO cart (guid, item, quantity) VALUES (${req.params.guid}, '${item}',
        ${quantity})`;

    await promisePool.query(queryString)
    postAsyncLog(`Product ${item} added to cart ${req.params.guid} with quantity ${quantity}`)

    res.send('');
})

app.get('/', (req, res) => res.send('Hello World!'))

// Define http Method For generic use
const postAsyncLog = async message => {
    try {
        params = {
            service: SERVICE_NAME,
            timestamp: Date.now(),
            message: message,
        }

        const response = await axios.post(MONITORING_URL, params);
        if (response.status == 200) {
            console.log("Successfully sent to monitoring");
        }
    } catch (error) {
        console.log(error);
    }
};

// Start server and establish connection to db
app.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`)

    console.log(`Establish connection to db...`)

    const pool = mysql.createPool({
        host: 'db-service',
        user: 'root',
        database: 'happystoredb',
        password: 'admin',
        port: 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // now get a Promise wrapped instance of that pool
    promisePool = pool.promise();
})