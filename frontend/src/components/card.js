import React from 'react';
// import { log } from 'util';
import {Card, Container, Row, Col} from 'react-bootstrap';
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
      data: []
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

    // El constructor Persona() define `this` como una instancia de sí mismo.   
    let count = 0; 
    setInterval(async function crecer() { 

      const response = await fetch('http://40.121.92.151:8080/metrics', {
        method: 'POST', // or 'PUT'
        body: '', // data can be `string` or {object}!
        headers:{
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`Actualizando ${count}`);
      
      //const dataResponse = await response.json()
       // En modo no estricto, la función crecer() define `this` 
       // como el objeto global, el cual es diferente al objeto `this` 
       // definido por el constructor Persona().
       count++; 
    }, 10000); 
 } 

 var p = new getData();
 

  //  const response = await fetch('http://40.121.92.151:8080/metrics', {
  //     method: 'POST', // or 'PUT'
  //     body: JSON.stringify(data), // data can be `string` or {object}!
  //     headers:{
  //       'Content-Type': 'application/json'
  //     }
  //   })    
  //   const dataResponse = await response.json()

  //   // console.log(dataResponse);
  //   this.setState({
  //     forecastApi: dataResponse
  //   })
  }
  getAllForecast = async () => {
    const response  = await fetch('http://40.121.92.151:8080/cities')
    const data = await response.json()

    this.setState({
      forecast: data
    })
  };

  render() {
    return (  
      this.state.forecastApi.data.map((item, index) => (
        <Container key={index}>
            <Row>
              <Col>
              <Card>
                {/* <Card.Img variant="top" src="../public/public/favicon.ico" /> */}
                <Card.Body>
                  <Card.Title>Ciudad</Card.Title>
                  <Card.Text>
                    Timezone: {
                      item.timezone === undefined?'Sin Datos':item.timezone
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
        </Container> 
      ))
    )
    
  }
}
