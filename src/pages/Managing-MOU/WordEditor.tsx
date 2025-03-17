import React from "react";
import GgLogin from "../../components/app-layout/components/GgLogin";
import { GoogleOAuthProvider } from '@react-oauth/google'; 

const clientId = "393569771469-alife8pccujdsd3hk4nmnv1ben8npnhi.apps.googleusercontent.com";

const WordEditor: React.FC = () => {
    return (
        <div>
            <GoogleOAuthProvider clientId={clientId}>
                <GgLogin />
            </GoogleOAuthProvider>
        </div>
    );
};

export default WordEditor;
