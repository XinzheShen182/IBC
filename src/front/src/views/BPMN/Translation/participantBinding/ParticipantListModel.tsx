import React, { useState } from 'react';
import { Card, Row, Col, Button, Typography, Steps, Modal, TableProps, Table, Select, Input, Tag,List } from "antd"
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import { useParticipantsData, useAvailableMembers, useBPMNBindingData } from "../Detail/hooks"

const ParticipantList = ({ bpmnId ,open,setOpen}) => {
  const [modalActive, setModalActive] = useState(false);
  const [showUserSection, setShowUserSection] = useState(true);
  const [showMspSection, setShowMspSection] = useState(false);
  const [showAttributeSection, setShowAttributeSection] = useState(false);
  const currentEnvId = useAppSelector((state) => state.env.currentEnvId);
  const handleParticipantClick = () => { setModalActive(true); };
  const handleAddRow = () => { const newRows = [...attrRows, { attrName: '', equalValue: '' }]; setAttrRows(newRows); };
  const [validationType, setValidationType] = useState("相等");
  const handleValidationTypeChange = (value,evt) => {
    setValidationType(value);
    if (evt.children=="一类") {
      setShowUserSection(false);
      setShowMspSection(true);
      setShowAttributeSection(true);
    } else {
      setShowUserSection(true);
      setShowMspSection(false);
      setShowAttributeSection(false);
    }
  };
 



  const [attrRows, setAttrRows] = useState([{ attrName: '', equalValue: '' }]);
  const [MSP,setMSP] = useState("");
  const handleModalClose = () => {
    setModalActive(false);
  };

  const handleParticipantListSubmit = () => {
    
  };

  const [participants, syncParticipants] = useParticipantsData(bpmnId)
  const [members, syncMembers] = useAvailableMembers(currentEnvId)
  const participants1 = participants.map((a) => { return <List.Item onClick={handleParticipantClick}>{a.name}</List.Item> })
  return (
    <Modal
      title="参与方列表"
      onOk={() => {handleParticipantListSubmit()}}
      okText="确认"
      open={open}
      onCancel={() => setOpen(false)}
    >
    <div>
      <List className="participant-list">{participants1}</List>
      {modalActive && (
        <Card>
        <div className="modal">
          <div className="modal-header">绑定参与方</div>
          <div className="modal-body">
            <label htmlFor="validationSelect">选择校验方式:</label>
            <Select id="validationSelect" value={validationType} onChange={handleValidationTypeChange}>
              <Select.Option value="equal">相等</Select.Option>
              <Select.Option value="type">一类</Select.Option>
            </Select>
            <br /><br />
            {showUserSection && (
              <div>
                <label htmlFor="userSelect">选择用户:</label>
                <Select
                  style={{ width: "100%" }}
                  defaultValue=""
                  onChange={(value) => {
                    setMSP(value)
                  }}
                >
                  {
                    members.map((member) => {
                      return (
                        <Select.Option value={member.membershipName} key={member.membershipId}>
                          {member.membershipName}
                        </Select.Option>
                      )
                    })
                  }
                </Select>
                <br /><br />
              </div>
            )}
            {showMspSection && (
              <div>
                <label htmlFor="mspSelect">选择MSP (可选):</label>

                <Select
                  style={{ width: "100%" }}
                  defaultValue=""
                  onChange={(value) => {
                    setMSP(value)
                  }}
                >
                  {
                    members.map((member) => {
                      return (
                        <Select.Option value={member.membershipName} key={member.membershipId}>
                          {member.membershipName}
                        </Select.Option>
                      )
                    })
                  }
                </Select>
              </div>
            )}
            {showAttributeSection && (
              <div>
                <table className="attr-table">
                  <thead>
                    <tr>
                      <th>Attr name</th>
                      <th>Equal value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attrRows.map((row, index) => (
                      <tr key={index}>
                        <td><input type="text" name="attrName[]" /></td>
                        <td><input type="text" name="equalValue[]" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button className="add-row-btn" onClick={handleAddRow}>添加一行</Button>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <Button onClick={handleModalClose}>关闭</Button>
          </div>
        </div>
      </Card>
      )}
    </div>
  </Modal>
  );
};

export default ParticipantList;

//TODO:是不是应该加个"确定"按钮,以及处理逻辑？