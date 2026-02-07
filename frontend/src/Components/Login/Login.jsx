import "./Login.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios.js";

function Login() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [pw, setPw] = useState("");
    const [loading, setLoading] = useState(false);
    const [Pass, setPass] = useState(true);

    useEffect(() => {
      if (loading) {
        document.querySelector('.loadoverlay').style.display = 'flex';
      }
      else {
        document.querySelector('.loadoverlay').style.display = 'none';
      }
    }, [loading]);

    function setCookie(name, value, mins) {
      let expires = "";
      if (mins) {
          const date = new Date();
          date.setTime(date.getTime() + (mins * 60 * 1000));
          expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    async function loginin(e) {
      setLoading(true);
      const but = document.querySelector('.auth-container > button');
      but.style.animationName = 'buttonclick';
      setTimeout(() => {
        but.style.animationName = '';
      }, 100);
      const warnscol = document.getElementsByClassName('warn');
      const warns = [...warnscol];
      warns.forEach(warn => {
        warn.addEventListener('webkitAnimationEnd', () => {
          warn.classList.remove('anim');
          warn.style.display = 'none';
        });
        warn.classList.remove('anim');
        warn.style.display = 'none';
      });
      if (!login) {
        warns[0].style.display = 'inline';
        warns[0].classList.add('anim');
        warns[0].innerHTML = "Login is mandatory!!!";
        setLoading(false);
        return;
      }
      else if (!pw) {
        warns[1].style.display = 'inline';
        warns[1].classList.add('anim');
        warns[1].innerHTML = "Password is mandatory!!!";
        setLoading(false);
        return;
      }
    await axios.post("/login", 
        {
        "login": login,
        "password": pw
        },
        {
        headers: {
            "Content-Type": "application/json"
        }
        })
        .then(res => {
        setCookie('access_token', res.data.access_token, 30);
        setLoading(false);
        navigate('/feed');
        })
        .catch(e => {
            warns[0].style.display = 'inline';
            warns[0].classList.add('anim');
            warns[0].innerHTML = e.response.data.detail;
            setLoading(false);
        });
    }

    function reglogswap() {
        const reglogspan = document.querySelector('.auth-container > span');
        reglogspan.style.animationName = 'reglogswap';
        setTimeout(() => {
          reglogspan.style.animationName = '';
          navigate('/')
        }, 150);
      }

    return (
      <div className="reg">
        <div className={`auth-container`}>
        <span onClick={() => {reglogswap()}}>
          <span class="material-symbols-outlined">
            ads_click
          </span>
          Login</span>
        <input type="text" onChange={(e) => {setLogin(e.target.value)}} value={login} placeholder="Login"/>
        <p className="warn"></p>
        <div>
          <input type={Pass ? "password" : "text"} onChange={(e) => {setPw(e.target.value)}} value={pw} placeholder="Password"/>
          <p className="warn"></p>
          <span className="material-symbols-outlined" onClick={() => {setPass(!Pass)}}>{Pass ? "visibility_off" : "visibility"}</span>  
        </div>
        <button onClick={() => {loginin()}}>Proceed</button>
      </div>
      </div>
    );
}

export default Login;