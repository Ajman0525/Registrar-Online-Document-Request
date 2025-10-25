import { useNavigate } from "react-router-dom";
import "./ButtonLink.css";

function ButtonLink({ to, placeholder, className, onClick }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (to) {
            navigate(to);
        }
    };
    
    return (
        <button
            onClick={handleClick}
            className={`button-link ${className ? `${className}` : ""}`}
        >
            {placeholder}
        </button>
    );
}

export default ButtonLink;