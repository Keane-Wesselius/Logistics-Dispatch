import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import './Navbar.css';

function Navbar() {
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
                            <li className='nav-item'>
                                <Link to='/scheduling' className='nav-links' onclick={closeMobileMenu}>
                                    Scheduling
                                </Link>
                            </li>
                            <li className='nav-item'>
                                <Link to='/dashboard' className='nav-links' onclick={closeMobileMenu}>
                                    Dashboard
                                </Link>
                            </li>
                            <li className='nav-item'>
                                <a href='https://github.com/Keane-Wesselius/Logistics-Dispatch/tree/main/Common' target="_blank" rel="noopener noreferrer" className='nav-links'>
                                    GitHub
                                </a>
                            </li>
                    </ul>
                </nav>
            </div>
        </>
  );
}

export default Navbar;