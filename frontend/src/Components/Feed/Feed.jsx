import "./Feed.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../axios.js";

function Feed() {
    const navigate = useNavigate();

    const [profileActive, setProfileActive] = useState(false);



    useEffect(() => {
        document.addEventListener("click", (e) => {
        const dropdown = document.querySelector(".feed .header .profile .profilecontainer");
        if (!dropdown.contains(e.target)) {
            setProfileActive(false);
        }
        });
        const sticky = document.querySelector(".feed .search");
        const header = document.querySelector(".feed .header");
        window.addEventListener("scroll", () => {
            if (sticky.getBoundingClientRect().top <= 10) {
                sticky.classList.add('stuck');
                header.classList.add('hide');
            } else {
                sticky.classList.remove('stuck');
                header.classList.remove('hide');
            }
        });
    }, []);

    return (
        <div className="feed">
            <div className="header">
                <span className="logo"><a href="/feed">LOGO</a></span>
                <span className="center">
                    <ul>
                        <li><a href="#trend">Тренд</a></li>
                        <li><a href="#cats">Категории</a></li>
                        <li><a href="#supp">Поддержка</a></li>
                    </ul>
                </span>
                <span className="profile">
                    <div className="profilecontainer">
                        <div className="ava"></div>
                        <p className="n">Yerassyl</p>
                        <div className="arrowdown" onClick={(e) => {setProfileActive(!profileActive);}}></div>
                        <ul className={profileActive ? 'profiledropdown active' : 'profiledropdown'}>
                            <li>Profile</li>
                            <li>Settings</li>
                            <li>Sign out</li>   
                        </ul>
                    </div>
                </span>
            </div>
            <div className="strip">
                <p>LOGO</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate eveniet officia obcaecati, iusto maxime perferendis, aut porro odit placeat, dolorum tenetur voluptas. Pariatur repellat laborum in quidem aut quo possimus.</p>
            </div>
            <div className="search">
                <input type="text" placeholder="Search here..."/>
                <button>Search</button>
                
            </div>
            <div className="catalogs">
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
                <div className="productcard"></div>
            </div>
        </div>
    )
}

export default Feed;