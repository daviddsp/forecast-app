import React from 'react';
// import { log } from 'util';
import {Card, Row, Col} from 'react-bootstrap';
import moment from 'moment'

import Pusher from 'pusher-js';
import { log } from 'util';

const pusher = new Pusher('51c956b278062347002d', {
  cluster: 'us2',
  encrypted: true
});

const channel = pusher.subscribe('my-channel');



export default class TimeCard extends React.Component {
  
  state = {
    forecastApi: {
      data: [
        
      ]
    }
  }

  componentDidMount() {
    this.getForecastCoordenates()
    this.getAllForecast()
  }

  getForecastCoordenates = async () => {
    channel.bind('update', dataResponse => {      
        this.setState({
          forecastApi: dataResponse
        })    
    })
    function getData() {
      let count = 0; 
      setInterval(async function crecer() { 

        const response = await fetch('http://localhost:1337/metrics', {
          method: 'POST', // or 'PUT'
          body: '', // data can be `string` or {object}!
          headers:{
            'Content-Type': 'application/json'
          }
        }) 
        
        console.log(`Actualizando ${count}`);
        count++;
      }, 10000); 
    } 
    var p = new getData();
  }
  getAllForecast = async () => {
    const response  = await fetch('http://localhost:1337/cities')
    const data = await response.json()
    this.setState({
      forecastApi: data
    })
  };

  render() {
    return (  
      this.state.forecastApi.data.map((item, index) => (
        <Row key={index}>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Ciudad</Card.Title>
                <Card.Text>
                  Timezone: {
                    item.timezone === undefined?'Sin Datossss':item.timezone
                  }
                </Card.Text>
                <Card.Text>
                  Latitude: {item.lat}
                </Card.Text>
                <Card.Text>
                  Longitud: {item.lng}
                </Card.Text>
                <Card.Text>
                  Hora Actual: { item.time }
                </Card.Text>
                <Card.Text>
                  Temperatura: { item.temperature }
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ))
    )
  }
}
