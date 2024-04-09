import { useSelector } from "react-redux";
import React from "react";
import { Button, Row, Col, Typography, Space } from "antd";
const { Title, Text } = Typography;

import { useAppDispatch } from "@/redux/hooks";
import { openOrgSelectRequest } from "@/redux/slices/UISlice";
import { InfoCircleOutlined } from '@ant-design/icons';

const buttonStyle: React.CSSProperties = {
  // Button 居中
  marginTop: 40,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
const textStyle: React.CSSProperties = {
  fontSize: 48,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
};
const parentStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "70vh",
};
import { useOrgInfo } from './hooks.ts';
const Dashboard = () => {
  const currOrgId = useSelector((state: any) => state.org.currentOrgId);
  const dispatch = useAppDispatch();
  const [orgInfo, orgStatus, orgRefetch] = useOrgInfo(currOrgId);
  // PROBLEM Menu无法被控制开合，这里的行为只能指定到添加一个组织
  if (currOrgId === "") {
    return (
      <div style={parentStyle}>
        <div style={textStyle}>
          Haven't activated an organization？
        </div>
        <div style={buttonStyle}>
          <Button type="primary" onClick={() => { dispatch(openOrgSelectRequest()) }}>Click Me To Create/Activate!</Button>
        </div>
      </div>
    );
  } else {
    return (
      // show the Organization Infomation
      <div style={{ padding: '20px' }}>
        <Title level={2}>Dashboard</Title>
        <Row style={{ marginBottom: '20px' }}>
          <Col span={24}>
            <Text style={{ fontSize: '18px' }}>Organization: {orgInfo.name}</Text>
          </Col>
        </Row>
        <Row style={{ marginBottom: '20px' }}>
          <Col span={24}>
            <Space>
              <Text style={{ fontSize: '16px' }}>Organization ID: {orgInfo.id}</Text>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Space>
          </Col>
        </Row>
      </div>
    )
  }
};

export default Dashboard;