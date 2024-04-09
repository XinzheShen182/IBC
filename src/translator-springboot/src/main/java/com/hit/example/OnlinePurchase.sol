pragma solidity ^0.5.3; 
	pragma experimental ABIEncoderV2;
	contract OnlinePurchase{
	    uint counter;
	event stateChanged(uint);  
	mapping (string=>uint) position;

	enum State {DISABLED, ENABLED, DONE} State s; 
	mapping(string => string) operator; 
	struct Element{
	string ID;
	State status;
}
	struct StateMemory{
	string product;
uint price;
bool accepted;
 bool reiterate;
string motivation;
string shipAddress;
uint amount;
string shipInfo;
string invoiceInfo;
}
	Element[] elements;
	  StateMemory currentMemory;
	string[] elementsID = ["sid-0EC70E7E-A42A-4C9E-B120-16B25BDACE7A", "sid-00e1b46c-e485-4551-a17b-6f0c3f21ec2c", "sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04", "sid-624ca53e-cc27-4a74-97be-055cb19cae54", "sid-72ee2908-7c6b-4b9e-a80b-4734a6b2cb0b", "sid-E2CFD2E8-7869-4F28-AC83-296ED8FA7D6E", "sid-94C810EF-69BE-4D67-91B8-4A34DF4D1940", "sid-abba267c-92e3-4944-a98a-d317e035c861", "sid-e385b492-6b2b-475b-a8dd-8fc09513393b", "sid-b9828a39-b70d-4470-b5d2-61cda9b2bc64", "sid-0663CB4E-D3BF-4E12-8D81-D68E9318355F", "sid-859C73C7-F0DD-45ED-AA88-E0DEA0340C91", "sid-2F272EDB-9940-467E-AADC-2B485679AF43", "sid-06caa7c5-fba5-4524-8d4d-2f24b1d51468", "sid-CCD2A372-D382-426E-B823-05F778D4EA44", "sid-094362A8-CC68-4CB6-AC98-74DCF1163997", "sid-80A4BF32-23C1-4585-A70C-26A40D63DA7F", "sid-E761CE7E-ED53-413A-A3C8-3D6569A80525"];
	string[] roleList = [ "Buyer" ]; 
	string[] optionalList = ["Seller" ]; 
	mapping(string=>address) roles; 
	mapping(string=>address) optionalRoles; 
constructor() public{
    //struct instantiation
    for (uint i = 0; i < elementsID.length; i ++) {
        elements.push(Element(elementsID[i], State.DISABLED));
        position[elementsID[i]]=i;
    }
         
         //roles definition
         //mettere address utenti in base ai ruoli
	roles["Buyer"] = 0x04A730f3109D0286A70f4f28876755c91562569E;
	optionalRoles["Seller"] = 0x0000000000000000000000000000000000000000;         
         //enable the start process
         init();
    }
    modifier checkMand(string storage role) 
{ 
	require(msg.sender == roles[role]); 
	_; }modifier checkOpt(string storage role) 
{ 
	require(msg.sender == optionalRoles[role]); 
	_; }modifier Owner(string memory task) 
{ 
	require(elements[position[task]].status==State.ENABLED);
	_;
}
function init() internal{
       bool result=true;
       	for(uint i=0; i<roleList.length;i++){
       	     if(roles[roleList[i]]==0x0000000000000000000000000000000000000000){
                result=false;
                break;
            }
       	}
       	if(result){
       	    enable("sid-0EC70E7E-A42A-4C9E-B120-16B25BDACE7A");
				sid_0EC70E7E_A42A_4C9E_B120_16B25BDACE7A();
       	}
   }

function subscribe_as_participant(string memory _role) public {
        if(optionalRoles[_role]==0x0000000000000000000000000000000000000000){
          optionalRoles[_role]=msg.sender;
        }
    }
function sid_0EC70E7E_A42A_4C9E_B120_16B25BDACE7A() private {
	require(elements[position["sid-0EC70E7E-A42A-4C9E-B120-16B25BDACE7A"]].status==State.ENABLED);
	done("sid-0EC70E7E-A42A-4C9E-B120-16B25BDACE7A");
	enable("sid-00e1b46c-e485-4551-a17b-6f0c3f21ec2c");  
	
}

function sid_00e1b46c_e485_4551_a17b_6f0c3f21ec2c(string memory product) public checkMand(roleList[0]) {
	require(elements[position["sid-00e1b46c-e485-4551-a17b-6f0c3f21ec2c"]].status==State.ENABLED);  
	done("sid-00e1b46c-e485-4551-a17b-6f0c3f21ec2c");
currentMemory.product=product;
	enable("sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04");
sid_C240C6E9_F55F_46A5_B1F6_5FC4A0F30B04(); 
}

function sid_C240C6E9_F55F_46A5_B1F6_5FC4A0F30B04() private {
	require(elements[position["sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04"]].status==State.ENABLED);
	done("sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04");
	enable("sid-624ca53e-cc27-4a74-97be-055cb19cae54");  
}

function sid_624ca53e_cc27_4a74_97be_055cb19cae54(uint price) public checkOpt(optionalList[0]){
	require(elements[position["sid-624ca53e-cc27-4a74-97be-055cb19cae54"]].status==State.ENABLED);  
	done("sid-624ca53e-cc27-4a74-97be-055cb19cae54");
	enable("sid-72ee2908-7c6b-4b9e-a80b-4734a6b2cb0b");
currentMemory.price=price;
}
function sid_72ee2908_7c6b_4b9e_a80b_4734a6b2cb0b(bool accepted, bool reiterate) public checkMand(roleList[0]){
	require(elements[position["sid-72ee2908-7c6b-4b9e-a80b-4734a6b2cb0b"]].status==State.ENABLED);
	done("sid-72ee2908-7c6b-4b9e-a80b-4734a6b2cb0b");
currentMemory.accepted=accepted;
currentMemory.reiterate=reiterate;
	enable("sid-E2CFD2E8-7869-4F28-AC83-296ED8FA7D6E");
sid_E2CFD2E8_7869_4F28_AC83_296ED8FA7D6E(); 
}

function sid_E2CFD2E8_7869_4F28_AC83_296ED8FA7D6E() private {
	require(elements[position["sid-E2CFD2E8-7869-4F28-AC83-296ED8FA7D6E"]].status==State.ENABLED);
	done("sid-E2CFD2E8-7869-4F28-AC83-296ED8FA7D6E");
if(currentMemory.accepted==true){enable("sid-94C810EF-69BE-4D67-91B8-4A34DF4D1940"); 
 sid_94C810EF_69BE_4D67_91B8_4A34DF4D1940();} 
if(currentMemory.accepted==false){enable("sid-80A4BF32-23C1-4585-A70C-26A40D63DA7F"); 
 sid_80A4BF32_23C1_4585_A70C_26A40D63DA7F();} 
}

function sid_94C810EF_69BE_4D67_91B8_4A34DF4D1940() private {
	require(elements[position["sid-94C810EF-69BE-4D67-91B8-4A34DF4D1940"]].status==State.ENABLED);
	done("sid-94C810EF-69BE-4D67-91B8-4A34DF4D1940");
	enable("sid-abba267c-92e3-4944-a98a-d317e035c861"); 
	enable("sid-e385b492-6b2b-475b-a8dd-8fc09513393b"); 
}

function sid_abba267c_92e3_4944_a98a_d317e035c861(string memory motivation) public checkMand(roleList[0]) {
	require(elements[position["sid-abba267c-92e3-4944-a98a-d317e035c861"]].status==State.ENABLED);  
	done("sid-abba267c-92e3-4944-a98a-d317e035c861");
currentMemory.motivation=motivation;
disable("sid-e385b492-6b2b-475b-a8dd-8fc09513393b");
	enable("sid-859C73C7-F0DD-45ED-AA88-E0DEA0340C91");
sid_859C73C7_F0DD_45ED_AA88_E0DEA0340C91(); 
}

function sid_e385b492_6b2b_475b_a8dd_8fc09513393b(string memory shipAddress) public checkMand(roleList[0]) {
	require(elements[position["sid-e385b492-6b2b-475b-a8dd-8fc09513393b"]].status==State.ENABLED);  
	done("sid-e385b492-6b2b-475b-a8dd-8fc09513393b");
currentMemory.shipAddress=shipAddress;
disable("sid-abba267c-92e3-4944-a98a-d317e035c861");
	enable("sid-b9828a39-b70d-4470-b5d2-61cda9b2bc64");
}

function sid_b9828a39_b70d_4470_b5d2_61cda9b2bc64(uint amount) public checkMand(roleList[0]) {
	require(elements[position["sid-b9828a39-b70d-4470-b5d2-61cda9b2bc64"]].status==State.ENABLED);  
	done("sid-b9828a39-b70d-4470-b5d2-61cda9b2bc64");
currentMemory.amount=amount;
	enable("sid-0663CB4E-D3BF-4E12-8D81-D68E9318355F");
sid_0663CB4E_D3BF_4E12_8D81_D68E9318355F(); 
}

function sid_0663CB4E_D3BF_4E12_8D81_D68E9318355F() private { 
	require(elements[position["sid-0663CB4E-D3BF-4E12-8D81-D68E9318355F"]].status==State.ENABLED);
	done("sid-0663CB4E-D3BF-4E12-8D81-D68E9318355F");
	enable("sid-2F272EDB-9940-467E-AADC-2B485679AF43"); 
	enable("sid-06caa7c5-fba5-4524-8d4d-2f24b1d51468"); 
}

function sid_859C73C7_F0DD_45ED_AA88_E0DEA0340C91() private {
	require(elements[position["sid-859C73C7-F0DD-45ED-AA88-E0DEA0340C91"]].status==State.ENABLED);
	done("sid-859C73C7-F0DD-45ED-AA88-E0DEA0340C91");  }

function sid_2F272EDB_9940_467E_AADC_2B485679AF43(string memory shipInfo) public checkOpt(optionalList[0]) {
	require(elements[position["sid-2F272EDB-9940-467E-AADC-2B485679AF43"]].status==State.ENABLED);  
	done("sid-2F272EDB-9940-467E-AADC-2B485679AF43");
currentMemory.shipInfo=shipInfo;
	enable("sid-CCD2A372-D382-426E-B823-05F778D4EA44");
sid_CCD2A372_D382_426E_B823_05F778D4EA44(); 
}

function sid_06caa7c5_fba5_4524_8d4d_2f24b1d51468(string memory invoiceInfo) public checkOpt(optionalList[0]) {
	require(elements[position["sid-06caa7c5-fba5-4524-8d4d-2f24b1d51468"]].status==State.ENABLED);  
	done("sid-06caa7c5-fba5-4524-8d4d-2f24b1d51468");
currentMemory.invoiceInfo=invoiceInfo;
	enable("sid-CCD2A372-D382-426E-B823-05F778D4EA44");
sid_CCD2A372_D382_426E_B823_05F778D4EA44(); 
}

function sid_CCD2A372_D382_426E_B823_05F778D4EA44() private { 
	require(elements[position["sid-CCD2A372-D382-426E-B823-05F778D4EA44"]].status==State.ENABLED);
	done("sid-CCD2A372-D382-426E-B823-05F778D4EA44");
	if( elements[position["sid-2F272EDB-9940-467E-AADC-2B485679AF43"]].status==State.DONE && elements[position["sid-06caa7c5-fba5-4524-8d4d-2f24b1d51468"]].status==State.DONE ) { 
	enable("sid-094362A8-CC68-4CB6-AC98-74DCF1163997"); 
sid_094362A8_CC68_4CB6_AC98_74DCF1163997(); 
}} 

function sid_094362A8_CC68_4CB6_AC98_74DCF1163997() private {
	require(elements[position["sid-094362A8-CC68-4CB6-AC98-74DCF1163997"]].status==State.ENABLED);
	done("sid-094362A8-CC68-4CB6-AC98-74DCF1163997");  }

function sid_80A4BF32_23C1_4585_A70C_26A40D63DA7F() private {
	require(elements[position["sid-80A4BF32-23C1-4585-A70C-26A40D63DA7F"]].status==State.ENABLED);
	done("sid-80A4BF32-23C1-4585-A70C-26A40D63DA7F");
if(currentMemory.reiterate==true
){enable("sid-C240C6E9-F55F-46A5-B1F6-5FC4A0F30B04"); 
 sid_C240C6E9_F55F_46A5_B1F6_5FC4A0F30B04();} 
if(currentMemory.reiterate==false){enable("sid-E761CE7E-ED53-413A-A3C8-3D6569A80525"); 
 sid_E761CE7E_ED53_413A_A3C8_3D6569A80525();} 
}

function sid_E761CE7E_ED53_413A_A3C8_3D6569A80525() private {
	require(elements[position["sid-E761CE7E-ED53-413A-A3C8-3D6569A80525"]].status==State.ENABLED);
	done("sid-E761CE7E-ED53-413A-A3C8-3D6569A80525");  }

 function enable(string memory _taskID) internal { elements[position[_taskID]].status=State.ENABLED;      emit stateChanged(counter++);
}

    function disable(string memory _taskID) internal { elements[position[_taskID]].status=State.DISABLED; }

    function done(string memory _taskID) internal { elements[position[_taskID]].status=State.DONE; } 
   
    function getCurrentState()public view  returns(Element[] memory, StateMemory memory){
        // emit stateChanged(elements, currentMemory);
        return (elements, currentMemory);
    }
    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) { 
        return keccak256(abi.encode(a)) == keccak256(abi.encode(b)); 
    }
}