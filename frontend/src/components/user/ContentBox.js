import "./ContentBox.css";

function ContentBox({ children, className = "" }) {
  return (
    <div className={`content-box ${className}`}>
      {children}
    </div>
  );
}

export default ContentBox;