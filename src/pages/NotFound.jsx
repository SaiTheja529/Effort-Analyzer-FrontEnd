import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import Button from "../components/Button";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Card title="Page not found" subtitle="The route you're looking for doesn't exist.">
      <Button variant="secondary" onClick={() => navigate("/")}>
        Go home
      </Button>
    </Card>
  );
};

export default NotFound;
