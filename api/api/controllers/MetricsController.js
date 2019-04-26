/**
 * MetricsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

require('dotenv').config()
const axios = require('axios')
const forecastAPI = process.env.API_FORECAST
var moment = require('moment');
var errorsIndex = "api.errors";

var redis = require("redis"),
client = redis.createClient();

var Pusher = require('pusher');
var pusher = new Pusher({
    appId: '770454',
    key: '51c956b278062347002d',
    secret: '5b111b0c9903da3bd75c',
    cluster: 'us2',
    encrypted: true
  });

const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");
const locations = [
    {
        'city': 'America/Santiago',
        'lat': -33.447487,
        'lng': -70.673676
    },
    {
        'city': 'America/New_York',
        'lat': 42.3601,
        'lng': -71.0589
    }
]


module.exports = {

    save: async (req, res) => {

        const SaveCities = client.HMSET("cities", 'santiago','{"city":"santiago","lat": -33.447487,"lng":-70.673676}', 'zurich','{"city":"zurich","lat": 47.3666700, "lng":8.5500000}', 'auckland','{"city":"auckland","lat": -36.8484597, "lng":-174.7633315}', 'sydney','{"city":"sydney","lat": -33.8667, "lng":151.2}', 'londres','{"city":"londres","lat": 51.5073509, "lng":-0.1277583}', 'georgia','{"city":"georgia","lat": 42.3154068, "lng":43.3568916}');

        return res.status(200).json({
            "msj": "save"
        })
    },

    get: async (req, res) => {
        client.hgetall("conditions", function (err, obj) {
            const conditions = []

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const element = obj[key];
                    conditions.push(JSON.parse(element))       
                }
            }  

            pusher.trigger('my-channel', 'update', { data: conditions[0] });
            return res.status(200).json(conditions[0])
        })
    },

    getData: async (req, res) => {
        client.hgetall("cities", function (err, obj) {
            const cities = []

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const element = obj[key];
                    cities.push(JSON.parse(element))       
                }
            }            
            return res.status(200).json({ data: cities  })
        });
    }, 

    getMetrics: async (req, res) => {

        const locations = [
            {
                "city": "santiago",
                "lat": -33.447487,
                "lng": -70.673676
            },
            {
                "city": "zurich",
                "lat": 47.36667,
                "lng": 8.55
            },
            {
                "city": "auckland",
                "lat": -36.8484597,
                "lng": -174.7633315
            },
            {
                "city": "sydney",
                "lat": -33.8667,
                "lng": 151.2
            },
            {
                "city": "londres",
                "lat": 51.5073509,
                "lng": -0.1277583
            },
            {
                "city": "georgia",
                "lat": 42.3154068,
                "lng": 43.3568916
            }
        ]

        let count = 0

        const value = setInterval(async function crecer(){

            const arrayPromise = []

        for (const location of locations) {
            const resultPromise = findForecast(location.lat, location.lng)
            arrayPromise.push(resultPromise)
        }

        const result = await Promise.all(arrayPromise)

        const saveRedis = []

        for (const data of result) {
            saveRedis.push({
                lat: data.latitude,
                lng: data.longitude,
                timezone: data.timezone,
                time: data.currently.time
            })
        }

        pusher.trigger('my-channel', 'update', { data: saveRedis });


        // res.status(200).json({ data: saveRedis  })

            console.log(`Actualización nª${count}`);
            
            count++; 
        }, 10000)

        return res.status(200).json({ data: {"msj": "SE actualizo con exito"} })
        
    },

    saveErrors: async (req, res) => {
        try {
            
            const saveErrors = client.HMSET(errorsIndex, currentDate,`{"value":"22"}`);
            console.log(saveErrors);
            
        } catch (error) {
            console.log(error);
            
        }
    },
    getErrors: (req, res) => {
        
        client.hgetall(errorsIndex, function (err, errs) {
            const errors = []

            for (const key in errs) {
                if (errs.hasOwnProperty(key)) {
                    const element = JSON.parse(errs[key]);
                    errors.push({date:key, error: element.value})       
                }
            }            
            return res.status(200).json({ data: errors })
        });

    }
};


const interval = async () => {
    const value = setInterval(findForecast(), 10000)
}

/**
 * Brings the forecast of a certain latitude and longitude
 * @param {*} lat 
 * @param {*} lng 
 */
const findForecast = async (lat, lng) => {

    const now = moment().unix()
    console.log(now);
    
    console.log("entro");
    const resultForecast = await axios.get(`${forecastAPI}/${lat},${lng},${now}?lang=es`)

    if (Math.random(0, 1) < 0.1) throw new Error('How unfortunate! The API Request Failed')

    console.log("salio");
    return resultForecast.data
    
}


