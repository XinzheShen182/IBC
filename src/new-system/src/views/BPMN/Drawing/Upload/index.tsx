import React, { useState } from "react";
import { Modal, Typography, Form, Upload, message, Button, Input } from "antd";
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const UploadBPMN = ({ setUploadOpen, UploadBPMN }) => {
  const [fileList, setFileList] = useState([]);
  const [orgId, setOrgId] = useState("12345"); // 假设这是你的orgId

  const handleOk = () => {
    setUploadOpen(false);
  };

  const handleCancel = () => {
    setUploadOpen(false);
  };

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('orgid', values.orgid || orgId);
    fileList.forEach(file => {
      formData.append('file', file);
    });
    try {
      const response = await fetch('https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        message.success('File uploaded successfully');
      } else {
        message.error('File upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      message.error('File upload failed');
    }
    // 清空文件列表
    setFileList([]);

    handleOk(); // 关闭模态框
  };

  const draggerProps = {
    name: "file",
    multiple: true,
    fileList,
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false; // 阻止自动上传
    },
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
  };

  return (
    <Form onFinish={onFinish}>
      <Modal
        open={UploadBPMN}
        title="Upload BPMN"
        onOk={() => {console.log("hell")}} // 不再直接关闭模态框
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Return
          </Button>,
          <Button key="submit" type="primary" htmlType="submit" onClick={onFinish}>
            Submit
          </Button>,
        ]}
      >
        <Form.Item name="orgid" initialValue={orgId} hidden>
          <Input />
        </Form.Item>
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload. Strictly prohibited from
            uploading company data or other banned files.
          </p>
        </Dragger>
      </Modal>
    </Form>
  );
};

export default UploadBPMN;
