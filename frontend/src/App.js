import React from 'react';
// import logo from './logo.svg';
import './App.css';
import {Jumbotron, Container} from 'react-bootstrap';
import TimeCard from './components/card'
function App() {
  return (
    <div>
      <Jumbotron style={{ textAlign:'center' }}>
        <h1>Listado de ciudades del mundo</h1>
      </Jumbotron>
      <Container>
        <TimeCard/>
      </Container>
    </div>
  );
}

export default App;
