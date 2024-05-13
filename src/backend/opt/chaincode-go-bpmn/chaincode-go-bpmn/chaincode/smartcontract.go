package chaincode

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"strings"
)

// SmartContract provides functions for managing an Asset
type SmartContract struct {
	contractapi.Contract
	currentMemory StateMemory
}

type ElementState int

const (
	DISABLE = iota
	ENABLE
	WAITFORCONFIRM
	DONE
)

type Message struct {
	MessageID     string       `json:"messageID"`
	SendMspID     string       `json:"sendMspID"`
	ReceiveMspID  string       `json:"receiveMspID"`
	FireflyTranID string       `json:"fireflyTranID"`
	MsgState      ElementState `json:"msgState"`
	Format        string       `json:"format"`
}

type Gateway struct {
	GatewayID    string       `json:"gatewayID"`
	GatewayState ElementState `json:"gatewayState"`
}

type ActionEvent struct {
	EventID    string       `json:"eventID"`
	EventState ElementState `json:"eventState"`
}

type StateMemory struct { 
	avaliable		bool		`json:"avaliable"`
	avaliable1		bool		`json:"avaliable1"`
}

func (cc *SmartContract) CreateMessage(ctx contractapi.TransactionContextInterface, messageID string, sendMspID string, receiveMspID string, fireflyTranID string, msgState ElementState, format string) (*Message, error) {
	stub := ctx.GetStub()

	// 检查是否存在具有相同ID的记录
	existingData, err := stub.GetState(messageID)
	if err != nil {
		return nil, fmt.Errorf("获取状态数据时出错: %v", err)
	}
	if existingData != nil {
		return nil, fmt.Errorf("消息 %s 已存在", messageID)
	}

	// 创建消息对象
	msg := &Message{
		MessageID:     messageID,
		SendMspID:     sendMspID,
		ReceiveMspID:  receiveMspID,
		FireflyTranID: fireflyTranID,
		MsgState:      msgState,
		Format:      format,
	}

	// 将消息对象序列化为JSON字符串并保存在状态数据库中
	msgJSON, err := json.Marshal(msg)
	if err != nil {
		return nil, fmt.Errorf("序列化消息数据时出错: %v", err)
	}
	err = stub.PutState(messageID, msgJSON)
	if err != nil {
		return nil, fmt.Errorf("保存消息数据时出错: %v", err)
	}

	return msg, nil
}

func (cc *SmartContract) CreateGateway(ctx contractapi.TransactionContextInterface, gatewayID string, gatewayState ElementState) (*Gateway, error) {
	stub := ctx.GetStub()

	// 检查是否存在具有相同ID的记录
	existingData, err := stub.GetState(gatewayID)
	if err != nil {
		return nil, fmt.Errorf("获取状态数据时出错: %v", err)
	}
	if existingData != nil {
		return nil, fmt.Errorf("网关 %s 已存在", gatewayID)
	}

	// 创建网关对象
	gtw := &Gateway{
		GatewayID:    gatewayID,
		GatewayState: gatewayState,
	}

	// 将网关对象序列化为JSON字符串并保存在状态数据库中
	gtwJSON, err := json.Marshal(gtw)
	if err != nil {
		return nil, fmt.Errorf("序列化网关数据时出错: %v", err)
	}
	err = stub.PutState(gatewayID, gtwJSON)
	if err != nil {
		return nil, fmt.Errorf("保存网关数据时出错: %v", err)
	}

	return gtw, nil
}

func (cc *SmartContract) CreateActionEvent(ctx contractapi.TransactionContextInterface, eventID string, eventState ElementState) (*ActionEvent, error) {
	stub := ctx.GetStub()

	// 创建ActionEvent对象
	actionEvent := &ActionEvent{
		EventID:    eventID,
		EventState: eventState,
	}

	// 将ActionEvent对象序列化为JSON字符串并保存在状态数据库中
	actionEventJSON, err := json.Marshal(actionEvent)
	if err != nil {
		return nil, fmt.Errorf("序列化事件数据时出错: %v", err)
	}
	err = stub.PutState(eventID, actionEventJSON)
	if err != nil {
		return nil, fmt.Errorf("保存事件数据时出错: %v", err)
	}

	return actionEvent, nil
}

// Read function
func (c *SmartContract) ReadMsg(ctx contractapi.TransactionContextInterface, messageID string) (*Message, error) {
	msgJSON, err := ctx.GetStub().GetState(messageID)
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}

	if msgJSON == nil {
		errorMessage := fmt.Sprintf("Message %s does not exist", messageID)
		fmt.Println(errorMessage)
		return nil, errors.New(errorMessage)
	}

	var msg Message
	err = json.Unmarshal(msgJSON, &msg)
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}

	return &msg, nil
}

func (c *SmartContract) ReadGtw(ctx contractapi.TransactionContextInterface, gatewayID string) (*Gateway, error) {
	gtwJSON, err := ctx.GetStub().GetState(gatewayID)
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}

	if gtwJSON == nil {
		errorMessage := fmt.Sprintf("Gateway %s does not exist", gatewayID)
		fmt.Println(errorMessage)
		return nil, errors.New(errorMessage)
	}

	var gtw Gateway
	err = json.Unmarshal(gtwJSON, &gtw)
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}

	return &gtw, nil
}

func (c *SmartContract) ReadEvent(ctx contractapi.TransactionContextInterface, eventID string) (*ActionEvent, error) {
	eventJSON, err := ctx.GetStub().GetState(eventID)
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}

	if eventJSON == nil {
		errorMessage := fmt.Sprintf("Event state %s does not exist", eventID)
		fmt.Println(errorMessage)
		return nil, errors.New(errorMessage)
	}

	var event ActionEvent
	err = json.Unmarshal(eventJSON, &event)
	if err != nil {
		fmt.Println(err.Error())
		return nil, err
	}

	return &event, nil
}

// Change State  function
func (c *SmartContract) ChangeMsgState(ctx contractapi.TransactionContextInterface, messageID string, msgState ElementState) error {
	stub := ctx.GetStub()

	msg, err := c.ReadMsg(ctx, messageID)
	if err != nil {
		return err
	}

	msg.MsgState = msgState

	msgJSON, err := json.Marshal(msg)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	err = stub.PutState(messageID, msgJSON)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	return nil
}

func (c *SmartContract) ChangeGtwState(ctx contractapi.TransactionContextInterface, gatewayID string, gtwState ElementState) error {
	stub := ctx.GetStub()

	gtw, err := c.ReadGtw(ctx, gatewayID)
	if err != nil {
		return err
	}

	gtw.GatewayState = gtwState

	gtwJSON, err := json.Marshal(gtw)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	err = stub.PutState(gatewayID, gtwJSON)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	return nil
}

func (c *SmartContract) ChangeEventState(ctx contractapi.TransactionContextInterface, eventID string, eventState ElementState) error {
	stub := ctx.GetStub()

	actionEvent, err := c.ReadEvent(ctx, eventID)
	if err != nil {
		return err
	}

	actionEvent.EventState = eventState

	actionEventJSON, err := json.Marshal(actionEvent)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	err = stub.PutState(eventID, actionEventJSON)
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	return nil
}

//get all message

func (cc *SmartContract) GetAllMessages(ctx contractapi.TransactionContextInterface) ([]*Message, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("获取状态数据时出错: %v", err) //直接err也行
	}
	defer resultsIterator.Close()

	var messages []*Message
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("迭代状态数据时出错: %v", err)
		}

		var message Message
		err = json.Unmarshal(queryResponse.Value, &message)
		if strings.HasPrefix(message.MessageID, "Message") {
			if err != nil {
				return nil, fmt.Errorf("反序列化消息数据时出错: %v", err)
			}

			messages = append(messages, &message)
		}
	}

	return messages, nil
}

func (cc *SmartContract) GetAllGateways(ctx contractapi.TransactionContextInterface) ([]*Gateway, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("获取状态数据时出错: %v", err) 
	}
	defer resultsIterator.Close()

	var gateways []*Gateway
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("迭代状态数据时出错: %v", err)
		}

		var gateway Gateway
		err = json.Unmarshal(queryResponse.Value, &gateway)
		if strings.HasPrefix(gateway.GatewayID, "ExclusiveGateway") ||
			strings.HasPrefix(gateway.GatewayID, "EventBasedGateway") ||
			strings.HasPrefix(gateway.GatewayID, "Gateway") ||
			strings.HasPrefix(gateway.GatewayID, "ParallelGateway") {
			if err != nil {
				return nil, fmt.Errorf("反序列化网关数据时出错: %v", err)
			}

			gateways = append(gateways, &gateway)
		}
	}

	return gateways, nil
}

func (cc *SmartContract) GetAllActionEvents(ctx contractapi.TransactionContextInterface) ([]*ActionEvent, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, fmt.Errorf("获取状态数据时出错: %v", err)
	}
	defer resultsIterator.Close()

	var events []*ActionEvent
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("迭代状态数据时出错: %v", err)
		}

		var event ActionEvent
		err = json.Unmarshal(queryResponse.Value, &event)
		if strings.HasPrefix(event.EventID, "StartEvent") ||
			strings.HasPrefix(event.EventID, "Event") ||
			strings.HasPrefix(event.EventID, "EndEvent") {
			if err != nil {
				return nil, fmt.Errorf("反序列化事件数据时出错: %v", err)
			}

			events = append(events, &event)
		}
	}

	return events, nil
}


// InitLedger adds a base set of elements to the ledger

var isInited bool = false

func (cc *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	if isInited {
		errorMessage := "Chaincode has already been initialized"
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.CreateActionEvent(ctx, "Event_16uiyr1", ENABLE)
	cc.CreateGateway(ctx, "Gateway_19q1cw1", DISABLE)
	cc.CreateMessage(ctx, "Message_0mxcypj", "Old.org.comMSP", "Community-cons1.org.comMSP", "", DISABLE, "{\"properties\":{\"username\":{\"type\":\"string\",\"description\":\"null\"},\"password\":{\"type\":\"string\",\"description\":\"null\"}},\"required\":[\"username\",\"password\"],\"files\":{},\"file required\":[]}")
	cc.CreateMessage(ctx, "Message_0jtzudl", "Community-cons1.org.comMSP", "Old.org.comMSP", "", DISABLE, "{\"properties\":{\"avaliable1\":{\"type\":\"boolean\",\"description\":\"null\"}},\"required\":[\"avaliable1\"],\"files\":{},\"file required\":[]}")
	cc.CreateGateway(ctx, "Gateway_1besdco", DISABLE)
	cc.CreateMessage(ctx, "Message_1ewhu0n", "Old.org.comMSP", "Community-cons1.org.comMSP", "", DISABLE, "{\"properties\":{\"OrderItems\":{\"type\":\"json\",\"description\":\"null\"}},\"required\":[\"OrderItems\"],\"files\":{},\"file required\":[]}")
	cc.CreateMessage(ctx, "Message_10ebhc9", "Community-cons1.org.comMSP", "Old.org.comMSP", "", DISABLE, "{\"properties\":{\"avaliable\":{\"type\":\"boolean\",\"description\":\"null\"}},\"required\":[\"avaliable\"],\"files\":{},\"file required\":[]}")
	cc.CreateGateway(ctx, "Gateway_07s97pf", DISABLE)
	cc.CreateActionEvent(ctx, "Event_0ybmmsp", DISABLE)
	cc.CreateGateway(ctx, "Gateway_15pbpw2", DISABLE)
	cc.CreateMessage(ctx, "Message_0lnoc3k", "Old.org.comMSP", "Community-cons1.org.comMSP", "", DISABLE, "{\"properties\":{\"oid\":{\"type\":\"number\",\"description\":\"null\"},\"orderid\":{\"type\":\"number\",\"description\":\"null\"}},\"required\":[\"oid\",\"orderid\"],\"files\":{},\"file required\":[]}")
	cc.CreateMessage(ctx, "Message_0v5avaw", "Community-cons1.org.comMSP", "Old.org.comMSP", "", DISABLE, "{\"properties\":{\"info1\":{\"type\":\"string\",\"description\":\"null\"}},\"required\":[\"info1\"],\"files\":{},\"file required\":[]}")
	cc.CreateMessage(ctx, "Message_18evq7c", "Old.org.comMSP", "Community-cons1.org.comMSP", "", DISABLE, "{\"properties\":{\"oid\":{\"type\":\"number\",\"description\":\"null\"},\"orderid\":{\"type\":\"number\",\"description\":\"null\"},\"totalprice\":{\"type\":\"number\",\"description\":\"null\"}},\"required\":[\"oid\",\"orderid\",\"totalprice\"],\"files\":{},\"file required\":[]}")
	cc.CreateMessage(ctx, "Message_09r9nyg", "Community-cons1.org.comMSP", "Old.org.comMSP", "", DISABLE, "{\"properties\":{\"info2\":{\"type\":\"string\",\"description\":\"null\"}},\"required\":[],\"files\":{},\"file required\":[]}")
	cc.CreateActionEvent(ctx, "Event_038yxf2", DISABLE)
	cc.CreateActionEvent(ctx, "Event_0kc2s00", DISABLE)

	isInited = true

	stub.SetEvent("initContractEvent", []byte("Contract has been initialized successfully"))
	return nil
}
func (cc *SmartContract) Event_16uiyr1(ctx contractapi.TransactionContextInterface) error { 
	stub := ctx.GetStub()
	actionEvent, err := cc.ReadEvent(ctx, "Event_16uiyr1")
	if err != nil {
		return err
	}

	if actionEvent.EventState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", actionEvent.EventID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeEventState(ctx, "Event_16uiyr1", DONE)
	stub.SetEvent("Event_16uiyr1", []byte("Contract has been started successfully"))

	cc.ChangeGtwState(ctx, "Gateway_19q1cw1", ENABLE)
	return nil
}

func (cc *SmartContract) Gateway_19q1cw1(ctx contractapi.TransactionContextInterface) error { 
	stub := ctx.GetStub()
	gtw, err := cc.ReadGtw(ctx, "Gateway_19q1cw1")
	if err != nil {
		return err
	}

	if gtw.GatewayState != ENABLE {
		errorMessage := fmt.Sprintf("Gateway state %s is not allowed", gtw.GatewayID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeGtwState(ctx, "Gateway_19q1cw1", DONE)
	stub.SetEvent("Gateway_19q1cw1", []byte("ExclusiveGateway has been done"))

        cc.ChangeMsgState(ctx, "Message_0mxcypj" ,ENABLE)


	return nil
}

func (cc *SmartContract) Message_0mxcypj_Send(ctx contractapi.TransactionContextInterface, fireflyTranID string) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_0mxcypj")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.SendMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	msg.MsgState = WAITFORCONFIRM
	msg.FireflyTranID = fireflyTranID
	msgJSON, _ := json.Marshal(msg)
	stub.PutState("Message_0mxcypj", msgJSON)
	stub.SetEvent("Message_0mxcypj", []byte("Message wait for confirming"))


return nil
}

func (cc *SmartContract) Message_0mxcypj_Complete(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_0mxcypj")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.ReceiveMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != WAITFORCONFIRM {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeMsgState(ctx, "Message_0mxcypj", DONE)
	stub.SetEvent("Message_0mxcypj", []byte("Message has been done"))

	cc.ChangeMsgState(ctx, "Message_0jtzudl", ENABLE)
	return nil
}

func (cc *SmartContract) Message_0jtzudl_Send(ctx contractapi.TransactionContextInterface, fireflyTranID string, avaliable1 bool) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_0jtzudl")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.SendMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}
	if msg.MsgState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	msg.MsgState = WAITFORCONFIRM
	msg.FireflyTranID = fireflyTranID
	msgJSON, _ := json.Marshal(msg)
	stub.PutState("Message_0jtzudl", msgJSON)
	stub.SetEvent("Message_0jtzudl", []byte("Message wait for confirming"))

cc.currentMemory.avaliable1 = avaliable1
		
return nil
}

func (cc *SmartContract) Message_0jtzudl_Complete(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_0jtzudl")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.ReceiveMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != WAITFORCONFIRM {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeMsgState(ctx, "Message_0jtzudl", DONE)
	stub.SetEvent("Message_0jtzudl", []byte("Message has been done"))

	cc.ChangeGtwState(ctx, "Gateway_1besdco" ,ENABLE)


return nil
}	//编排任务的最后一个消息

func (cc *SmartContract) Gateway_1besdco(ctx contractapi.TransactionContextInterface) error { 
	stub := ctx.GetStub()
	gtw, err := cc.ReadGtw(ctx, "Gateway_1besdco")
	if err != nil {
		return err
	}

	if gtw.GatewayState != ENABLE {
		errorMessage := fmt.Sprintf("Gateway state %s is not allowed", gtw.GatewayID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeGtwState(ctx, "Gateway_1besdco", DONE)
	stub.SetEvent("Gateway_1besdco", []byte("ExclusiveGateway has been done"))

if cc.currentMemory.avaliable1==false {
        cc.ChangeGtwState(ctx, "Gateway_19q1cw1" ,ENABLE)

cc.Gateway_19q1cw1(ctx) 
} else if cc.currentMemory.avaliable1==true {
        cc.ChangeMsgState(ctx, "Message_1ewhu0n" ,ENABLE)

} 
	return nil
}

func (cc *SmartContract) Message_1ewhu0n_Send(ctx contractapi.TransactionContextInterface, fireflyTranID string) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_1ewhu0n")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.SendMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	msg.MsgState = WAITFORCONFIRM
	msg.FireflyTranID = fireflyTranID
	msgJSON, _ := json.Marshal(msg)
	stub.PutState("Message_1ewhu0n", msgJSON)
	stub.SetEvent("Message_1ewhu0n", []byte("Message wait for confirming"))


return nil
}

func (cc *SmartContract) Message_1ewhu0n_Complete(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_1ewhu0n")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.ReceiveMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != WAITFORCONFIRM {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeMsgState(ctx, "Message_1ewhu0n", DONE)
	stub.SetEvent("Message_1ewhu0n", []byte("Message has been done"))

	cc.ChangeMsgState(ctx, "Message_10ebhc9", ENABLE)
	return nil
}

func (cc *SmartContract) Message_10ebhc9_Send(ctx contractapi.TransactionContextInterface, fireflyTranID string, avaliable bool) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_10ebhc9")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.SendMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}
	if msg.MsgState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	msg.MsgState = WAITFORCONFIRM
	msg.FireflyTranID = fireflyTranID
	msgJSON, _ := json.Marshal(msg)
	stub.PutState("Message_10ebhc9", msgJSON)
	stub.SetEvent("Message_10ebhc9", []byte("Message wait for confirming"))

cc.currentMemory.avaliable = avaliable
		
return nil
}

func (cc *SmartContract) Message_10ebhc9_Complete(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_10ebhc9")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.ReceiveMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != WAITFORCONFIRM {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeMsgState(ctx, "Message_10ebhc9", DONE)
	stub.SetEvent("Message_10ebhc9", []byte("Message has been done"))

	cc.ChangeGtwState(ctx, "Gateway_07s97pf" ,ENABLE)


return nil
}	//编排任务的最后一个消息

func (cc *SmartContract) Gateway_07s97pf(ctx contractapi.TransactionContextInterface) error { 
	stub := ctx.GetStub()
	gtw, err := cc.ReadGtw(ctx, "Gateway_07s97pf")
	if err != nil {
		return err
	}

	if gtw.GatewayState != ENABLE {
		errorMessage := fmt.Sprintf("Gateway state %s is not allowed", gtw.GatewayID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeGtwState(ctx, "Gateway_07s97pf", DONE)
	stub.SetEvent("Gateway_07s97pf", []byte("ExclusiveGateway has been done"))

if cc.currentMemory.avaliable==false {
        cc.ChangeEventState(ctx, "Event_0ybmmsp" ,ENABLE)

cc.Event_0ybmmsp(ctx) 
} else if cc.currentMemory.avaliable==true {
        cc.ChangeGtwState(ctx, "Gateway_15pbpw2" ,ENABLE)

cc.Gateway_15pbpw2(ctx) 
} 
	return nil
}

func (cc *SmartContract) Event_0ybmmsp(ctx contractapi.TransactionContextInterface) error { 
	stub := ctx.GetStub()
	event, err := cc.ReadEvent(ctx, "Event_0ybmmsp")
	if err != nil {
		return err
	}

	if event.EventState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", event.EventID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeEventState(ctx, "Event_0ybmmsp", DONE)
	stub.SetEvent("Event_0ybmmsp", []byte("EndEvent has been done"))
	return nil
}

func (cc *SmartContract) Gateway_15pbpw2(ctx contractapi.TransactionContextInterface) error { 
	stub := ctx.GetStub()
	gtw, err := cc.ReadGtw(ctx, "Gateway_15pbpw2")
	if err != nil {
		return err
	}

	if gtw.GatewayState != ENABLE {
		errorMessage := fmt.Sprintf("Gateway state %s is not allowed", gtw.GatewayID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeGtwState(ctx, "Gateway_15pbpw2", DONE)
	stub.SetEvent("Gateway_15pbpw2", []byte("EventbasedGateway has been done"))

        cc.ChangeMsgState(ctx, "Message_0lnoc3k" ,ENABLE)

        cc.ChangeMsgState(ctx, "Message_18evq7c" ,ENABLE)


return nil
}

func (cc *SmartContract) Message_0lnoc3k_Send(ctx contractapi.TransactionContextInterface, fireflyTranID string) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_0lnoc3k")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.SendMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	msg.MsgState = WAITFORCONFIRM
	msg.FireflyTranID = fireflyTranID
	msgJSON, _ := json.Marshal(msg)
	stub.PutState("Message_0lnoc3k", msgJSON)
	stub.SetEvent("Message_0lnoc3k", []byte("Message wait for confirming"))

        cc.ChangeMsgState(ctx, "Message_18evq7c" ,DISABLE)


return nil
}

func (cc *SmartContract) Message_0lnoc3k_Complete(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_0lnoc3k")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.ReceiveMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != WAITFORCONFIRM {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeMsgState(ctx, "Message_0lnoc3k", DONE)
	stub.SetEvent("Message_0lnoc3k", []byte("Message has been done"))

	cc.ChangeMsgState(ctx, "Message_0v5avaw", ENABLE)
	return nil
}

func (cc *SmartContract) Message_0v5avaw_Send(ctx contractapi.TransactionContextInterface, fireflyTranID string) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_0v5avaw")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.SendMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}
	if msg.MsgState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	msg.MsgState = WAITFORCONFIRM
	msg.FireflyTranID = fireflyTranID
	msgJSON, _ := json.Marshal(msg)
	stub.PutState("Message_0v5avaw", msgJSON)
	stub.SetEvent("Message_0v5avaw", []byte("Message wait for confirming"))

        cc.ChangeMsgState(ctx, "Message_18evq7c" ,DISABLE)

	
return nil
}

func (cc *SmartContract) Message_0v5avaw_Complete(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_0v5avaw")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.ReceiveMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != WAITFORCONFIRM {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeMsgState(ctx, "Message_0v5avaw", DONE)
	stub.SetEvent("Message_0v5avaw", []byte("Message has been done"))

	cc.ChangeEventState(ctx, "Event_038yxf2" ,ENABLE)


return nil
}	//编排任务的最后一个消息

func (cc *SmartContract) Message_18evq7c_Send(ctx contractapi.TransactionContextInterface, fireflyTranID string) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_18evq7c")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.SendMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	msg.MsgState = WAITFORCONFIRM
	msg.FireflyTranID = fireflyTranID
	msgJSON, _ := json.Marshal(msg)
	stub.PutState("Message_18evq7c", msgJSON)
	stub.SetEvent("Message_18evq7c", []byte("Message wait for confirming"))

        cc.ChangeMsgState(ctx, "Message_0lnoc3k" ,DISABLE)


return nil
}

func (cc *SmartContract) Message_18evq7c_Complete(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_18evq7c")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.ReceiveMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != WAITFORCONFIRM {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeMsgState(ctx, "Message_18evq7c", DONE)
	stub.SetEvent("Message_18evq7c", []byte("Message has been done"))

	cc.ChangeMsgState(ctx, "Message_09r9nyg", ENABLE)
	return nil
}

func (cc *SmartContract) Message_09r9nyg_Send(ctx contractapi.TransactionContextInterface, fireflyTranID string) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_09r9nyg")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.SendMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}
	if msg.MsgState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	msg.MsgState = WAITFORCONFIRM
	msg.FireflyTranID = fireflyTranID
	msgJSON, _ := json.Marshal(msg)
	stub.PutState("Message_09r9nyg", msgJSON)
	stub.SetEvent("Message_09r9nyg", []byte("Message wait for confirming"))

        cc.ChangeMsgState(ctx, "Message_0lnoc3k" ,DISABLE)

	
return nil
}

func (cc *SmartContract) Message_09r9nyg_Complete(ctx contractapi.TransactionContextInterface) error {
	stub := ctx.GetStub()
	msg, err := cc.ReadMsg(ctx, "Message_09r9nyg")
	if err != nil {
		return err
	}

	clientIdentity := ctx.GetClientIdentity()
	clientMspID, _ := clientIdentity.GetMSPID()
	if clientMspID != msg.ReceiveMspID {
		errorMessage := fmt.Sprintf("Msp denied")
		fmt.Println(errorMessage)
		return errors.New(fmt.Sprintf("Msp denied"))
	}

	if msg.MsgState != WAITFORCONFIRM {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", msg.MessageID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeMsgState(ctx, "Message_09r9nyg", DONE)
	stub.SetEvent("Message_09r9nyg", []byte("Message has been done"))

	cc.ChangeEventState(ctx, "Event_0kc2s00" ,ENABLE)


return nil
}	//编排任务的最后一个消息

func (cc *SmartContract) Event_038yxf2(ctx contractapi.TransactionContextInterface) error { 
	stub := ctx.GetStub()
	event, err := cc.ReadEvent(ctx, "Event_038yxf2")
	if err != nil {
		return err
	}

	if event.EventState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", event.EventID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeEventState(ctx, "Event_038yxf2", DONE)
	stub.SetEvent("Event_038yxf2", []byte("EndEvent has been done"))
	return nil
}

func (cc *SmartContract) Event_0kc2s00(ctx contractapi.TransactionContextInterface) error { 
	stub := ctx.GetStub()
	event, err := cc.ReadEvent(ctx, "Event_0kc2s00")
	if err != nil {
		return err
	}

	if event.EventState != ENABLE {
		errorMessage := fmt.Sprintf("Event state %s is not allowed", event.EventID)
		fmt.Println(errorMessage)
		return fmt.Errorf(errorMessage)
	}

	cc.ChangeEventState(ctx, "Event_0kc2s00", DONE)
	stub.SetEvent("Event_0kc2s00", []byte("EndEvent has been done"))
	return nil
}

