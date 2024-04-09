import React, { useState } from 'react';
import { Input, Button, Table, Tag } from 'antd';
import JSZip from 'jszip';

const TestComponent = ({
    bpmn, bpmnInstance, testFunction, columns,
}) => {
    const [records, setRecords] = useState([]);
    const [testTimes, setTestTimes] = useState(1);
    const [currentTimes, setCurrentTimes] = useState(0);

    const testTheTime = async (times, func) => {
        let records = [];
        setCurrentTimes(0)
        for (let i = 0; i < times; i++) {
            const record = await func();
            records.push({ index: i + 1, ...record });
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            }
            )
            setCurrentTimes(i + 1);
        }
        setRecords(records);
    }

    const exportRecords = () => {

        const chaincode = bpmnInstance.chaincode_content
        const bpmnContent = bpmn.bpmnContent

        // generate csv depends on columns
        const header = columns.map((item) => {
            return item.title;
        }
        ).join(",");
        var csvContent = header;
        records.forEach((record) => {
            csvContent
                += "\n" + columns.map((item) => {
                    return record[item.dataIndex];
                }
                ).join(",");
        });

        // zipTogeter
        const zip = new JSZip();
        zip.file("chaincode.go", chaincode);
        zip.file("bpmn.bpmn", bpmnContent);
        zip.file("records.csv", csvContent);
        zip.generateAsync({ type: "blob" }).then((content) => {
            var a = document.createElement('a');
            document.body.appendChild(a);
            var url = window.URL.createObjectURL(content);
            a.href = url;
            a.download = bpmn.name + bpmnInstance.name + "_records.zip";
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    return (
        <div style={{
            marginTop: "10px"
        }} >
            <Input placeholder="Test Times" onChange={(e) => { setTestTimes(parseInt(e.target.value)) }} />
            <div
                style={{ marginTop: '10px' }}
            > <Button
                style={{ backgroundColor: 'yellow' }}
                onClick={() => {
                    testTheTime(testTimes, testFunction);
                }}
            >Test </Button>
                <Button
                    style={{ backgroundColor: "pink", marginLeft: "10px" }}
                    onClick={
                        exportRecords
                    }
                >Export</Button>
                {/* 进度条n/times */}
                <div>
                    <Tag color="blue">Progress: {currentTimes}/{testTimes}</Tag>
                </div>

            </div>

            <Table
                columns={columns}
                dataSource={
                    records
                }
            />
        </div>
    )

}

export default TestComponent;