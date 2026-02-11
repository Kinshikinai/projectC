import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import './Profile.css';
import axios from '../../axios.js';
import { getAccessToken } from '../../cookie.js';

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState({'login': 'login', 'id': 0,'role': 'user', 'name': 'User', 'registered_at': '2026-02-10 01:59:33'});

    const [currentPassword, setCurrentPassword] = useState('');
    const [repeatCurrentPassword, setRepeatCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [currentPassType, setCurrentPassType] = useState(true);
    const [repeatCurrentPassType, setRepeatCurrentPassType] = useState(true);
    const [newPassType, setNewPassType] = useState(true);

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
            const datetimeStr = res.data.registered_at;
            const datetime = new Date(datetimeStr.replace(' ', 'T'));
            res.data.registered_at = datetime;
            setUser(res.data);
        })
        .catch(e => {
            console.error(e);
        });
    }, []);

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
    
    return (
        <div className="profilepage">
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
            <div className={user.role === 'user' ? 'orderscontainer' : 'addproduct'}>
                <p>Orders:</p>
                <div className="line"></div>
                <div className="orders">
                    <div className="order"></div>
                    <div className="order"></div>
                    <div className="order"></div>
                    <div className="order"></div>
                    <div className="order"></div>
                    <div className="order"></div>
                    <div className="order"></div>
                </div>
            </div>
        </div>
    )
}

export default Profile;