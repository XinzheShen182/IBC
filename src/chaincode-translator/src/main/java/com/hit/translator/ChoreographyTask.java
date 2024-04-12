package com.hit.translator;

import java.util.ArrayList;

import org.camunda.bpm.model.bpmn.BpmnModelInstance;
import org.camunda.bpm.model.bpmn.impl.instance.TaskImpl;
import org.camunda.bpm.model.bpmn.instance.FlowNode;
import org.camunda.bpm.model.bpmn.instance.MessageFlow;
import org.camunda.bpm.model.bpmn.instance.Participant;
import org.camunda.bpm.model.bpmn.instance.SequenceFlow;
import org.camunda.bpm.model.bpmn.instance.ServiceTask;
import org.camunda.bpm.model.xml.impl.instance.ModelElementInstanceImpl;
import org.camunda.bpm.model.xml.instance.DomElement;
import org.camunda.bpm.model.xml.instance.ModelElementInstance;

public class ChoreographyTask {

	ModelElementInstanceImpl task;
	ArrayList<SequenceFlow>incoming, outgoing;
	Participant participantRef=null;
	MessageFlow request=null, response=null;
	Participant initialParticipant;
	String id, name;
	BpmnModelInstance model;
	TaskType type;

	public enum TaskType {
		ONEWAY, TWOWAY
	}

	public ChoreographyTask(ModelElementInstanceImpl task, BpmnModelInstance modelInstance)
	{
		this.model=modelInstance;
		this.task=task;
		this.incoming=new ArrayList<SequenceFlow>();
		this.outgoing=new ArrayList<SequenceFlow>();
		this.initialParticipant=model.getModelElementById(task.getAttributeValue("initiatingParticipantRef"));
		this.id=task.getAttributeValue("id");
		this.name=task.getAttributeValue("name");
		init();		//
	}

	private void init()
	{		//对初始化单独的tasknode进行处理
		for (DomElement childElement : task.getDomElement().getChildElements()) {
			String type=childElement.getLocalName();
			switch (type) {
				case "incoming":
					incoming.add((SequenceFlow)model.getModelElementById(childElement.getTextContent()));
					break;
				case "outgoing":
					outgoing.add((SequenceFlow)model.getModelElementById(childElement.getTextContent()));
					break;
				case "participantRef":
					Participant p=model.getModelElementById(childElement.getTextContent());
					if (!p.equals(initialParticipant)) {
						participantRef=p;
					}
					break;
				case "messageFlowRef":
					//System.out.println(task.getAttributeValue("id"));
					MessageFlow m=model.getModelElementById(childElement.getTextContent());
					//System.out.println("CHILD TEXT CONTENT: " + childElement.getTextContent());

					//System.out.println("MESSAGE FLOW �: " + m.getId() + "con nome: " + m.getName() + "con messaggio: " + m.getMessage().getId());
					if (m.getSource().getId().equals(initialParticipant.getId())) {			//若源头为任务初始参与者，则为request
						request=m;
					}else{
						response=m;
					}

					break;
				case "extensionElements":
					break;
				default:
					throw new IllegalArgumentException("Invalid element in the xml: "+type);

			}
		}

		if (response!=null) {
			type=TaskType.TWOWAY;
		}
		else {
			type=TaskType.ONEWAY;
		}
	}
	public ModelElementInstance getTask()
	{
		return task;
	}
	public void setTask(ModelElementInstanceImpl task) {
		this.task = task;
	}
	public ArrayList<SequenceFlow> getIncoming() {
		return incoming;
	}
	public void setIncoming(ArrayList<SequenceFlow> incoming) {
		this.incoming = incoming;
	}
	public ArrayList<SequenceFlow> getOutgoing() {
		return outgoing;
	}
	public void setOutgoing(ArrayList<SequenceFlow> outgoing) {
		this.outgoing = outgoing;
	}

	public Participant getParticipantRef() {
		return participantRef;
	}
	public void setParticipantRef(Participant participantRef) {
		this.participantRef = participantRef;
	}
	public MessageFlow getRequest() {
		return request;
	}
	public void setRequest(MessageFlow request) {
		this.request = request;
	}
	public MessageFlow getResponse() {
		return response;
	}
	public void setResponse(MessageFlow response) {
		this.response = response;
	}
	public Participant getInitialParticipant() {
		return initialParticipant;
	}
	public void setInitialParticipant(Participant initialParticipant) {
		this.initialParticipant = initialParticipant;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public BpmnModelInstance getModel() {
		return model;
	}
	public void setModel(BpmnModelInstance model) {
		this.model = model;
	}
	public TaskType getType() {
		return type;
	}
	public void setType(TaskType type) {
		this.type = type;
	}
}