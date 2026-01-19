import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="logo-dot" />
          <span className="footer-title">Effort Analyzer</span>
        </div>
        <div className="footer-links">
          <span>AI-powered GitHub effort insights.</span>
          <span>Backend: FastAPI · Frontend: React</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
