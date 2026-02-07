import './Product.css';
import { useLocation } from 'react-router-dom';

function Product() {
    const location = useLocation();

    return (
        <div>
            {"PRODUCT WITH ID: " + location.search.slice(5, location.search.length)}
        </div>
    );
}

export default Product;