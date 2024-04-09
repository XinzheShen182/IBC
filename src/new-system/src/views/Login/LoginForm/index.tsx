import React, { useEffect, useState } from "react";
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Tabs, message } from "antd";
import styles from "./index.module.scss";
import { useNavigate } from "react-router-dom";
import LoginTitle from "./LoginLogo";
const { TabPane } = Tabs;


//Action Dispatch and Selector
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { selectUser, loginAction, registerUserAction, registerReset } from '@/redux/slices/userSlice'

import { loginStart, loginSuccess, loginFailed, logout } from '@/redux/slices/userSlice'

const App: React.FC = () => {
  const navigateTo = useNavigate();
  const { loginFormBox, loginFormButton } = styles;
  const [registerForm] = Form.useForm();
  const [loginForm] = Form.useForm();

  const loginStatus = useAppSelector(selectUser).loginStatus === 'login';
  const registerStatus = useAppSelector(selectUser).registerStatus;
  const dispatch = useAppDispatch();
  const [activeKey, setActiveKey] = useState("1");
  const onKeyChange = (key: string) => {
    setActiveKey(key);
  }

  const isSuccess = useAppSelector(
    (state) => state.user
  ).loginStatus === 'success';

  useEffect(() => {
    if (registerStatus !== 'idle') {
      if (registerStatus === 'failed') {
        message.error('注册失败');
      } else if (registerStatus === 'success') {
        message.success('注册成功');
        loginForm.setFieldsValue({
          email: registerForm.getFieldValue('email'),
          password: registerForm.getFieldValue('password')
        });
        registerForm.resetFields();
        setActiveKey('1');
      }
      dispatch(registerReset());
    }
  }
    , [registerStatus]);

  useEffect(() => {
    if (isSuccess) {
      navigateTo('/home');
    }
  }, [isSuccess]);


  const onFinishLogin = async (values: any) => {
    dispatch(loginAction(values.email, values.password))
  };

  const onFinishRegister = (values: any) => {
    // 注册处理逻辑
    dispatch(registerUserAction(values.username, values.email, values.password))
  };

  const validateMessages = {
    required: "${label}是必填项!",
    types: {
      email: "${label}不是有效的邮箱!",
      pattern: {
        mismatch: "${label}格式不正确!",
      },
    },
  };

  const passwordValidator = (form) => ({
    validator(_, value) {
      if (!value || form.getFieldValue("password") === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("两次输入的密码不一致!"));
    },
  });

  return (
    <div className={`${loginFormBox} global-center`}>
      <LoginTitle />
      <Tabs defaultActiveKey="1" centered activeKey={activeKey} onChange={onKeyChange} >
        <TabPane tab="登录" key="1">
          {/* 登录表单 */}
          <Form
            form={loginForm}
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinishLogin}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "请填写邮箱" }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="邮箱"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "请填写密码！" }]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item>
              <div
                className="global-center"
                style={{ justifyContent: "space-between" }}
              >
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>记住账号密码</Checkbox>
                </Form.Item>

                <a className="login-form-forgot" href="">
                  忘记密码？
                </a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={loginFormButton}
                loading={loginStatus}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="注册" key="2">
          {/* 注册表单 */}
          <Form
            name="register"
            onFinish={onFinishRegister}
            validateMessages={validateMessages}
            form={registerForm}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true },
                {
                  pattern: /^[a-zA-Z0-9]{3,}$/,
                  message: "用户名格式不正确!",
                },
              ]}
            >
              <Input prefix={<HomeOutlined />} placeholder="用户名" />
            </Form.Item>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ required: true }, { type: "email" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="邮箱" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true }]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={["password"]}
              hasFeedback
              rules={[
                { required: true, message: "请再次输入密码！" },
                passwordValidator(registerForm),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={loginFormButton}
                loading={registerStatus === 'register'}
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default App;
