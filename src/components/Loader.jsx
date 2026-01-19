import "./Loader.css";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="loader">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
};

export default Loader;
