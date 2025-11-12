import { useNavigate } from "react-router-dom";
import "./ButtonLink.css";

function ButtonLink({ to, placeholder, className }) {
    const navigate = useNavigate();

    return (
        <button
            onClick = { () => navigate(to)}
            className= {`button-link ${className? `${className}` : "" }`}
        >
            {placeholder}
        </button>
    );
}

export default ButtonLink;