import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer'
import MerchantHome from './views/merchant/MerchantHome';
import SupplierHome from './views/supplier/SupplierHome';
import Login from './views/Login';
import Register from './views/Register';
import Scheduling from './views/supplier/Scheduling';
import Track from './views/common/Track';
import AddItems from './views/supplier/AddItems';
import Browse from './views/common/Browse';
import History from './views/common/History';
import Cart from './views/merchant/Cart';
import MyItems from './views/supplier/myItems';
import './App.css';

function App() {
  return (
    <Router>       
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route path='/register' element={<Register/>} />
        <Route path='/scheduling' element={<Scheduling/>} />
        <Route path='/merchant_home' element={<MerchantHome/>} />
        <Route path='/supplier_home' element={<SupplierHome/>} />
        <Route path='/add_items' element={<AddItems/>} />
        <Route path='/track' element={<Track/>} />
        <Route path='/browse' element={<Browse/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/history' element={<History/>} />
        <Route path='/myitems' element={<MyItems/>} />
      </Routes>
      <Navbar />
      <Footer />
    </Router>
  );
}

export default App;
