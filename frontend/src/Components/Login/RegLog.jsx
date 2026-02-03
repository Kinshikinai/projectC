import "./RegLog.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegLog() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [pw, setPw] = useState("");
    const [reppw, setRepPw] = useState("");
    const [un, setUn] = useState("");
    const [loading, setLoading] = useState(true);
    const [isLogin, setIsLogin] = useState(true);
    const [RepPass, setRepPass] = useState(true);
    const [Pass, setPass] = useState(true);

    async function reg(e) {
      if (pw !== reppw) {
          document.getElementsByClassName('warn repw')[0].hidden = false;
          document.getElementsByClassName('warn repw')[0].innerHTML = "Passwords don't match";
          return;
      }
      // await axios.get('http://localhost:8000/')
      // .then(res => {
      //   console.log(res.data);
      // })
      // .catch(e => {
      //   console.log(e);
      // });
      await axios.post("http://localhost:8000/register/", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
          "login": login,
          "password": pw,
          "username": un
      }),
      })
      .then((response) => {
      console.log(response.data);
      setLoading(false);
      })
      .catch((error) => {
      console.error("Error fetching data:", error);
      setLoading(false);
      });
    }

    return (
      <div className={`auth-container ${isLogin ? "login" : "register"}`}>
        <span>Register</span>
        <input type="text" onChange={(e) => {setLogin(e.target.value)}} value={login} placeholder="Login"/>
        <p className="warn login" hidden={true}></p>
        <input type="text" onChange={(e) => {setUn(e.target.value)}} value={un} className="reg" placeholder="Username" />
        <p className="warn un" hidden={true}></p>
        <div>
          <input type={Pass ? "password" : "text"} onChange={(e) => {setPw(e.target.value)}} value={pw} placeholder="Password"/>
          <p className="warn pw" hidden={true}></p>
          <span onClick={() => {setPass(!Pass)}}>{Pass ? "X" : "O"}</span>  
        </div>
        <div>
          <input type={RepPass ? "password" : "text"} onChange={(e) => {setRepPw(e.target.value)}} value={reppw} placeholder="Repeat password"/>
          <p className="warn repw" hidden={true}></p>
          <span onClick={() => {setRepPass(!RepPass)}}>{RepPass ? "X" : "O"}</span>
        </div>
        <button onClick={() => {reg()}}>Proceed</button>
    </div>
    );
}

export default RegLog;