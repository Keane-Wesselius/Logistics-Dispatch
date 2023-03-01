import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import './Navbar.css';

function MerchantNavbar() {
    const [click, setClick] = useState(false);
    
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);
    
    return (
        <>
            <div>
                <nav className="navbar">
                    <div className="navbar-container">
                        <Link to="/merchant_home" className="navbar-logo" onClick={closeMobileMenu}>
                            LoadUp <LocalShippingIcon fontSize= 'large' />
                        </Link>
                    </div>
                    <div className="icon-container">
                        <div className='menu-icon' onClick={handleClick}>
                            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
                        </div>
                    </div>
                    <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                            <li className='nav-item'>
                                <Link to='/browse' className='nav-links' onclick={closeMobileMenu}>
                                    Browse Items
                                </Link>
                            </li>
                            <li className='nav-item'>
                                <Link to='/track' className='nav-links' onclick={closeMobileMenu}>
                                    Track Orders
                                </Link>
                            </li>
                            <li className='nav-item'>
                                <Link to='/history' className='nav-links' onclick={closeMobileMenu}>
                                    History
                                </Link>
                            </li>
                            <li className='nav-item'>
                                <Link to='/' className='nav-links' onclick={closeMobileMenu}>
                                    Logout
                                </Link>
                            </li>
                    </ul>
                </nav>
            </div>
        </>
  );
}

export default MerchantNavbar;