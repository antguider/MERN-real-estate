import SearchBar from '../../components/searchbar/Searchbar';
import './homePage.scss';

const HomePage = () => {
    return (
        <div className="home-page">
            <div className="left">
                <h1>
                    Welcome to MERN Estate
                    <br />
                    Find your dream home here
                </h1>
                <p>
                    Find your dream home with ease using our platform.
                    Browse through thousands of listings from various locations.
                    Connect with agents and get personalized assistance.
                    Sign up now to save your favorite properties and receive alerts.
                    Your dream home is just a few clicks away!
                </p>
                <SearchBar/>
                <div className="award">
                    <div className="list">
                        <span className="title">
                            16+
                        </span>
                        Years of Experience
                    </div>
                    <div className="list">
                        <span className="title">
                            200
                        </span>
                        Award Gained
                    </div>
                    <div className="list">
                        <span className="title">
                            2000+

                        </span>
                        Property Ready
                    </div>
                </div>
            </div>
            <div className="right">
                <div className="random-image">
                </div>
            </div>
        </div>
    )
}

export default HomePage;