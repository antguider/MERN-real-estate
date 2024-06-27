import { useState } from "react";

const SearchBar = () => {
    const [selectedBtn, setSelectedBtn] = useState('buy');

    const toogleButton = (button)=> {
        setSelectedBtn(button);
    }
    return (
        <div className="search">
            <div className="btn-group">
                <button className={selectedBtn == 'buy'? 'active': ''} onClick={() =>toogleButton('buy')}>Buy</button>
                <button className={selectedBtn == 'rent'? 'active': ''} onClick={() =>toogleButton('rent')}>Rent</button>
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
    )
}

export default SearchBar;