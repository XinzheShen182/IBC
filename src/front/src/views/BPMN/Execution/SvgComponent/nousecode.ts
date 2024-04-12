useEffect(() => {
    handleNOTMsg();
}, [eventList, gtwList]);

const fetchNOTMsgLit = async () => {
    try {
        const { data: bpmnInstanceData } = await axios.get("http://127.0.0.1:8000/api/v1/bpmns/1/bpmn-instances/" + bpmnInstanceId);
        // const {data:bpmnData} = await axios.get("http://127.0.0.1:8000/api/v1/consortiums/1/bpmns/" + bpmnInstanceData.bpmn);
        const name = bpmnInstanceData.chaincode_name + bpmnInstanceData.chaincode_id.substring(0, 6);

        const response = await fetch(coreUrl + "/api/v1/namespaces/default/apis/" + name + "/query/GetAllActionEvents", {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const eventFetch = await response.json();
        console.log("eventFetch is " + eventFetch);
        setEventList(eventFetch);
        // filter出msgState为2的消息
        console.log("eventfetchList is " + JSON.stringify(eventFetch));

        const gtwResponse = await fetch(coreUrl + "/api/v1/namespaces/default/apis/" + name + "/query/GetAllGateways", {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const gtwFetch = await gtwResponse.json();
        console.log("gtwFetch is " + gtwFetch);
        setGtwList(gtwFetch);
        console.log("gtwfetchList is " + JSON.stringify(gtwFetch));

    } catch (error) {
        console.error("Error fetching EventList:", error);
    }
}

const handleNOTMsg = async () => {
    const { data: bpmnInstanceData } = await axios.get("http://127.0.0.1:8000/api/v1/bpmns/1/bpmn-instances/" + bpmnInstanceId);
    // const {data:bpmnData} = await axios.get("http://127.0.0.1:8000/api/v1/consortiums/1/bpmns/" + bpmnInstanceData.bpmn);
    const name = bpmnInstanceData.chaincode_name + bpmnInstanceData.chaincode_id.substring(0, 6);
    for (const event of eventList) {
        if (event.eventState == 1) {
            const response = await axios.post(coreUrl + "/api/v1/namespaces/default/apis/" + name + "/invoke/" + event.eventID, {});
            console.log("Response :", response.data);
        }
    }
    for (const gtw of gtwList) {
        if (gtw.gatewayState == 1) {
            const response = await axios.post(coreUrl + "/api/v1/namespaces/default/apis/" + name + "/invoke/" + gtw.gatewayID, {});
            console.log("Response :", response.data);
        }
    }
}

useEffect(() => {
    const initMsgAndData = async () => {
        const { data: bpmnInstanceData } = await axios.get("http://127.0.0.1:8000/api/v1/bpmns/1/bpmn-instances/" + bpmnInstanceId);
        // const {data:bpmnData} = await axios.get("http://127.0.0.1:8000/api/v1/consortiums/1/bpmns/" + bpmnInstanceData.bpmn);
        const name = bpmnInstanceData.chaincode_name + bpmnInstanceData.chaincode_id.substring(0, 6);
        console.log(name, "name");
        const response = await axios.post(coreUrl + `/api/v1/namespaces/default/apis/${name}/invoke/InitLedger`, {});
        console.log("Response :", response.data);

        const msgResponse = await fetch(coreUrl + `/api/v1/namespaces/default/apis/${name}/query/GetAllMessages`, {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        });


        const msgFetch = await msgResponse.json();
        console.log(msgFetch, "msgResponse")
        msgFetch.map((msg) => {
            const data1 = {
                "$id": "https://example.com/widget.schema.json",
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "title": "Widget",
                "type": "object"

            };
            const data2 = JSON.parse(msg.format);
            const mergedData = {
                "name": msg.messageID,
                "version": "1",
                "value": {
                    ...data1,
                    ...data2
                }
            };
            axios.post(coreUrl + "/api/v1/namespaces/default/datatypes", mergedData)
                .then(response => { })
                .catch(error => { console.error(error) });
        })
    }
    initMsgAndData()
}, []);

useEffect(() => {
    fetchMsgList();
    fetchNOTMsgLit();
}, []);

useEffect(() => {
    const current = msgList.find((msg) => msg.msgState === 2 || msg.msgState === 1);
    setCurrentMsg(current);
}, [msgList]);

useEffect(() => {   //根据2状态设置formats
    console.log("currentMsg is " + currentMsg);
    if (currentMsg?.format) {       //暂时未处理required字段
        let tempJson = JSON.parse(currentMsg.format)
        const properties = tempJson.properties
        const propertiesArray = Object.entries(properties)
        const mappedProperties = propertiesArray.map(([propertyName, propertyValue]) => {
            const typedPropertyValue = propertyValue as Property
            return {
                name: propertyName,
                type: typedPropertyValue.type,
            };
        });

        const propertiesFiles = tempJson.files
        const filesArray = Object.entries(propertiesFiles)
        const mappedFiles = filesArray.map(([propertyName, propertyValue]) => {
            const typedPropertyValue = propertyValue as Property
            return {
                name: propertyName,
                type: typedPropertyValue.type,
                // description: typedPropertyValue.description
            };
        });


        setFileFormatParts(mappedFiles)
        setFormatParts(mappedProperties);
    } else {
        // 当currentMsg.format为null, undefined或空字符串时，设置一个默认值或进行其他操作
        setFormatParts([]); // 例如，设置为空数组
    }
}, [currentMsg]);

useEffect(() => {
    const fetchSvg = async () => {
        try {
            // const response = await fetch("/images/my.svg");
            // // console.log(response);
            // const svgText = await response.text();

            const { data: bpmnInstanceData } = await axios.get("http://127.0.0.1:8000/api/v1/bpmns/1/bpmn-instances/" + bpmnInstanceId);
            const { data: bpmnData } = await axios.get("http://127.0.0.1:8000/api/v1/consortiums/1/bpmns/" + bpmnInstanceData.bpmn);
            const svgText = bpmnData.svgContent;

            // console.log(svgText);
            setSvgContent(svgText);
            let styles = { "& svg": {} };
            function updateStylesWithMsgList(msgList) {
                // 确保styles对象的"& svg"属性存在并且是一个对象
                if (!styles["& svg"]) {
                    styles["& svg"] = {};
                }

                // 遍历msgList来更新styles
                msgList.forEach((msg) => {
                    const selector = `& g[data-element-id="${msg.messageID}"]`;
                    styles["& svg"][selector] = {
                        "& path": {
                            fill: `${msg.color} !important`,
                        },
                    };
                });
            }
            updateStylesWithMsgList(msgList);

            const svgElement = svgRef.current;
            if (svgElement) {
                setSvgStyle(styles);
            }
        } catch (error) {
            console.error("Error fetching SVG:", error);
        }
    };
    fetchSvg();
    fetchNOTMsgLit();
}, [msgList]);


const onFinish = async (values) => {
    console.log("Received values from form: ", values);
    const formData = {
        input: values
    };
    try {
        const tempState = currentMsg.msgState;
        let msgInvokeMethod;
        if (tempState === 1) {
            msgInvokeMethod = currentMsg.messageID + "_Send"
        } else if (tempState === 2) {
            msgInvokeMethod = currentMsg.messageID + "_Complete"
        }
        if (msgInvokeMethod) {
            let fileResponseId = null
            if (uploadedFile) {
                const formData = new FormData();
                formData.append('autometa', 'true');
                formData.append('file', uploadedFile);
                axios.post(coreUrl + "/api/v1/namespaces/default/data", {
                    formData
                }).then(response => {
                    console.log("Response :", response.data);
                    fileResponseId = response.data.id
                }).catch(error => { console.log(error) })
            }

            const datatype = {
                name: currentMsg.messageID,
                version: '1'
            };
            const value = formatParts;
            const dataItem1 = {
                datatype: datatype,
                value: value,
                validator: 'json'
            };
            let dataItem2 = null
            if (fileResponseId) {
                dataItem2 = {
                    id: fileResponseId
                }
            }
            const data = {
                data: [dataItem1, dataItem2],
                group: {
                    members: [
                        {
                            identity: Identity
                        }
                    ]
                },
                header: {
                    tag: fileResponseId,
                    topics: [
                        currentMsg.messageID
                    ]
                }
            };
            axios.post(coreUrl + "/api/v1/namespaces/default/messages/private", data)
                .then(response => { console.log(response.data) })
                .catch(error => { console.error(error) });
            const response = await axios.post(coreUrl + "/api/v1/namespaces/default/apis/" + bpmnInstanceId + "/invoke/" + msgInvokeMethod, formData);
            setUploadedFile(null)
            setTimeout(() => fetchMsgList(), 3000);
            fetchNOTMsgLit();
        } else {
            console.log("no message to send or complete!")
        }
    } catch (error) {
        console.error("Error sending form data:", error);
    }
};

const fetchMsgList = async () => {
    try {
        const { data: bpmnInstanceData } = await axios.get("http://127.0.0.1:8000/api/v1/bpmns/1/bpmn-instances/" + bpmnInstanceId);
        // const {data:bpmnData} = await axios.get("http://127.0.0.1:8000/api/v1/consortiums/1/bpmns/" + bpmnInstanceData.bpmn);
        const name = bpmnInstanceData.chaincode_name + bpmnInstanceData.chaincode_id.substring(0, 6);

        const response = await fetch(coreUrl + "/api/v1/namespaces/default/apis/" + name + "/query/GetAllMessages", {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const msgFetch = await response.json();
        console.log("msgFetch is " + msgFetch);
        const updatedMsgList = msgFetch.map((msg) => {
            let color = "";
            switch (msg.msgState) {
                case 0:
                    color = "white";
                    break;
                case 1:
                    color = "green";
                    break;
                case 2:
                    color = "red";
                    break;
                case 3:
                    color = "gray";
                    break;
                default:
                    color = "";
            }
            return { ...msg, color };
        });
        setMsgList(updatedMsgList);
        console.log("updatedMsgList is " + JSON.stringify(updatedMsgList));
    } catch (error) {
        console.error("Error fetching MsgList:", error);
    }
};
