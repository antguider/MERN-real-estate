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
                <div className="search">
                    <div className="btn-group">
                        <button className='active'>Buy</button>
                        <button>Rent</button>
                    </div>
                    <div className="group-txtbox">
                        <input type="text" name="" id="" placeholder='City Location' />
                        <input type="number" name="" id="" placeholder='Min Price' />
                        <input type="number" name="" id="" placeholder='Max Price' />
                        <div className="search-btn">
                            <img src="./search.png" alt="search" />
                        </div>
                    </div>
                </div>
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