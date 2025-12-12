import "./SearchBar.css"

function SearchBar({ onChange }) {
    return (
        <div className="search-bar-container">
            <img src="/assets/SearchIcon.svg" alt="Search Icon" className="search-icon" />
            <input 
                type="text" 
                className="search-input" 
                placeholder="Search Document"
                onChange={(e) => onChange(e.target.value)} 
            />
        </div>
    );
}

export default SearchBar;