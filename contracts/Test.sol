pragma solidity ^0.4.4;

contract Test {
    uint public uno; 
    bool public due; 

    function test(uint _uno, bool _due) returns(bool) {
        uno = _uno; 
        due = _due;
        return true; 
    }
}