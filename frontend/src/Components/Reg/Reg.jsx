import "./Reg.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios.js";

function Reg() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [pw, setPw] = useState("");
    const [reppw, setRepPw] = useState("");
    const [un, setUn] = useState("");
    const [loading, setLoading] = useState(false);
    const [RepPass, setRepPass] = useState(true);
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

    async function reg(e) {
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
      else if (!un) {
        warns[1].style.display = 'inline';
        warns[1].classList.add('anim');
        warns[1].innerHTML = "Username is mandatory!!!";
        setLoading(false);
        return;
      }
      else if (!pw) {
        warns[2].style.display = 'inline';
        warns[2].classList.add('anim');
        warns[2].innerHTML = "Password is mandatory!!!";
        setLoading(false);
        return;
      }
      else if (!reppw) {
        warns[3].style.display = 'inline';
        warns[3].classList.add('anim');
        warns[3].innerHTML = "Repeat the password, please!!!";
        setLoading(false);
        return;
      }
      else if (pw !== reppw) {
        warns[3].style.display = 'inline';
        warns[3].classList.add('anim');
        warns[3].innerHTML = "Passwords don't match";
        setLoading(false);
        return;
      }

        await axios.post("/register", 
          {
            "login": login,
            "password": pw,
            "username": un
          },
          {
            headers: {
              "Content-Type": "application/json"
            }
          })
        .then(async (response) => {
          if (response.data.success) {
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
                console.log(res.data);
                setCookie('access_token', res.data.access_token, 30);
                navigate('/feed');
              })
          }
        setLoading(false);
        })
        .catch((error) => {
        if (error.response.data.detail.split(':')[1].trim()[0] === '!') {
          warns[2].style.display = 'inline';
          warns[2].classList.add('anim');
          warns[2].innerHTML = error.response.data.detail.split(':')[1].trim().slice(1);
        }
        else {
          warns[1].style.display = 'inline';
          warns[1].classList.add('anim');
          warns[1].innerHTML = error.response.data.detail.split(':')[1].trim();
        }
        setLoading(false);
        });
    }

    function reglogswap() {
        const reglogspan = document.querySelector('.auth-container > span');
        reglogspan.style.animationName = 'reglogswap';
        setTimeout(() => {
          reglogspan.style.animationName = '';
          navigate('/login')
        }, 150);
      }

    return (
      <div className="reg">
        <div className={`auth-container`}>
        <span onClick={() => {reglogswap()}}>Register</span>
        <input type="text" onChange={(e) => {setLogin(e.target.value)}} value={login} placeholder="Login"/>
        <p className="warn"></p>
        <input type="text" onChange={(e) => {setUn(e.target.value)}} value={un} placeholder="Username" />
        <p className="warn"></p>
        <div>
          <input type={Pass ? "password" : "text"} onChange={(e) => {setPw(e.target.value)}} value={pw} placeholder="Password"/>
          <p className="warn"></p>
          <span onClick={() => {setPass(!Pass)}}>{Pass ? "X" : "O"}</span>  
        </div>
        <div>
          <input type={RepPass ? "password" : "text"} onChange={(e) => {setRepPw(e.target.value)}} value={reppw} placeholder="Repeat password"/>
          <p className="warn"></p>
          <span onClick={() => {setRepPass(!RepPass)}}>{RepPass ? "X" : "O"}</span>
        </div>
        <button onClick={() => {reg()}}>Proceed</button>
      </div>
      </div>
    );
}

export default Reg;