import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const { Link } = Typography

interface Props {
  onDelete: () => void;
}

const DelFireflyNode: React.FC<Props> = ({ onDelete }) => {
  const handleOk = () => {
    onDelete();
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: 'Delete Node',
      icon: <ExclamationCircleFilled />,
      content: 'Are you sure you want to delete the Node?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: handleOk,
    });
  };

  return (
    <Link type="danger" onClick={showDeleteConfirm} strong>
      DELETE NODE
    </Link>
  );
};

export default DelFireflyNode;
