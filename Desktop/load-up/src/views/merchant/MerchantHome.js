import React from 'react';
import { useNavigate } from 'react-router-dom'
import HomeVideo from '../../components/images/home_page.mp4';
import './MerchantHome.css';

// PAGES:
// 	Unique:
// 		Place Order

// 	Common:
// 		Browse/Select Products
// 		Track Orders
// 		View Previous Orders

function MerchantHome() {
	const navigate = useNavigate();

	return (
		<div className='merchant-container'>
			<video autoPlay loop muted>
				<source src={HomeVideo} type='video/mp4' />
			</video>
            <h1>Welcome Merchant</h1>
			<div classname='merchant-btns'>
				<button className='btns' onClick={() => navigate('/browse')}>
					Browse Products
				</button>
			</div>
			
        </div>
	)
}

export default MerchantHome;