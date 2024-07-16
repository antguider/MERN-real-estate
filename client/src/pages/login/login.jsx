import { Link } from "react-router-dom"
import './login.scss'
import axios from "axios";
import { useState } from "react";

const Login = () => {
    const [err, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);
        const username = formData.get("username")
        const password = formData.get("password");
        try {
            const res = await axios.post("", {username, password});
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="login">
            <div className="formContainer">
                <form onSubmit={handleSubmit}>
                    <h1>Welcome</h1>
                    <input name="username" type="text" placeholder="Username" />
                    <input name="password" type="password" placeholder="Password" />
                    <button disabled={isLoading} >Login</button>
                    {err && <span>{err}</span>}
                    <Link to="/register">Already have an account?</Link>
                </form>
            </div>
            <div className="imgContainer">
                <img src="/bg.png" alt="" />
            </div>
        </div>
    )
}

export default Login