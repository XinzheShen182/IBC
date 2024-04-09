import React, { useState } from "react";
import { Layout, Space, theme, Flex } from "antd";
import { Outlet } from "react-router-dom";
import MainMenu from "@/views/Layout/MainMenu";
import MainBreadcrumbs from "@/views/Layout/MainBreadcrumbs";
import UserInfo from "@/views/Layout/UserInfo";
import logo from "@/assets/react.svg";
import NotificationCenter from "../NotificationCenter";
import {useNavigate} from "react-router-dom";
const { Header, Content, Footer, Sider } = Layout;

const View: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 左边侧边栏 */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div
          className="demo-logo-vertical"
          style={{
            height: "60px",
            // padding: "20px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={logo} alt="" sizes="" style={{ height: "30px" }} onClick={() => {
            // console.log("Jump to Homepage") 
            navigate('/home')
          }} />
        </div>
        {/* 菜单栏 */}
        <MainMenu />
      </Sider>
      {/* 右边内容 */}
      <Layout>
        {/* 右边顶部 */}
        <Header
          style={{
            padding: "0 40px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MainBreadcrumbs />
          {/*        <Space.Compact  >*/}
          <Flex gap="middle" >
            <NotificationCenter />
            <UserInfo />
          </Flex>
          {/*</Space.Compact>*/}
        </Header>
        {/* 右边主体内容 */}
        <Content style={{ margin: "16px 16px 0 16px", background: "#F5F5F5" }}>
          <div
            style={{
              padding: 10,
              minHeight: 500,
            }}
          >
            {/* Bill is a cat. */}
            <Outlet />
          </div>
        </Content>
        {/* 右边底部 */}
        <Footer style={{ textAlign: "center", padding: 0, lineHeight: "48px" }}>
          LFBaaS ©2023 Created by Linked Future
        </Footer>
      </Layout>
    </Layout>
  );
};

export default View;
