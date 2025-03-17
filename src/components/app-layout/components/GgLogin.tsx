import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";


const GgLogin: React.FC = () => {
  const clientId = "393569771469-alife8pccujdsd3hk4nmnv1ben8npnhi.apps.googleusercontent.com";

  const onSuccess = (res: any) => {
    console.log("LOGIN SUCCESS! Token: ", res.credential);

    // Giải mã token để lấy thông tin user
    const base64Url = res.credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    console.log("User Info:", JSON.parse(jsonPayload));
  };

  const onFailure = () => {
    console.log("LOGIN FAIL!");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        <h2>Google Login</h2>
        <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GgLogin;
