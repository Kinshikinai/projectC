import { useState, useEffect } from "react";
import { data, useNavigate } from 'react-router-dom';
import './Profile.css';
import axios from '../../axios.js';
import { getAccessToken } from '../../cookie.js';

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState({'login': 'login', 'id': 0,'role': 'user', 'name': 'User', 'registered_at': '2026-02-10 01:59:33'});

    const [currentPassword, setCurrentPassword] = useState('');
    const [repeatCurrentPassword, setRepeatCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [toDelete, setToDelete] = useState(1);

    const [orders, setOrders] = useState([{}]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [products, setProducts] = useState([{}]);

    const [currentPassType, setCurrentPassType] = useState(true);
    const [repeatCurrentPassType, setRepeatCurrentPassType] = useState(true);
    const [newPassType, setNewPassType] = useState(true);

    const roles_icons_colors = ['supervisor_account:red', 'person:blue', 'person:green']
    const rolesindex = ['admin', 'super', 'user']

    const [productName, setProductName] = useState("");
    const [productDesc, setProductDesc] = useState("");
    const [price, setPrice] = useState("");
    const [rating, setRating] = useState("");

    function formatDateDDMMYYYY(isoString) {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    useEffect(() => {
        if (getAccessToken() === undefined) {
            alert('Session expired or not logged in!\nYou will be redirected to the Login page.');
            navigate('/login');
        }
        axios.post('/user', {
            token: getAccessToken()
        })
        .then(res => {
            const datetimeStr = res.data.registered_at;
            const datetime = new Date(datetimeStr.replace(' ', 'T'));
            res.data.registered_at = datetime;
            setUser(res.data);
        })
        .catch(e => {
            console.error(e);
        });
                axios.get('/products')
        .then(res => {
            const sorted = [...res.data.products].sort((a, b) => a.product_name.localeCompare(b.product_name));
            console.log(sorted);
            setProducts(sorted);
            setLoadingProducts(false);
        })
        .catch(e => {
            console.error(e);
            setLoadingProducts(false);
        });
    }, []);

    useEffect(() => {
        if (user.role === 'user') {
            setLoadingProducts(true);
            axios.post('/ordersofuser', 
                {
                    token: getAccessToken()
                }
            )
            .then(res => {
                const sorted = [...res.data].sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
                setOrders(sorted);
                console.log(sorted);
                setLoadingProducts(false);
            })
            .catch(e => {
                console.error(e);
                setLoadingProducts(false);
            });
        }
    }, [user]);

    async function changePassword() {
        let pwarn = document.querySelector('.profilepage .maincontainer .right .resetpw .pwarn');
        pwarn.addEventListener('webkitAnimationEnd', () => {
          pwarn.classList.remove('anim');
          pwarn.style.display = 'none';
        });
        pwarn.style.display = 'none';
        pwarn.classList.remove('anim');
        if (currentPassword === '' || repeatCurrentPassword === '' || newPassword === '') {
            pwarn.innerHTML = 'Every field is mandatory!';
            pwarn.style.display = 'block';
            pwarn.classList.add('anim');
            return;
        }
        else if (currentPassword !== repeatCurrentPassword) {
            pwarn.innerHTML = 'Repeated password doesn\'t match!';
            pwarn.style.display = 'block';
            pwarn.classList.add('anim');
            return;
        }
        else if (currentPassword === newPassword) {
            pwarn.innerHTML = 'Passwords are same!';
            pwarn.style.display = 'block';
            pwarn.classList.add('anim');
            return;
        }
        if (getAccessToken() === undefined) {
            alert('Session expired or not logged in!\nYou will be redirected to the Login page.');
            navigate('/login');
        }
        await axios.post('/resetpw', 
            {
                current_password: currentPassword,
                new_password: newPassword,
                token: getAccessToken()
            }
        )
        .then(res => {
            alert(res.data?.message);
            window.location.reload();
        })
        .catch(e => {
            if (e.response.data.detail.split(':')[1].trim()[0] === '!') {
                pwarn.innerHTML = e.response.data.detail.split(':')[1].slice(2, e.response.data.detail.split(':')[1].legnth);
            }
            else {
                pwarn.innerHTML = e.response.data.detail.split(':')[1];
            }
            pwarn.style.display = 'block';
            pwarn.classList.add('anim');
        })
    }

    function addProduct() {
        if (getAccessToken() === undefined) {
            alert('Session expired or not logged in!\nYou will be redirected to the Login page.');
            navigate('/login');
        }
        axios.post('/admin/products/add',
            {
                token: getAccessToken(),
                product_name: productName,
                product_description: productDesc,
                price: Number.parseInt(price),
                rating: Number.parseFloat(rating)
            }
        )
        .then(res => {
            alert(res.data.message);
        })
        .catch(e => {
            console.error(e);
        });
        setProductName("");
        setProductDesc("");
        setPrice("");
        setRating("");       
    }

    function deleteProduct() {
        if (getAccessToken() === undefined) {
            alert('Session expired or not logged in!\nYou will be redirected to the Login page.');
            navigate('/login');
        }
        console.log(document.getElementById("productid").value);
        axios.post('/admin/products/delete',
            {
                token: getAccessToken(),
                product_id: document.getElementById("productid").value
            }
        )
        .then(res => {
            alert(res.data.message);
            window.location.reload();
        })
        .catch(e => {
            console.error(e);
        });     
    }
    
    return (
        <div className="profilepage">
            <div className={loadingProducts ? "loadoverlay active" : "loadoverlay"}>
                <div className="spinner"></div>
            </div>
            <div className="maincontainer">
                <div className="left">
                    <span style={{backgroundColor: roles_icons_colors[rolesindex.indexOf(user.role)].split(':')[1]}} className="material-symbols-outlined">
                        {roles_icons_colors[rolesindex.indexOf(user.role)].split(':')[0]}
                    </span>
                    <p style={{color: roles_icons_colors[rolesindex.indexOf(user.role)].split(':')[1]}} className="profilename">{user.name}</p>
                </div>
                <div className="right">
                    <div className="info">
                        <p className="register_time">Registration date: <b>{user.registered_at.toString()}</b></p>
                    </div>
                    <div className="resetpw">
                        <p className="pwarn"></p>
                        <div className="input">
                            <input type={currentPassType ? "password" : "text"} value={currentPassword} onChange={(e) => {setCurrentPassword(e.target.value)}} placeholder="Current password" />
                            <span className="material-symbols-outlined" onClick={() => {setCurrentPassType(!currentPassType)}}>{currentPassType ? "visibility_off" : "visibility"}</span>
                        </div>
                        <div className="input">
                            <input type={repeatCurrentPassType ? "password" : "text"} value={repeatCurrentPassword} onChange={(e) => {setRepeatCurrentPassword(e.target.value)}} placeholder="Repeat current password" />
                            <span className="material-symbols-outlined" onClick={() => {setRepeatCurrentPassType(!repeatCurrentPassType)}}>{repeatCurrentPassType ? "visibility_off" : "visibility"}</span>
                        </div>
                        <div className="input">
                            <input type={newPassType ? "password" : "text"} value={newPassword} onChange={(e) => {setNewPassword(e.target.value)}} placeholder="New password" />
                            <span className="material-symbols-outlined" onClick={() => {setNewPassType(!newPassType)}}>{newPassType ? "visibility_off" : "visibility"}</span>
                        </div>
                        <button onClick={(e) => {changePassword()}}>Change password</button>
                    </div>
                </div>
            </div>
            {user.role === 'user'
            ?
            <div className="orderscontainer">
                <p>Orders:</p>
                <div className="line"></div>
                <div className="orders">
                    {orders.map(p => {
                    if (p && Object.keys(p).length === 0) return ( <div key="0" style={{display: "none"}}></div> )
                    const rating = Math.round(p.rating * 2)/2;
                    let fullStars = [];
                    if (Math.floor(rating) !== 0) fullStars = Array(Math.floor(rating)).fill('1');
                    const hasHalfStar = rating % 1 !== 0;
                    let emptyStars = []
                    if (5 - fullStars.length - (hasHalfStar ? 1 : 0) !== 0) emptyStars = Array(5 - fullStars.length - (hasHalfStar ? 1 : 0)).fill('1');
                    return (
                        <div key={p.product_id} className="order" id={"order" + p.product_id}>
                            <img src="/src/imgs/CSatHFW_Limp_Bizkit.jpg" alt="" />
                            <p className="name">{p?.product_name}</p>
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
                                <span>
                                    Ordered {formatDateDDMMYYYY(p.order_date)}
                                </span>
                            </p>
                        </div>
                    );
                    })}
                </div>
            </div>
            :
            <div className="adminpanel">
                <p>Admin panel:</p>
                <div className="container">
                    <div className="addproduct">
                        <p>Add product</p>
                        <input type="text" placeholder="Product name" value={productName} onChange={(e) => {setProductName(e.target.value)}}/>
                        <textarea placeholder="Product description" value={productDesc} onChange={(e) => {setProductDesc(e.target.value)}}></textarea>
                        <input type="number" min={0} maxLength="3" placeholder="Price $ 0-999" value={price} onChange={(e) => {
                            let v = e.target.value;
                            if (v.length > 3) {
                                e.target.value = e.target.value.slice(0, 3);
                                return;
                            }
                            setPrice(v);
                        }}/>
                        <input type="number" max={5} min={0} step={0.5} placeholder="Rating 0-5" value={rating} onChange={(e) => {
                            let v = e.target.value;
                            if (v < 0) {
                                e.target.value = 0;
                                return;
                            }
                            else if (v > 5) {
                                e.target.value = 5;
                                return;
                            }
                            setRating(v);
                        }}/>
                        <button onClick={() => {addProduct()}}>Add</button>
                    </div>
                    <div className="deleteproduct">
                        <p>Delete product</p>
                        <select id="productid">
                            <option value="">Choose</option>
                            {products.map(p => {
                                return (
                                    <option value={p.product_id}>{p.product_name}</option>
                                );
                            })}
                        </select>
                        <button onClick={() => {deleteProduct()}}>Delete</button>
                    </div>
                </div>
            </div>
            }
        </div>
    )
}

export default Profile;