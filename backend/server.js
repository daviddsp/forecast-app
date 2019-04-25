'use strict'

const http = require('http')
const express = require('express')
const asyncify = require('express-asyncify')
const api = require('./api')

const port = process.env.PORT || 3000
const app = asyncify(express())
const bodyParser = require('body-parser');

const server = http.createServer(app)

app.use('/api', api)
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


server.listen(port, () => {
    console.log(`server listening on port ${port}`)
})

module.exports = server