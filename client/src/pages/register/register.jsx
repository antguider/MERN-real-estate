import { Link, useNavigate } from "react-router-dom";
import './register.scss'
import { useState } from "react";
import apiRequest from "../../../../api/lib/apiRequest";

const Register = () => {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log('formData',);
        const username = formData.get("username")
        const email = formData.get("email")
        const password = formData.get("password");

        try {
            const res = await apiRequest.post("http://localhost:8800/api/auth/register", { username, email, password })
            console.log('res', res);
            navigate("/login");
        } catch (err) {
            console.log('err', err);
            setError(err.response.data.message);
        }
    }
    return (
        <div className="register">
            <div className="formContainer">
                <form onSubmit={handleSubmit}>
                    <h1>Create an Account</h1>
                    <input name="username" type="text" placeholder="Username" />
                    <input name="email" type="text" placeholder="Email" />
                    <input name="password" type="password" placeholder="Password" />
                    <button >Register</button>
                    {error && <span className="error">{error}</span>}
                    <Link to="/login" >Do you have an account?</Link>
                </form>
            </div>
            <div className="imgContainer">
                <img src="./bg.png" alt="" />
            </div>
        </div>
    )
}

export default Register