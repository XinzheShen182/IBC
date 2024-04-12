import React from "react";
import { Card } from "antd";
import { useParams } from "react-router-dom";
import Status from "./install.tsx";
import DeployedChannels from "./deployed.tsx"
import { usePeerData } from "./hooks.ts";

const { Meta } = Card;
const Detail = ({
  chainCodeId,
}) => {

  return (
    <div style={{ width: '100%' }}>
      <Card
        title="Installed Statuses"
        style={{ width: '100%' }}
      >
        <Status id={chainCodeId} />
      </Card>
      <Card
        title="Channels"
        // style={{ width: 1000 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Meta description="This chaincode has been deployed to the following channels." style={{ margin: 15, width: '100%'}}/>
        <DeployedChannels chaincodeId={chainCodeId}/>
      </Card>
    </div>
  );
};

export default Detail;
