import "./ContentBox.css";

function ContentBox({ children }) {
    return (
        <div className="content-box">
            {children}
        </div>
    );
}

export default ContentBox;