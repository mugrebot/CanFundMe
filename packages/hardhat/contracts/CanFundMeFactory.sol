//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./CanFundMe.sol";
import "./NoDelegateCall.sol";

contract CanFundMeFactory is NoDelegateCall {
    
        address public owner;
        mapping (address => uint256) public canFundMeCount;
        mapping (address => address[]) public canFundMeAddresses;


constructor() {
        owner = msg.sender;
    }

event CanFundMeCreated(address CanFundMeAddress, address owner);

function createCanFundMe(uint256 _threshold, uint256 _time_limit) external noDelegateCall returns (address) {
    CanFundMe newCanFundMe = new CanFundMe(address(this), _threshold, _time_limit);
    canFundMeCount[msg.sender] += 1;
    canFundMeAddresses[msg.sender].push(address(newCanFundMe));
    emit CanFundMeCreated(address(newCanFundMe), msg.sender);
    return address(newCanFundMe);
    
}

function getOwner() external view returns (address) {
    return owner;
}

function getFactory() external view returns (address) {
    return address(this);
}

// a user might want to know how many CanFundMe contracts they have created and it will be useful for the UI
function getCanFundMeCount(address _user) external view returns (uint256) {
    return canFundMeCount[_user];
}

// a user might want to know the addresses of the CanFundMe contracts they have created and it will be useful for the UI
function getCanFundMeAddresses(address _user) external view returns (address[] memory) {
    return canFundMeAddresses[_user];

}

}






