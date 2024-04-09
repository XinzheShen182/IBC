import error404 from "./404.gif";
import styled from "./index.module.scss";
import { Button, Space } from "antd";
import { ApiTwoTone } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { notFound } from '@/types/error' 
const NotFound: notFound = (props) => {
  const { notFoundBox, text } = styled;
  const navigateTo = useNavigate();
  const toHomeClick = () => {
    navigateTo("/");
  };
  return (
    <div className={notFoundBox}>
      <div className={text}>
        <h1 style={{ fontSize: "36px", marginBottom: "20px" }}>
          {props.h1Text}
        </h1>
        <Space>
          <ApiTwoTone /> 啊哦～页面消失了哦～
        </Space>
        <p>不如去首页瞧一瞧</p>
        <p>
          <Button onClick={toHomeClick} type="link">
            点这里哦～
          </Button>
        </p>
      </div>
      <img src={error404} alt="" />
    </div>
  );
};
export default NotFound;
