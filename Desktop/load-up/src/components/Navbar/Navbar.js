import { useNavbar } from '../../NavbarContext';
import MerchantNavbar from './MerchantNavbar';
import SupplierNavbar from './SupplierNavbar';
import DefaultNavbar from './DefaultNavbar';

function Navbar() {
    const navbar = useNavbar();

    if (navbar.toLowerCase() === "merchant") {
        return <MerchantNavbar />
    }
    else if (navbar.toLowerCase() === "supplier") {
        return <SupplierNavbar />
    }
    else {
        return <DefaultNavbar />
    }
}

export default Navbar;