import "./Feed.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../axios.js";
import { getAccessToken } from "../../cookie.js";

function Feed() {
    const navigate = useNavigate();
    const location = useLocation();

    const [profileActive, setProfileActive] = useState(false);
    const [user, setUser] = useState({'login': 'login', 'id': 0,'role': 'user', 'name': 'User'});
    const [sortDown, setSortDown] = useState(true);
    const [sortByValue, setSortByValue] = useState('Price');
    const [products, setProducts] = useState([{}]);
    const [categories, setCategories] = useState([{}]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [cartOverlay, setCartOverlay] = useState(false);
    const [hideHeader, setHideHeader] = useState(false);
    const [headerClasses, setHeaderClasses] = useState("");
    const lorem = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis tenetur culpa debitis provident unde architecto rerum sit sunt dolores repudiandae mollitia facilis labore ipsa beatae, soluta in? Porro, ratione quos!";
    const categories_icons = ['grocery', 'dining', 'family_home', 'devices', 'apparel', 'health_metrics', 'home_repair_service', 'design_services'];
    const roles_icons_colors = ['supervisor_account:red', 'person:blue', 'person:green']
    const rolesindex = ['admin', 'super', 'user']

    useEffect(() => {
        if (getAccessToken() === undefined) {
            alert('Session expired or not logged in!\nYou will be redirected to the Login page.');
            navigate('/login');
        }
        axios.post('/user', {
            token: getAccessToken()
        })
        .then(res => {
            setUser(res.data);
        })
        .catch(e => {
            console.error(e);
        });
        setLoadingProducts(true);
        axios.get('/products')
        .then(res => {
            const sorted = [...res.data.products].sort((a, b) => b.price - a.price);
            setProducts(sorted);
            setLoadingProducts(false);
        })
        .catch(e => {
            console.error(e);
            setLoadingProducts(false);
        });
        setLoadingCategories(true);
        axios.get('/categories')
        .then(res => {
            setCategories(res.data);    
            setLoadingCategories(false);
        })
        .catch(e => {
            console.error(e);
            setLoadingCategories(false);
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
                setHideHeader(true);
            } else {
                sticky.classList.remove('stuck');
                header.classList.remove('hide');
                setHideHeader(false);
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
            <div className={cartOverlay ? "cartoverlay active" : "cartoverlay"} id="cartoverlay">
                CART
            </div>
            <span className={cartOverlay ? "material-icons cart active" : "material-icons cart"} onClick={() => {
                setCartOverlay(!cartOverlay);
                let headerclasses = "";
                if (!cartOverlay) {
                    headerclasses = headerclasses + " shrink";
                }
                if (hideHeader) {
                    headerclasses = headerclasses + " hide";
                }
                setHeaderClasses(headerclasses);
            }}>
                shopping_cart
            </span>
            <div className={"header" + headerClasses}>
                <span className="logo"><a href="/feed">RAMA</a></span>
                <span className="center">
                    <ul>
                        <li><a href="/feed" onClick={(e) => {e.preventDefault();if (products.length > 8) document.getElementById("search").scrollIntoView({ behavior: 'smooth' });}}>Search</a></li>
                        <li><a href="#catalogs" onClick={(e) => {e.preventDefault();window.scrollTo(XMLDocument, document.getElementById('catalogs').scrollHeight - 230)}}>Categories</a></li>
                        <li><a href="/supp" onClick={(e) => {e.preventDefault();navigate('/supp')}}>Support</a></li>
                    </ul>
                </span>
                <span className="profile">
                    <div className="profilecontainer">
                        <span style={{color: roles_icons_colors[rolesindex.indexOf(user.role)].split(':')[1]}} class="material-symbols-outlined ava">
                            {roles_icons_colors[rolesindex.indexOf(user.role)].split(':')[0]}
                        </span>
                        <p className="n" style={{color: roles_icons_colors[rolesindex.indexOf(user.role)].split(':')[1]}}>{user.name}</p>
                        <div className="arrowdown" onClick={(e) => {setProfileActive(!profileActive);}}></div>
                        <ul className={profileActive ? 'profiledropdown active' : 'profiledropdown'}>
                            <li onClick={() => {navigate('/profile')}}>
                                <span className="material-symbols-outlined">
                                    account_circle
                                </span>
                                Profile</li>
                            <li onClick={() => {
                                navigate('/login');
                            document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
                            }}>
                                <span className="material-symbols-outlined">
                                    logout
                                </span>
                                Sign out</li>
                        </ul>
                    </div>
                </span>
            </div>
            <div className="strip">
                <p>RAMA</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquam dolorem modi, nobis in qui molestiae totam illo id pariatur ut perferendis eius alias rerum saepe obcaecati? Assumenda minima non unde?</p>
            </div>
            <div className="catalogs" id="catalogs">
                <div className={loadingCategories ? "loadoverlay active" : "loadoverlay"}>
                    <div className="spinner"></div>
                </div>
                     <div className="row">
                            {categories.slice(0, 4).map(category => {
                                return (    
                                    <div id={"catalog" + category.category_id} className="catalog" onClick={() => {navigate('/category?category_id=' + category.category_id);window.location.reload()}}>
                                        <span class="material-symbols-outlined">
                                            {categories_icons[category.category_id - 1]}
                                        </span>
                                        <p className="name">
                                            {category.category_name}
                                        </p>
                                    </div>
                                )
                            })}
                     </div>
                     <div className="row">
                            {categories.slice(4, 8).map(category => {
                                return (
                                    <div id={"catalog" + category.category_id} className="catalog" onClick={() => {navigate('/category?category_id=' + category.category_id);window.location.reload()}}>
                                        <span class="material-symbols-outlined">
                                            {categories_icons[category.category_id - 1]}
                                        </span>
                                        <p className="name">
                                            {category.category_name}
                                        </p>
                                    </div>
                                )
                            })}
                     </div>
            </div>
            <div className={cartOverlay ? "search shrink" : "search"} id="search">
                <input id="search" type="text" placeholder="Search here..." onChange={(e) => {setSearchQuery(e.target.value)}}/>
                <button onClick={() => {
                    document.getElementById("search").scrollIntoView({ behavior: 'smooth' });
                    axios.get('/products')
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
            <div className={cartOverlay ? "products shrink" : "products"}>
                <div className={loadingProducts ? "loadoverlay active" : "loadoverlay"}>
                    <div className="spinner"></div>
                </div>
                {products.map(p => {
                    if (p && Object.keys(p).length === 0) return ( <div key="0" style={{display: "none"}}></div> )
                    const rating = Math.round(p.rating * 2)/2;
                    let fullStars = [];
                    if (Math.floor(rating) !== 0) fullStars = Array(Math.floor(rating)).fill('1');
                    const hasHalfStar = rating % 1 !== 0;
                    let emptyStars = []
                    if (5 - fullStars.length - (hasHalfStar ? 1 : 0) !== 0) emptyStars = Array(5 - fullStars.length - (hasHalfStar ? 1 : 0)).fill('1');
                    return (
                        <div key={p.product_id} className="productcard" id={"productcard" + p.product_id}>
                            <img src="/src/imgs/CSatHFW_Limp_Bizkit.jpg" alt="" />
                            <p className="name" onClick={(e) => {
                            document.getElementById("productcard" + p.product_id).classList.add('active');
                            setTimeout(() => {
                                navigate('/product?pid=' + p.product_id);
                            }, 150)}}>{p?.product_name?.length > 28 ? p?.product_name?.slice(0, 28).trim() + "..." : p?.product_name}</p>
                            <p className="description">{p.product_description.slice(0, 120)}</p>
                            <p className="quantity">{p.stock_quantity} pcs.
                                <span className="material-symbols-outlined">
                                    warehouse
                                </span></p>
                            <p className="rating">
                                {fullStars.length !== 0
                                ? fullStars.map(s => {
                                    return (
                                        <span key={s} className="material-icons">star</span>
                                    )
                                })
                                : ''
                                }
                                {hasHalfStar
                                ? <span className="material-icons">star_half</span>
                                : ''}
                                {emptyStars.length !== 0
                                ? emptyStars.map(s => {
                                    return (
                                        <span className="material-icons">star_border</span>
                                    )
                                })
                                : ''
                                }</p>
                            <p className="price">
                                <div>
                                    {p.price} 
                                    <span class="material-symbols-outlined">
                                        attach_money
                                    </span>
                                </div>
                            </p>
                        </div>
                    );
                    })}
            </div>
        </div>
    )
}

export default Feed;