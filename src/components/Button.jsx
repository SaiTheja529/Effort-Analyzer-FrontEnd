import "./Button.css";

const Button = ({ children, variant = "primary", icon, ...props }) => {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
