import './navbar.scss';

const Navbar = () => {
    console.log("Navbar");
    return (
        <div className="navbar">
            <div className="left">
                <div className="logo">
                    <img src="./logo.png" alt="MERN Estate" />
                    <h4>MERN Estate</h4>
                </div>
                <span>Home</span>
                <span>About</span>
                <span>Contact</span>
                <span>Agents</span>
            </div>
            <div className="right">
                <div className="usr">
                    <img src="./profile_user.png" alt="Muthukumar J" />
                    <span className="name">Muthukumar J</span>
                </div>
                <button type="button">Profile</button>
            </div>
        </div>
    )
};

export default Navbar;