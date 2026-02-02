import "./Register.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

function Register() {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [pw, setPw] = useState("");
    const [reppw, setRepPw] = useState("");
    const [un, setUn] = useState("");
    const [loading, setLoading] = useState(true);

    function reg(e) {
        if (pw !== reppw) {
            alert("Passwords do not match!");
            return;
        }
        axios.post("http://localhost:8000/register/", {
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
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
    }

    return (
        <div className="register">
            <Box sx={{ bgcolor: '#F5F1DC', height: '56vh', width: '36vw', minHeight: 'fit-content', minWidth: 'fit-content', borderRadius: '10px', 
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '5vh',
                boxShadow: '100px 100px 10px rgba(255, 128, 64, 0.5)' }} >
                <TextField id="filled-basic" label="Login" variant="filled" value={login} onChange={(e) => setLogin(e.target.value)} />
                <TextField id="filled-basic" label="Password" type="password" variant="filled" value={pw} onChange={(e) => setPw(e.target.value)} />
                <TextField id="filled-basic" label="Repeat password" type="password" variant="filled" value={reppw} onChange={(e) => setRepPw(e.target.value)} />
                <TextField id="filled-basic" label="Username" variant="filled" value={un} onChange={(e) => setUn(e.target.value)} />
                <Button variant="outlined" onClick={reg}>Register</Button>
            </Box>
        </div>
    );
}

export default Register;