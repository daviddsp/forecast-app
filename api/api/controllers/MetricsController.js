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

        const SaveCities = client.HMSET("cities", 'santiago','{"city":"santiago","lat": -33.447487,"lng":-70.673676}', 'zurich','{"city":"zurich","lat": 47.3768866, "lng":-8.541694}', 'auckland','{"city":"auckland","lat": -36.8484597, "lng":-174.7633315}', 'sydney','{"city":"sydney","lat": 33.8688197, "lng":-151.2092955}', 'londres','{"city":"londres","lat": 51.5073509, "lng":-0.1277583}', 'georgia','{"city":"georgia","lat": 32.1656221, "lng":-82.9000751}');

        console.log(SaveCities);
        

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

        const locations = req.param('coordinates')

        const arrayPromise = []

        for (const location of locations) {
            const resultPromise = findForecast(location.lat, location.lng)
            arrayPromise.push(resultPromise)
        }

        const  result = await Promise.all(arrayPromise)

        res.status(200).json({ data: result  })
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

/**
 * Brings the forecast of a certain latitude and longitude
 * @param {*} lat 
 * @param {*} lng 
 */
const findForecast = async (lat, lng) => {
    console.log("entro");
    const resultForecast = await axios.get(`${forecastAPI}/${lat},${lng}`)
    console.log("salio");
    return resultForecast.data
}


