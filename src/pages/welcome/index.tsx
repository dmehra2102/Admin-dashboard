import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { Title } = Typography;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <Title level={2}>Welcome to Admin Portal</Title>
      <Button
        onClick={() => {
          navigate("/home");
        }}
        size="large"
        type="primary"
      >
        Dashboard
      </Button>
    </div>
  );
};
