package com.hit.model;//package org.example.model;
//
//import java.util.List;
//
//import javax.persistence.Column;
//import javax.persistence.ElementCollection;
//import javax.persistence.Entity;
//import javax.persistence.FetchType;
//import javax.persistence.GeneratedValue;
//import javax.persistence.GenerationType;
//import javax.persistence.Id;
//import javax.persistence.OneToMany;
//import javax.xml.bind.annotation.XmlRootElement;
//
//import org.bson.Document;
//import org.bson.types.ObjectId;
//import org.hibernate.annotations.NamedQuery;
//import org.hibernate.annotations.Type;
//import org.hibernate.ogm.datastore.document.options.AssociationStorage;
//import org.hibernate.ogm.datastore.document.options.AssociationStorageType;
//import org.hibernate.ogm.datastore.mongodb.options.AssociationDocumentStorage;
//import org.hibernate.ogm.datastore.mongodb.options.AssociationDocumentStorageType;
//
//@XmlRootElement
//@Entity
//@AssociationStorage(AssociationStorageType.ASSOCIATION_DOCUMENT)
//@AssociationDocumentStorage(AssociationDocumentStorageType.COLLECTION_PER_ASSOCIATION)
//@NamedQuery(name = "User.findAll", query = "SELECT t FROM User t")
//@NamedQuery(name="User.findByAddress", query="SELECT u FROM User u WHERE u.address = :address")
//public class User {
//	@Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Type(type = "objectid")
//    private String id;
//    @Column(unique = true)
//	private String address;
//	@OneToMany(targetEntity=Instance.class, fetch = FetchType.EAGER)
//	private List<Instance> instances;
//
//	public String getID() {
//		return id;
//	}
//
//	public void setID(String iD) {
//		id = iD;
//	}
//
//	public String getAddress() {
//		return address;
//	}
//
//	public void setAddress(String address) {
//		this.address = address;
//	}
//
//	public List<Instance> getInstances() {
//		return instances;
//	}
//
//	public void setInstances(List<Instance> instances) {
//		this.instances = instances;
//	}
//
//	public User(String address, List<Instance> instances) {
//		super();
//		this.address = address;
//		this.instances = instances;
//	}
//
//	public User() {
//		super();
//	}
//
//}
//
//
