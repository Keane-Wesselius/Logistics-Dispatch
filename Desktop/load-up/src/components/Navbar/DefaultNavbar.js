import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import './Navbar.css';

function DefaultNavbar() {
    const [click, setClick] = useState(false);
    
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);
    
    return (
        <>
            <div>
                <nav className="navbar">
                    <div className="navbar-container">
                        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
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
                                <Link to='/' className='nav-links' onclick={closeMobileMenu}>
                                    Login
                                </Link>
                            </li>
                            <li className='nav-item'>
                                <Link to='/register' className='nav-links' onclick={closeMobileMenu}>
                                    Register
                                </Link>
                            </li>
                    </ul>
                </nav>
            </div>
        </>
  );
}

export default DefaultNavbar;