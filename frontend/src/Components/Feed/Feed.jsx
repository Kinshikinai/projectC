import "./Feed.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axios.js";

function Feed() {
    const navigate = useNavigate();
    const location = useLocation();

    const [profileActive, setProfileActive] = useState(false);
    const [name, setName] = useState("Name");
    const [sortDown, setSortDown] = useState(true);
    const [sortByValue, setSortByValue] = useState('Price');
    const [products, setProducts] = useState([{}]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setLoadingProducts(true);
        axios.post('/admin/products', {
            token: document.cookie.split(";")[0].split('=')[1]
        })
        .then(res => {
            const sorted = [...res.data.products].sort((a, b) => b.stock_quantity - a.stock_quantity);
            setProducts(sorted);
            setLoadingProducts(false);
        })
        .catch(e => {
            console.error(e);
            setLoadingProducts(false);
        });
    }, []);

    useEffect(() => {
        document.addEventListener("click", (e) => {
        const dropdown = document.querySelector(".feed .header .profile .profilecontainer");
        if (dropdown) {
            if (!dropdown.contains(e.target)) {
                setProfileActive(false);
            }
        }
        });
        const sticky = document.querySelector(".feed .search");
        const header = document.querySelector(".feed .header");
        window.addEventListener("scroll", () => {
            if (sticky.getBoundingClientRect().top <= 80) {
                sticky.classList.add('stuck');
                header.classList.add('hide');
            } else {
                sticky.classList.remove('stuck');
                header.classList.remove('hide');
            }
        });
        const sortby = document.getElementById("sortby");
        sortby.addEventListener('change', () => {
            setSortByValue(sortby.value);
        });
    }, []);

    useEffect(() => {
        let sorted = [...products];
        switch (sortByValue) {
            default:
                console.log('Z');
                break;
            case "Rating":
                if (sortDown) sorted = [...products].sort((a, b) => b.rating - a.rating);
                else sorted = [...products].sort((a, b) => a.rating - b.rating);
                setProducts(sorted);
                break;
            case "Price":
                if (sortDown) sorted = [...products].sort((a, b) => b.price - a.price);
                else sorted = [...products].sort((a, b) => a.price - b.price);
                setProducts(sorted);
                break;
            case "Quantity":
                if (sortDown) sorted = [...products].sort((a, b) => b.stock_quantity - a.stock_quantity);
                else sorted = [...products].sort((a, b) => a.stock_quantity - b.stock_quantity);
                setProducts(sorted);
                break;
        }
    }, [sortByValue, sortDown]);

    return (
        <div className="feed">
            <div className="header">
                <span className="logo"><a href="/feed">NIGAMart</a></span>
                <span className="center">
                    <ul>
                        <li><a href="/feed" onClick={(e) => {e.preventDefault();if (products.length > 8) document.getElementById("search").scrollIntoView({ behavior: 'smooth' });setSortByValue('Rating');setSortDown(true);console.log(sortByValue);}}>Тренд</a></li>
                        <li><a href="/catalog" onClick={(e) => {e.preventDefault();navigate('/catalog')}}>Категории</a></li>
                        <li><a href="/supp" onClick={(e) => {e.preventDefault();navigate('/supp')}}>Поддержка</a></li>
                    </ul>
                </span>
                <span className="profile">
                    <div className="profilecontainer">
                        <div className="ava"></div>
                        <p className="n">{name}</p>
                        <div className="arrowdown" onClick={(e) => {setProfileActive(!profileActive);}}></div>
                        <ul className={profileActive ? 'profiledropdown active' : 'profiledropdown'}>
                            <li onClick={() => {navigate('/profile')}}>Profile</li>
                            <li onClick={() => {navigate('/settings')}}>Settings</li>
                            <li onClick={() => {
                                navigate('/login');
                            document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
                            }}>Sign out</li>
                        </ul>
                    </div>
                </span>
            </div>
            <div className="strip">
                <p>NIGAMart</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam dolorem modi, nobis in qui molestiae totam illo id pariatur ut perferendis eius alias rerum saepe obcaecati? Assumenda minima non unde?</p>
            </div>
            <div className="search" id="search">
                <input id="search" type="text" placeholder="Search here..." onChange={(e) => {setSearchQuery(e.target.value)}}/>
                <button onClick={() => {
                    document.getElementById("search").scrollIntoView({ behavior: 'smooth' });
                    axios.post('/admin/products', {
                        token: document.cookie.split(";")[0].split('=')[1]
                    })
                    .then(res => {
                        const sorted = [...res.data.products].sort((a, b) => b.rating - a.rating);
                        setProducts(sorted.filter(product =>
                            product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
                        ));
                        setLoadingProducts(false);
                    })
                    .catch(e => {
                        console.error(e);
                        setLoadingProducts(false);
                    });
                }}><span className="material-symbols-outlined">search</span></button>
                <span>
                    <span className="material-symbols-outlined">sort</span>
                    <select id="sortby">
                        <option selected={sortByValue === 'Quantity' ? true : false}>Quantity</option>
                        <option selected={sortByValue === 'Rating' ? true : false}>Rating</option>
                        <option selected={sortByValue === 'Price' ? true : false}>Price</option>
                    </select>
                </span>
                <span>
                    <span className={sortDown ? "material-symbols-outlined arrowdown active" : "material-symbols-outlined arrowdown"} onClick={() => {setSortDown(true)}}>
                        south
                    </span>
                    <span className={sortDown ? "material-symbols-outlined arrowup" : "material-symbols-outlined arrowup active"} onClick={() => {setSortDown(false)}}>
                        north
                    </span>
                </span>
            </div>
            <div className="products">
                <div className={loadingProducts ? "loadoverlay active" : "loadoverlay"}>
                    <div className="spinner"></div>
                </div>
                {products.map(p => (
                    <div key={p.product_id} className="productcard">
                        <p className="name">{p.product_name}</p>
                        <p className="price">{p.price}</p>
                        <p className="quantity">{p.stock_quantity}</p>
                        <p className="rating">{p.rating}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Feed;