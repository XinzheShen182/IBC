import { useEffect, useRef } from "react";
import { Divider, Input, Select, Space, Upload, message } from "antd";

import { useState } from 'react';
import { Button } from 'antd';
import TextArea from "antd/es/input/TextArea";
import { getAllMessages, registerDataType, initLedger, invokeEventAction, invokeMessageAction, fireflyDataTransfer, fireflyFileTransfer, getFireflyData } from "@/api/executionAPI"
import { useAvailableMembers, useBPMNIntanceDetailData, useFireflyData } from "../hooks";
import { useAppSelector } from "@/redux/hooks";
import { useAllFireflyData, useBPMNDetailData } from "@/views/BPMN/Execution/SvgComponent/hook";
import { getFireflyWithMSP } from "@/api/externalResource";
import type { InputRef } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const TestModal = ({
  envId, bpmnInstanceId
}) => {
  const currentOrgId = useAppSelector((state) => state.org.currentOrgId);
  const [members, syncMembers] = useAvailableMembers(envId);

  const [currentMembership, setCurrentMembership] = useState<any>({
    membershipId: "",
    membershipName: "",
    resourceSetId: "",
    msp: "",
  })

  useEffect(() => {
    // 当 members 变化时更新 currentMembership
    if (members.length > 0) {
      const firstMember = members[0];
      setCurrentMembership({
        membershipId: firstMember.membershipId,
        membershipName: firstMember.membershipName,
        resourceSetId: firstMember.resourceSetId,
        msp: firstMember.msp,
      });
    }
  }, [members]); // 监听 members 变化\

  const [fireflyData, syncFlag] = useFireflyData(
    envId,
    currentOrgId,
    currentMembership.membershipId
  );

  const coreURL = fireflyData ? 'http://' + fireflyData.coreURL : "";

  const [instance, instanceReady] = useBPMNIntanceDetailData(bpmnInstanceId);
  const [bpmnData, bpmnReady, syncBpmn] = useBPMNDetailData(instance.bpmn);
  const contractName = instanceReady && Object.keys(instance).length !== 0 ? instance.chaincode_name + instance.chaincode_id.substring(0, 6) : "";
  const [allEvents, allGateways, allMessages, fireflyDataReady, syncFireflyData] = useAllFireflyData(coreURL, contractName);
  const currentElements = [...allMessages, ...allEvents, ...allGateways].filter((msg) => {
    return msg.state === 1 || msg.state === 2;
  })

  const onInit = async () => {
    invokeEventAction(coreURL, contractName, "Event_1stkt8g");
  }

  const [messageDurations, setMessageDurations] = useState({
    fileUploadDuration: null,
    priMsgDuration: null,
    msgSendDuration: null
  });

  useEffect(() => {
    if (!messageDurations.priMsgDuration || !messageDurations.msgSendDuration) return;
    // console.log("messageDurations", messageDurations);
    addLine(`File Upload Duration: ${messageDurations.fileUploadDuration ? messageDurations.fileUploadDuration.toFixed(4) : 0}ms` + "\t" +
      `Private Message Duration: ${messageDurations.priMsgDuration ? messageDurations.priMsgDuration.toFixed(4) : 0}ms` + "\t"
      + `Message Send Duration: ${messageDurations.msgSendDuration ? messageDurations.msgSendDuration.toFixed(4) : 0}ms` +
      "\t" + `Total_time: ${(messageDurations.fileUploadDuration + messageDurations.priMsgDuration + messageDurations.msgSendDuration).toFixed(4)}ms` + "\n")
  }, [messageDurations]);

  const [textareaValue, setTextareaValue] = useState('');

  const addLine = (newLine) => {
    setTextareaValue(prevValue => prevValue === '' ? newLine : prevValue + '\n' + newLine);
  };

  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(false);
  const [placeholder, setPlaceholder] = useState('请输入测试轮次');
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Select related
  const defaultItems = [{ "key": '无文件', "value": 0 }, { "key": '1MB', "value": 1 }, { "key": '5MB', "value": 5 }, { "key": '10MB', "value": 10 }];
  const [items, setItems] = useState(defaultItems);
  const [key, setKey] = useState('无文件');
  const inputRef = useRef<InputRef>(null);
  const [selectInputError, setSelectInputError] = useState(false);

  const onKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKey(event.target.value);
  };

  const onKeySelectChange = (value: string) => {
    console.log("value", value);
    setKey(value);
  }

  const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    if (!/^[0-9]+MB$/.test(key)) {
      setSelectInputError(true);
      return;
    }
    setItems([...items, { "key": key, "value": parseInt(key.split('MB')[0]) }]);
    setKey('无文件');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // 清除 textareaValue 的值
  useEffect(() => {
    setTextareaValue('');
    setInputValue(''); // 清空输入框
    setInputError(false); // 清除错误状态
    setPlaceholder('请输入测试轮次'); // 重置 placeholder
    setSelectInputError(false); // 清除选择框错误状态
    setKey('无文件'); // 清空选择框输入框
    setItems(defaultItems); // 重置选择框选项
  }, []);

  const onBeginFirefly = async () => {
    setTextareaValue('');
    setKey('无文件');
    const intValue = parseInt(inputValue, 10);
    if (isNaN(intValue)) {
      // 如果无法转换为整数，显示错误消息
      setInputError(true); // 设置错误状态为true
      setPlaceholder('请输入有效的数字');
    }
    // build current element param
    for (let i = 0; i < intValue; i++) {
      var { data, currentElement, fileUploadDuration } = await buildParam();
      // send private message
      let startTime = performance.now();
      const res = await fireflyDataTransfer(coreURL, data);
      const fireflyMessageID = res.header.id;
      let endTime = performance.now();
      const priMsgDuration = endTime - startTime;
      // BPMN message_send
      startTime = performance.now();
      await invokeMessageAction(coreURL, contractName, currentElement.messageID + "_Send", {
        "input": {
          "fireflyTranID": fireflyMessageID,
        }
      });
      endTime = performance.now();
      const msgSendDuration = endTime - startTime;
      setMessageDurations({
        fileUploadDuration,
        priMsgDuration,
        msgSendDuration
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    async function buildParam() {
      let currentElement = currentElements[0];
      console.log("currentElement", currentElement.messageID);
      // send private message
      const msp = currentElement.receiveMspID;
      const mspData = await getFireflyWithMSP(msp);
      const Identity = "did:firefly:org/" + mspData.data.org_name;

      // 1. check type
      // 2. upload file if exists
      let file_ids = [];
      const item = items.find((item) => item.key === key);
      let fileSize = item.value;
      let fileUploadStartTime;
      let fileUploadEndTime
      if (fileSize > 0) {
        const fileObject = generateRandomFile(fileSize);
        fileUploadStartTime = performance.now();
        const res = await fireflyFileTransfer(coreURL, fileObject);
        file_ids.push(res.id);
        fileUploadEndTime = performance.now();
        fileUploadDuration = fileUploadEndTime - fileUploadStartTime;
      }

      // // 3. send firefly message if exists
      const datatype = {
        name: bpmnData.name + "_" + currentElement.messageID,
        version: '1'
      };

      const transValue = (key, value) => {
        if (format.properties[key].type === "string") return value;
        if (format.properties[key].type === "number") return parseInt(value);
        if (format.properties[key].type === "boolean") return value === "true";
      };

      let format = JSON.parse(currentElement.format);
      let value = {};
      const properties = format.properties;
      for (let key in properties) {
        let randomValue;
        if (properties[key].type === "string") {
          randomValue = generateRandomString(20);
        } else if (properties[key].type === "number") {
          randomValue = Math.floor(Math.random() * 100);
        } else if (properties[key].type === "boolean") {
          randomValue = true;
        }
        value[key] = transValue(key, randomValue);
      }

      const dataItem1 = {
        datatype: datatype,
        value: value,
        validator: 'json'
      };
      let dataItem2 = file_ids.map(
        (id) => {
          return {
            id: id
          };
        }
      );
      const data = {
        data: [dataItem1, ...dataItem2],
        group: {
          members: [
            {
              identity: Identity
            }
          ]
        },
        header: {
          tag: "private",
          topics: [
            bpmnData.name + "_" + currentElement.messageID
          ]
        }
      };
      return { data, currentElement, fileUploadDuration };
    }
  }

  function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  function generateRandomFile(sizeInMB) {
    function generateRandomString(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    }

    const sizeInBytes = sizeInMB * 1024 * 1024;
    const randomString = generateRandomString(sizeInBytes);
    const blob = new Blob([randomString], { type: 'text/plain' });
    const file = new File([blob], `randomFile_${sizeInMB}MB.txt`, { type: 'text/plain' });
    return file;
  }

  function fileToBase64(file): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // 移除 data:image/jpeg;base64, 或类似的前缀
        resolve(base64String);
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsDataURL(file);
    });
  }

  const onBeginFabric = async () => {
    setTextareaValue('');
    setKey('无文件');
    const intValue = parseInt(inputValue, 10);
    if (isNaN(intValue)) {
      // 如果无法转换为整数，显示错误消息
      setInputError(true); // 设置错误状态为true
      setPlaceholder('请输入有效的数字');
    }
    // build current element param
    for (let i = 0; i < intValue; i++) {
      let currentElement = currentElements[0];
      console.log("currentElement", currentElement.messageID);
      const item = items.find((item) => item.key === key);
      let fileSize = item.value;
      let fireflyMessageID = generateRandomString(20);
      // generate random file
      if (fileSize > 0) {
        const fileObject = generateRandomFile(fileSize);
        fireflyMessageID = await fileToBase64(fileObject);
      }
      let startTime = performance.now();
      // BPMN message_send
      await invokeMessageAction(coreURL, contractName, currentElement.messageID + "_Send", {
        "input": {
          "fireflyTranID": fireflyMessageID,
        }
      });
      let endTime = performance.now();
      const msgSendDuration = endTime - startTime;
      setMessageDurations({
        fileUploadDuration: null,
        priMsgDuration: null,
        msgSendDuration: msgSendDuration
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }


  return (
    <>
      <Button type="primary" style={{ "marginLeft": '20px' }} onClick={() => { onInit(); }}>
        Init
      </Button>
      <Button type="primary" style={{ "marginLeft": '20px' }} onClick={() => { onBeginFabric(); }}>
        Begin Fabric Test
      </Button>
      <Button type="primary" style={{ "marginLeft": '20px' }} onClick={() => { onBeginFirefly(); }}>
        Begin Firefly Test
      </Button>
      <Input
        style={{ "marginLeft": '20px', "width": 150 }}
        onChange={handleInputChange}
        placeholder={placeholder}
        value={inputValue}
        status={inputError ? "error" : ""} />
      <Select
        style={{ "marginLeft": '20px', "width": 250 }}
        placeholder="选择测试文件大小"
        onChange={onKeySelectChange}
        value={key}
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space style={{ padding: '0 8px 4px' }}>
              <Input
                placeholder="自定义文件大小"
                ref={inputRef}
                value={key}
                status={selectInputError ? "error" : ""}
                onChange={onKeyChange}
                onKeyDown={(e) => e.stopPropagation()}
              />
              <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                Add item
              </Button>
            </Space>
          </>
        )}
        options={items.map((item) => ({ label: item.key, value: item.key }))}
      />
      <TextArea rows={30} autoSize={{ minRows: 30, maxRows: 30 }} style={{ "marginTop": '20px' }} value={textareaValue} />
    </>
  );
};

export default TestModal;