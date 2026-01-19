import "./Input.css";

const Input = ({ label, helper, ...props }) => {
  return (
    <label className="input-wrapper">
      {label && <span className="input-label">{label}</span>}
      <input className="input-field" {...props} />
      {helper && <span className="input-helper">{helper}</span>}
    </label>
  );
};

export default Input;
