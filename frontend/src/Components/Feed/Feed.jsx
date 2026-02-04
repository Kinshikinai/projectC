import "./Feed.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Feed() {
    const navigate = useNavigate();

    return (
        <div className="feed">
            <div className="header">
                <div>A</div>
                <div>B</div>
            </div>
        </div>
    )
}

export default Feed;