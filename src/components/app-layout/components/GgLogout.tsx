import React from "react";
import { googleLogout } from "@react-oauth/google";

const GgLogout: React.FC = () => {
    const handleLogout = () => {
        googleLogout();
        console.log("LOG OUT SUCCESS!");
    };

    return (
        <div>
            <h2>Google Logout</h2>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default GgLogout;
