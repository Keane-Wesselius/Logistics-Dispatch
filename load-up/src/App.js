import { Component } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export class App extends Component{
  constructor(props){
    super(props);
    this.state={backendResponse:''};
  }

  callBackend(){
    fetch('http://localhost:9000/testBackend')
    .then(res => res.text())
    .then(res => this.setState({backendResponse: res}));
  }

  componentWillMount(){
    this.callBackend();
  }

  render(){
    return (
      // Couldn't get this code to work on my computer.
      // When I ran it separtely on CodeSandBox it would work so idk what the issue is.
      // Let me know if this code works for you.

      // <BrowserRouter>
      //   <Navbar />
      //   <Routes>
      //     <Route path="/" element={<Home />} />
      //   </Routes>
      //   <Footer />
      // </BrowserRouter>


      // Temporary code
      <div>
        <Navbar />
        <Home />
        <p>{this.state.backendResponse}</p>
        <Footer />
      </div>
    );
  }
}

export default App;