pragma solidity ^0.4.4;

contract Test {
    uint public uno; 
    bool public due; 

    struct SR {
        uint value; 
        bool exists; 
    }

    mapping(address => SR) map; 

    function test(uint _uno, bool _due) returns(bool) {
        uno = _uno; 
        due = _due;
        return true; 
    }

    function map(uint _value) returns(bool) {
        
    }

    // we don't even need this, we only need the msg.sender
    function verify(bytes32 h, uint8 v, bytes32 r, bytes32 s) constant returns(bool user) {
        user = ecrecover(h, v, r, s);
    }
}