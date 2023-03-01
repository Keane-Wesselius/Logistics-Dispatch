import React from 'react';
import { useNavigate } from 'react-router-dom'
import HomeVideo from '../../components/images/home_page.mp4';
import './SupplierHome.css';

// PAGES:
// 	Unique:
// 		Place Order

// 	Common:
// 		Browse/Select Products
// 		Track Orders
// 		View Previous Orders

function SupplierHome() {
	const navigate = useNavigate();

	return (
		<div className='supplier-container'>
			<video autoPlay loop muted>
				<source src={HomeVideo} type='video/mp4' />
			</video>
            <h1>Welcome Supplier</h1>
			<div classname='supplier-btns'>
				<button className='btns' onClick={() => navigate('/browse')}>
					My Items
				</button>
			</div>
			
        </div>
	)
}

export default SupplierHome;