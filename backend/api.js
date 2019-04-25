'use strict'

const express = require('express')
const asyncify = require('express-asyncify')
// const fetch = require('node-fetch');


const api = express.Router()


const app = express()



const client = require('./config')

// const fetch = require('fetch')

client.on('error', (err) => {
    console.log("Error " + err)
});


api.use((req, res, next) => {
    Object.setPrototypeOf(req, app.request)
    Object.setPrototypeOf(res, app.response)
    req.res = res
    res.req = req
    next()
  })
  




api.use('*', async (req, res, next) => {
    // if (!services) {
    //   debug('Connecting to database')
    //   try {
    //     services = await db(config.db)
    //   } catch (e) {
    //     return next(e)
    //   }
  
    //   Agent = services.Agent
    //   Metric = services.Metric
    // }
    next()
  })

  api.post('/metricas', (req, res) => {

    console.log("entro");
    

    console.log(req);
    
  })

// api.get('/metrics', async (req, res, next) => {
//     const geolocation = 'api.geo';
//     //const errors = 'api.errors';

//     return client.get(geolocation, (err, geo) => {

//         // If that key exists in Redis store
//         if (geo) {
 
//             return res.json({ source: 'cache', data: JSON.parse(geo) })
 
//         } else {

//             const data = [
//                 {
//                     city: 'SANTIAGO',
//                     lat: '-33.447487',
//                     lng: '-70.673676'
//                 }
//             ]

//             client.setex(geolocation, 3600, JSON.stringify(data))
 
//                     // Send JSON response to client
//             return res.json({ source: 'api', data })

//         }

        

//         // If that key exists in Redis store
//         if (errores) {
 
//             return res.json({ source: 'cache', data: JSON.parse(errores) })
 
//         } else { // Key does not exist in Redis store
 
//             // Fetch directly from remote api
//             fetch('https://jsonplaceholder.typicode.com/photos')
//                 .then(response => response.json())
//                 .then(errores => {
 
//                     // Save the  API response in Redis store,  data expire time in 3600 seconds, it means one hour
//                     client.setex(errors, 3600, JSON.stringify(errores))
 
//                     // Send JSON response to client
//                     return res.json({ source: 'api', data: errores })
 
//                 })
//                 .catch(error => {
//                     // log error message
//                     console.log(error)
//                     // send error to the client 
//                     return res.json(error.toString())
//                 })
//             }
//     })

    

// })

module.exports = api