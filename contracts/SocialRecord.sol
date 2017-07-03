pragma solidity ^0.4.0;

// solc FirstContract.sol --bin --abi --optimize -o ./
// web3j solidity generate /path/to/<smart-contract>.bin /path/to/<smart-contract>.abi -o /path/to/src/main/java -p com.your.organisation.name
// Inside the resource folder
// web3j solidity generate FirstContract.bin FirstContract.abi -o ../ -p hello


// PROBLEM: Struct SR has a lot of values and solidity is not able to return all of them as strings
// SOLUTION 1: convert string to bytes32 - but I don't now how to do it
// SOLUTION 2: save the SR as stringified JSON <<<<< TAKE THIS INTO CONSIDERATION

// Owning and modifying the contract
contract Owned {

    struct User {
        string globalId;
        bool exists;
    }

    address owner;
    mapping (address => User) users;

    function Owned() { owner = msg.sender; }

    // Only the owner can call the function
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    // Only saved users can call the function
    modifier onlyUser {
        if(users[msg.sender].exists) {
            _;
        }
    }

    modifier onlyNotUser {
       if(!users[msg.sender].exists) {
            _;
        }
    }
}

// Killing the contract
contract Mortal is Owned {

    // Kill the contract (only the owner can)
    function kill() onlyOwner {
        selfdestruct(owner);
    }
}

// SocialRecord contract must be mortal and owned
contract SocialRecord is Mortal {

    // RevocationKey struct
    struct RevocationKey {
        string revokedPublicKey;
        string revocationDate;
        uint revocationReason;
        string signature;
    }

    // SocialRecord struct
    // TODO: bytes32 or string?
    struct SR {
        bytes32 jsonld_context;			// JSON-LD
        bytes32 jsonld_type;				// JSON-LD
        bytes32 typ;                     // ??
        bytes32 globalId;			    // global id
        bytes32 displayName;			    // human readable name
        bytes32 profileLocation;		    // URL
        bytes32 platformGid;             // SN Platfrom ID
        bytes32 personalPublicKey;
        bytes32 accountPublicKey;
        bytes32 salt;				    // length MUST be 16 chars
        bytes32 datetime;			    // XSD datetime format e.g. 2015-01-01T11:11:11Z
        bool active;                    // the SR is deleted?
        bool exists;                    // utility parameter 
        mapping(uint => RevocationKey) keyRevocationList;
    }

    // State variable
    mapping (string => SR) private srs; // maps GIDs to SocialRecords 

    // Constructor
    function SocialRecord(){
        users[msg.sender] = User("Creator", true);
    }

    // Events
    event SocialRecordAdded(address user, string globalId);
    event SocialRecordUpdated(address updater, string globalId);
    event SocialReocordDeleted(address deleter, string globalId);

    // add a Social Record: only a non-user can create it and the globalId has to be new. 
    function addSocialRecord( 
        bytes32 _jsonld_context, 
        bytes32 _jsonld_type, 
        bytes32 _type, 
        bytes32 _globalId,
        bytes32 _displayName, 
        bytes32 _profileLocation, 
        bytes32 _platformGid, 
        bytes32 _personalPublicKey, 
        bytes32 _accountPublicKey, 
        bytes32 _salt, 
        bytes32 _datetime) onlyNotUser returns (string) {
        
        if (srs[_globalId].exists) {
            throw; 
        }

        srs[_globalId] = SR(_jsonld_context, _jsonld_type, _type, _globalId, _displayName, _profileLocation, _platformGid, _personalPublicKey, _accountPublicKey, _salt, _datetime, true, true);
        users[msg.sender] = User(_globalId, true);
        SocialRecordAdded(msg.sender, _globalId);
    }

    // get a Social Record
    function getSocialRecord(string globalId) constant returns (bytes32[]) {
       if (!srs[globalId].exists) {
           throw; 
       }
        SR sr = srs[globalId];
        bytes32[] r = [sr.jsonld_context, 
            sr.jsonld_type, 
            sr.typ, 
            sr.globalId, 
            sr.displayName, 
            sr.profileLocation, 
            sr.platformGid, 
            sr.personalPublicKey, 
            sr.accountPublicKey, 
            sr.salt, 
            sr.datetime];
        return (r);
    }

    // update a Social Record 
    function updateSocialRecord( 
        string _jsonld_context, 
        string _jsonld_type, 
        string _type, 
        string _globalId,
        string _displayName, 
        string _profileLocation, 
        string _platformGid, 
        string _personalPublicKey, 
        string _accountPublicKey, 
        string _salt, 
        string _datetime) onlyUser returns (bool){
        
        // the user is the owner of the social record 
        // TODO: import library to compare strings 
        // if (sha3(users[msg.sender].globalId) != sha3(_globalId)) {
        //     return false; 
        // }
        // the Social Record exists 
        if (!srs[_globalId].exists)  {
            return false; 
        }

        srs[_globalId] = SR(_jsonld_context, _jsonld_type, _type, _globalId, _displayName, _profileLocation, _platformGid, _personalPublicKey, _accountPublicKey, _salt, _datetime, true, true);
        // Trigger the event
        SocialRecordUpdated(msg.sender, _globalId);
        return true; 
    }

    // delete a Social Record
    function deleteSocialRecord(string globalId) onlyUser returns (bool) {
        delete srs[globalId];
        delete users[msg.sender];
        return true; 
    }

    // function getUser(address _user) onlyUser constant returns (string _theUser){
    //     _theUser = users[_user].globalId;
    //     return _theUser;
    // }
}