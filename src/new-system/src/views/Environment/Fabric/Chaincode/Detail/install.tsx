import React, { useEffect } from "react";
import { TableProps, Table, Tag, Button, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { usePeerData } from "./hooks";
import { useAppSelector } from "@/redux/hooks";
import { installChaincode, queryInstalledChaincode } from '@/api/resourceAPI';
import { set } from "lodash";


interface Props {
  id: string;
}

interface DataType {
  node: string;
  owner: string;
  status: string;
  installed: boolean;
}

const Status: React.FC<Props> = ({ id }) => {

  const currentEnvId = useAppSelector((state) => state.env.currentEnvId);
  const [peerList, peerDataReady, syncPeerList] = usePeerData(currentEnvId, id);
  const [nodeStatusList, setNodeStatusList] = React.useState([]);
  useEffect(() => {
    if (peerList.length) {
      const list = peerList.map((peer) => {
        return {
          id: peer.id,
          status: "idle"
        };
      });
      setNodeStatusList(list);
    }
  }, [peerList]);

  const setNodeStatus = (nodeId: string, status: string) => {
    setNodeStatusList(nodeStatusList.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          status
        }
      }
      return node;
    }
    ));
  }

  const handleInstallClick = async (nodeId: string) => {
    setNodeStatus(nodeId, "installing");
    try {
      const res = await installChaincode(currentEnvId, nodeId, id);
      message.success(res);
      syncPeerList();
    } catch (e) {
      message.error(e);
    }
    setNodeStatus(nodeId, "idle");
  };
  const currentOrgId = useAppSelector((state) => state.org.currentOrgId);
  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Node",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
      align: "center",
    },
    {
      title: "Installed Status",
      dataIndex: "installed",
      key: "installed",
      align: "center",
      render: (installed, record) => {
        const color = installed ? "success" : "error";
        const icon =
          installed ? (
            <CheckCircleOutlined />
          ) : (
            <CloseCircleOutlined />
          );
        return (
          <Tag color={color} icon={icon} key={installed}>
            {installed}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record: any) => {
        return (record.orgId !== currentOrgId ? null : (
          <Button type="primary" onClick={() => handleInstallClick(record.id)} loading={
            nodeStatusList.find((node) => node.id === record.id)?.status === "installing"
          } >
            Install
          </Button>))
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={peerList}
      pagination={{ pageSize: 50 }}
      scroll={{ y: 320 }}
      loading={!peerDataReady}
    />
  );
};

export default Status;
