import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, Card, Row, Flex } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { Typography } from "antd";
const { Link } = Typography;
const topStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const boxStyle: React.CSSProperties = {
  width: "100%",
};

const justifyOptions = [
  "flex-start",
  "center",
  "flex-end",
  "space-between",
  "space-around",
  "space-evenly",
];

const alignOptions = ["flex-start", "center", "flex-end"];

const cardStyle: React.CSSProperties = {
  width: "30%",
  marginBottom: "15px",
};
const gridStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "start",
};
const gridDetailStyle: React.CSSProperties = {
  width: "100%",
  height: "10px",
  display: "flex",
  alignItems: "center",
  textAlign: "start",
};
interface cardItemType {
  id: string;
  membershipName: string;
  orgName: string;
}

const MembershipDetail = () => {
  const navigate = useNavigate();
  const justify = justifyOptions[0];
  const alignItems = alignOptions[0];

  const [cardList, setCardList] = useState<cardItemType[]>([
    {
      id: "1",
      membershipName: "Membership 1",
      orgName: "Organization 1",
    },
  ]);
  const [cardItem, setCardItem] = useState<JSX.Element | null>(null);
            
  return (
    <div>
      <Row style={topStyle}>
        <Button type="primary" onClick={() => navigate(-1)}>
          &lt; Back
        </Button>
      </Row>
      <Flex gap="small" align="start" vertical>
        <Flex
          gap="large"
          style={boxStyle}
          justify={justify}
          align={alignItems}
          wrap="wrap"
        >
          {cardItem}
        </Flex>
      </Flex>
    </div>
  );
};

export default MembershipDetail;
