/**
 * MetricsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

require('dotenv').config()
const axios = require('axios')
const forecastAPI = process.env.API_FORECAST
const forecastKey = process.env.FORECAST_KEY
var moment = require('moment');
var errorsIndex = "api.errors";

var redis = require("redis"),
client = redis.createClient();

var Pusher = require('pusher');
var pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    encrypted: process.env.PUSHER_APP_ENCRYTED
  });

const currentDate = moment()

var timeZONE = require('moment-timezone');
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

const initialData = ()=> {


    const SaveCities = client.HMSET("cities", 'santiago','{"city":"santiago","lat": -33.447487,"lng":-70.673676,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'zurich','{"city":"zurich","lat": 47.3666700, "lng":8.5500000,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'auckland','{"city":"auckland","lat": -36.8484597, "lng":-174.7633315,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'sydney','{"city":"sydney","lat": -33.8667, "lng":151.2,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'londres','{"city":"londres","lat": 51.5073509, "lng":-0.1277583,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'georgia','{"city":"georgia","lat": 42.3154068, "lng":43.3568916,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}');

    return ({
        "msj": "save"
    })
}


module.exports = {

    save: async (req, res) => {
        const SaveCities = client.HMSET("cities", 'santiago','{"city":"santiago","lat": -33.447487,"lng":-70.673676,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'zurich','{"city":"zurich","lat": 47.3666700, "lng":8.5500000,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'auckland','{"city":"auckland","lat": -36.8484597, "lng":-174.7633315,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'sydney','{"city":"sydney","lat": -33.8667, "lng":151.2,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'londres','{"city":"londres","lat": 51.5073509, "lng":-0.1277583,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}', 'georgia','{"city":"georgia","lat": 42.3154068, "lng":43.3568916,"timezone": "sin datos", "time": "sin datos", "temperature": "sin datos"}');

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

        // const initial = initialData

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

        const hourNow = moment().format('YYYY:mm:dd HH:mm:ss')
        
        const locations = [
            {
                "city": "santiago",
                "lat": -33.447487,
                "lng": -70.673676,
                "time": timeZONE.tz("America/Santiago").format('LTS')
            },
            {
                "city": "zurich",
                "lat": 47.36667,
                "lng": 8.55,
                "time": timeZONE.tz("Europe/Zurich").format('LTS')
            },
            {
                "city": "auckland",
                "lat": -36.8484597,
                "lng": -174.7633315,
                "time": timeZONE.tz("Pacific/Auckland").format('LTS')
            },
            {
                "city": "sydney",
                "lat": -33.8667,
                "lng": 151.2,
                "time": timeZONE.tz("Australia/Sydney").format('LTS')
            },
            {
                "city": "londres",
                "lat": 51.5073509,
                "lng": -0.1277583,
                "time": timeZONE.tz("America/Santiago").format('LTS')
            },
            {
                "city": "georgia",
                "lat": 42.3154068,
                "lng": 43.3568916,
                "time": timeZONE.tz("Atlantic/South_Georgia").format('LTS')
            }
        ]

        

            const arrayPromise = []

            for (const location of locations) {
                const resultPromise = findForecast(location.lat, location.lng, location.time)
                arrayPromise.push(resultPromise)
            }

            const result = await Promise.all(arrayPromise)

            const saveRedis = []

            for (const data of result) {

                // console.log('time',data.time);
                
                saveRedis.push({
                    lat: data.data.latitude,
                    lng: data.data.longitude,
                    timezone: data.data.timezone,
                    time: data.time,
                    temperature: data.data.currently.temperature
                })
            }

            // console.log(saveRedis);
            
            
            // const SaveCities = client.HMSET("cities", 'santiago','{"city":"santiago","lat": -33.447487,"lng":-70.673676}', 'zurich','{"city":"zurich","lat": 47.3666700, "lng":8.5500000}', 'auckland','{"city":"auckland","lat": -36.8484597, "lng":-174.7633315}', 'sydney','{"city":"sydney","lat": -33.8667, "lng":151.2}', 'londres','{"city":"londres","lat": 51.5073509, "lng":-0.1277583}', 'georgia','{"city":"georgia","lat": 42.3154068, "lng":43.3568916}');

            const saveForecast = client.HMSET('conditions', 'cities',`${JSON.stringify(saveRedis)}`);


            client.hgetall("conditions", function (err, obj) {

                //console.log('Conditions redis',obj);
                
                const conditions = []

                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const element = obj[key];
                        conditions.push(JSON.parse(element))       
                    }
                }        
                
                pusher.trigger('my-channel', 'update', { data: conditions[0] });
                
            });
            // 6console.log(`Actualización nª${count}`);                
            

        return res.status(200).json({ data: {"msj": "se actualizo con exito"} })
        
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
 * Devuelve el tiempo de una lat,lng establecida
 * @param {*} lat 
 * @param {*} lng 
 */
const findForecast = async (lat, lng, time) => {

    try {

        const err = await ProbabilidadError()
        
        if (!err){
            const resultForecast = await axios.get(`${forecastAPI}/${forecastKey}/${lat},${lng}?lang=es`)

            let result =  []
            result.push({
                data: resultForecast.data,
                time: time
            })

            return result[0]
        }
        console.log("salio");

    } catch (error) {
        console.log(error);
        
    }

}
/**
 * Function que retorna la probabilidad de un error
 */
const ProbabilidadError = () =>{
    let err = true;
    
    for(let i = 0; i>100;i ++){

    }
    do{
        if (Math.random(0,1) < 0.1){
            const saveErrors = client.HMSET(errorsIndex, currentDate,`{"value":"'How unfortunate! The API Request Failed'"}`);
            console.log("entro en el error & se guardo en redis");
        }else{
            console.log("realiza la consulta a la api");
            err = false
            return false
        }
    }while(err == false)
}