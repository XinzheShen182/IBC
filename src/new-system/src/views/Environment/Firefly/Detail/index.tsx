import React from "react";
import { Button, Card, Col, Row, Typography } from "antd";
import { useParams } from "react-router-dom";

const { Text } = Typography;
const { Meta } = Card;
import { useAppSelector } from "@/redux/hooks";
import { useFireflyDetail } from "./hooks";

// import Png from assets

import FireFlySwagger from "@/assets/FireFlySwagger.png"
import FireFlySandbox from "@/assets/FireflySandbox.png"
import FireFlyExplorer from "@/assets/FireflyExplorer.png"

const Detail: React.FC = () => {
    const params = useParams();
    const currentEnvId = useAppSelector((state) => state.env.currentEnvId);
    const [fireflyData, fireflyDataReady, setSync] = useFireflyDetail(
        currentEnvId,
        params.id
    );

    const detailList = {
        Name: fireflyData.name,
        ID: fireflyData.id,
        Status: "Live",
        "Created Time": "2023/2/1 20:50:23",
        "Web UI Endpoint": `${fireflyData.coreURL}/ui`,
        "Sandbox UI Endpoint": `${fireflyData.sandboxURL}`,
    };

    const detailItem = Object.entries(detailList).map(([key, value], index) => (
        <Card.Grid key={key} style={{ width: "100%" }}>
            <Row>
                <Col span={12}>
                    <Text strong>{key}</Text>
                </Col>
                <Col span={12}>
                    <Text>{value}</Text>
                </Col>
            </Row>
        </Card.Grid>
    ));

    return (
        <div>
            <Row gutter={16} style={{ width: "100%", margin: 0 }}>
                <Col
                    xs={24}
                    sm={18}
                    md={18}
                    lg={18}
                    xl={18}
                    style={{ display: "flex", marginBottom: 16 }}
                >
                    <Card
                        title="FireFly Node"
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                        loading={!fireflyDataReady}
                    >
                        {detailItem}
                    </Card>
                </Col>
                <Col xs={24}
                    sm={6}
                    md={6}
                    lg={6}
                    xl={6}
                    style={{ display: "flex", marginBottom: 16 }}>
                    <Card
                        title="FireFly Swagger API"
                        hoverable
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            height: "500px",
                        }}
                        cover={
                            <img
                                alt="example"
                                src={FireFlySwagger}
                                style={{
                                    width: "80%",
                                    display: "block", // 设置display为block
                                    margin: "0 auto", // 上下边距为0，左右自动，实现居中
                                    maxHeight: "100%", // 可选，确保图片不超过Card高度
                                }}
                            />
                        }
                    >
                        <Meta title=""
                            description="View the API documentation for this FireFly node and try sending API requests using Swagger." />
                        <div style={{ flex: 1 }}></div>
                        <Button
                            type="primary"
                            style={{ position: "absolute", bottom: "20px", left: "20px" }}
                            onClick={() => window.open(
                                "http://" + fireflyData.coreURL + "/api"
                                , "_blank")}
                        >
                            Click Me
                        </Button>
                    </Card>
                </Col>


            </Row>

            <Row gutter={16}>
                <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                    <Card
                        title="Firefly Sandbox"
                        hoverable
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            height: "450px",
                        }}
                        cover={
                            <img
                                alt="example"
                                src={FireFlySandbox}
                                style={{
                                    width: "80%",
                                    display: "block",
                                    margin: "0 auto",
                                    height: "300px",
                                }}
                            />
                        }
                    >
                        <Meta title=""
                            description="Open the Sandbox to explore and exercise FireFly features such as Messaging, Tokens and Contracts." />
                        <div style={{ flex: 1 }}></div>
                        <Button
                            type="primary"
                            style={{ position: "absolute", bottom: "20px", left: "20px" }}
                            onClick={() => window.open("http://" + fireflyData.sandboxURL, "_blank")}
                        >
                            Click Me
                        </Button>
                    </Card>
                </Col>
                <Col
                    xs={24} sm={8} md={8} lg={8} xl={8}
                >

                    <Card
                        title="Firefly Explorer"
                        hoverable
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            height: "450px",
                        }} // Set Card to relative positioning
                        cover={
                            <img
                                alt="example"
                                src={FireFlyExplorer}
                                style={{
                                    width: "80%",
                                    display: "block", // 设置display为block
                                    margin: "0 auto", // 上下边距为0，左右自动，实现居中
                                    height: "300px",
                                }}
                            />
                        }
                    >
                        <Meta title=""
                            description="View messages, data and blockchain transactions between nodes and members of your network." />
                        <div style={{ flex: 1 }}></div>
                        <Button
                            type="primary"
                            style={{ position: "absolute", bottom: "20px", left: "20px" }}
                            onClick={() => window.open("http://" + fireflyData.coreURL + '/ui', "_blank")}
                        >
                            Click Me
                        </Button>
                    </Card>
                </Col>


            </Row>
        </div>
    );
};

export default Detail;
