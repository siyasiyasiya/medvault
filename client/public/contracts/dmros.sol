// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;


contract DMROS {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    enum UserType {
        Patient, 
        Admin
    }

    struct User {
        uint256 userId; // so admin can not see a users wallet address
        address walletAddress;
        string userName;
        UserType Type; // Patient or Admin      
    }

    struct Record {
        string recordName;
        uint256 recordID;
        string encryptedKey;
        string arweaveTxId; 
        address recordOwner; // will always be a Patient
        uint timestamp;
    
    }

    

    mapping(uint256 => Record) public records; // mapping record ID to Record

    mapping(address => User) public users; // mapping address to User (Admin/Patients)
    mapping(address => uint256[]) public patientRecords; // mapping Patient address to the record ID's that are theirs
    mapping(uint256 => address[]) public recordsToAdmin; // mapping record ID to list of Admins with access to it
    mapping(string => bool) public usernameExists; // mapping usernames to see if they already exist


    // list of ADMINS that can view the patient, admin => patient
    mapping(address => address[]) public adminToPatients; // inputting admin, mapping admins to a singular patient
    // list of PATIENTS that can view, patients => admin
    mapping(address => address[]) public patientToAdmins; // inputting patient, mapping patients to a singlular admin


    //events:
    event RecordStored(uint256 indexed recordID, string indexed recordName);
    event RecordAccessGranted(uint indexed recordID, address indexed admin);
    event RecordAccessRevoked(uint indexed recordID, address indexed admin);
    event UserRegistered(address indexed userAddress, UserType indexed typeUser);


    modifier patientAccess() {
        require(users[msg.sender].Type == UserType.Patient, "Only Patients can access");
        _;
    }

    modifier adminAccess() {
        require(users[msg.sender].Type == UserType.Admin, "Only Admins can access");
        _;
    }

    // creating a new user
    function newUser(string memory name, UserType userType) public {
        require(users[msg.sender].userId == 0, "User already exists");
        require(!usernameExists[name], "Username is already in use");

        uint256 uniqueUserID = uint256(keccak256(abi.encodePacked(msg.sender, name)));

        User memory newUserStruct = User({
            userId: uniqueUserID,
            walletAddress: msg.sender,
            userName: name,
            Type: userType
        });

        users[msg.sender] = newUserStruct;
        usernameExists[name] = true;

        emit UserRegistered(msg.sender, userType);

}

    // when the file is uploaded on the front end, the record must be stored
    function storeRecord(string memory fileName, string memory _arweaveTxId, string memory _encryptedKey, address patientAddress) public {
        
        address ownerAddress;

        // if user uploading is an Admin, then they must set the owner of the file to be a valid patient
        // Admins cannot have ownership of the files
        if (users[msg.sender].Type == UserType.Admin) {
            require(patientAddress != address(0), "Admin must specify a valid patient address");
            require(users[patientAddress].Type == UserType.Patient, "The specified address is not a valid patient");
            ownerAddress = patientAddress;

        } else if (users[msg.sender].Type == UserType.Patient) {
            // if the user uploading is a Patient, then they are the owner of the file
            ownerAddress = msg.sender;
        }

        // using the keccak256 hash function within Solidity to create the unique and safe record ID
        uint256 newRecordID = uint256(keccak256(abi.encodePacked(fileName, msg.sender, block.timestamp)));

        Record memory newRecord = Record({
            recordName: fileName,
            recordID: newRecordID,
            encryptedKey: _encryptedKey,
            arweaveTxId: _arweaveTxId,
            recordOwner: ownerAddress, 
            timestamp: block.timestamp
        });

        records[newRecordID] = newRecord;

        // adding the new record ID with the patients existing records
        patientRecords[ownerAddress].push(newRecordID);

        // recordstored event being emitted, record is stored on blockchain
        emit RecordStored(newRecordID, fileName);

    }


    function grantAccess(uint recordID, address recipient) public patientAccess {
        require(records[recordID].recordOwner == msg.sender, "You aren't the owner of this record");
        
        // goes through and checks the Admins who already have access to the record, by recordID
        for (uint i = 0; i < recordsToAdmin[recordID].length; i++) {
            if (recordsToAdmin[recordID][i] == recipient) {
                revert("Recipient already has access");
            } 
        }

        // add the recipient to list of admins w access
        recordsToAdmin[recordID].push(recipient);

        // list of admins:
        adminToPatients[msg.sender].push(recipient); // adding the recipient(admin) to the list of admins access to this patient
        // list of patients:
        patientToAdmins[recipient].push(msg.sender); // adding the patient to the list of patients that the admin has access to

        emit RecordAccessGranted(recordID, recipient);

    }

    function revokeAccess(uint recordID, address recipient) public patientAccess {
        // ensure the sender is the owner of the record
        require(records[recordID].recordOwner == msg.sender, "You aren't the owner of this record");

        bool accessRevoked = false;

        // revoke access from the recordsToAdmin mapping (admin -> record)
        for (uint i = 0; i < recordsToAdmin[recordID].length; i++) {
            if (recordsToAdmin[recordID][i] == recipient) {
                // Remove the recipient (admin) from the recordsToAdmin list
                recordsToAdmin[recordID][i] = recordsToAdmin[recordID][recordsToAdmin[recordID].length - 1];
                recordsToAdmin[recordID].pop();
                accessRevoked = true;
                break;
            }
        }

        // if access was revoked from the record, revoke from the adminToPatients mapping (admin -> patient)
        if (accessRevoked) {
            for (uint i = 0; i < adminToPatients[msg.sender].length; i++) {
                if (adminToPatients[msg.sender][i] == recipient) {
                    // Remove the recipient (admin) from the admin's patient list
                    adminToPatients[msg.sender][i] = adminToPatients[msg.sender][adminToPatients[msg.sender].length - 1];
                    adminToPatients[msg.sender].pop();
                    break;
                }
            }

            // revoke access from the patientToAdmins mapping (patient -> admin)
            for (uint i = 0; i < patientToAdmins[recipient].length; i++) {
                if (patientToAdmins[recipient][i] == msg.sender) {
                    // remove the sender (admin) from the patient's admin list
                    patientToAdmins[recipient][i] = patientToAdmins[recipient][patientToAdmins[recipient].length - 1];
                    patientToAdmins[recipient].pop();
                    break;
                }
            }

            emit RecordAccessRevoked(recordID, recipient);
        } else {
            // if the recipient didn't have access to the record, revert the transaction
            revert("Recipient does not have access to this record");
        }
    }



        

    function getRecordMetadata(uint256 recordID) public view returns (string memory, address, uint256) {
        Record storage record = records[recordID];
        return (record.recordName, record.recordOwner, record.timestamp);
    }

    function isAuthorized(uint recordID) public view returns (bool) {
        for (uint i = 0; i < recordsToAdmin[recordID].length; i++) {
            if (recordsToAdmin[recordID][i] == msg.sender) {
                return true; // the user has access
            }
        }

        return false; // the user does NOT have access

    }

    function getUserId(address userAddress) public view returns (uint256) {
        require(users[userAddress].userId != 0, "User does not exist");
        return users[userAddress].userId; // returns the userId of the userAddress parameter
    }


}
