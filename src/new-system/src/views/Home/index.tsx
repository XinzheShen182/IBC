import React from 'react';
import styled from 'styled-components';
import { Typography, Button } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  text-align: center;
`;

const DocumentLink = styled(Button)`
  margin-right: 10px;
  background-color: #1890ff;
  border-color: #1890ff;
  &:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }
  &:active {
    background-color: #096dd9;
    border-color: #096dd9;
  }
`;

function HomePage() {
  return (
    <HomePageContainer>
      <Title level={1}>企业多方协作平台</Title>
      <Paragraph>
        欢迎来到企业多方协作平台，我们致力于提供基于区块链技术的安全、透明和高效的协作解决方案。
      </Paragraph>
      <Paragraph>
        利用区块链技术，我们保证了数据的不可篡改性和可追溯性，为企业合作提供了信任基础。
      </Paragraph>
      <Paragraph>
        了解更多关于我们如何利用区块链技术实现协作的信息，请选择以下选项：
      </Paragraph>
      <DocumentLink type="primary" href="/quickstart">快速开始</DocumentLink>
      <DocumentLink type="primary" href="/platform-introduction">平台介绍</DocumentLink>
      <DocumentLink type="primary" href="/team-introduction">团队介绍</DocumentLink>
    </HomePageContainer>
  );
}

export default HomePage;
