import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar';
import Footer from './components/Footer'
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Scheduling from './views/Scheduling';
import Dashboard from './views/Dashboard'
import './App.css';

function App() {
  return (
    <Router>       
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/scheduling' element={<Scheduling/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/home' element={<Home/>} />
      </Routes>
      <Navbar />
      <Footer />
    </Router>
  );
}

export default App;
