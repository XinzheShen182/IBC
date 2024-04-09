import { Row } from "antd";
import Overview from "./Overview";
import CA from "./CA";
import Peer from "./Peer";
import Orderer from "./Orderer";

const EnvDashboard = () => {

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Overview />
        <CA></CA>
      </Row>
      <Row gutter={16}>
        <Peer></Peer>
        <Orderer></Orderer>
      </Row>
    </div>
  );
};

export default EnvDashboard;
