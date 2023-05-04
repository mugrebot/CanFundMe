//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "./CanFundMe.sol";
import "./NoDelegateCall.sol";
import "./Eippy.sol";

error InvalidSignature();

contract CanFundMeFactory is NoDelegateCall {


        address public owner;
        mapping (address => uint256) public canFundMeCount;
        mapping (address=> address[]) public canFundMeAddresses;
        address[] public canFundMeAddressesAll;
        /// @notice Eippy contract
        Eippy private eippy;
        mapping (address => uint16) public gitcoin_scores;
        uint256 public canFundTotal = 0;

constructor(address verifierContract) {
        owner = msg.sender;

        eippy = Eippy(verifierContract);
    }

event CanFundMeCreated(address CanFundMeAddress, address owner);



function createCanFundMe(address beneficiary, uint256 _threshold, uint256 _time_limit, uint256 _note_threshold) external noDelegateCall returns (address) {
    CanFundMe newCanFundMe = new CanFundMe(address(this), beneficiary, _threshold, _time_limit, _note_threshold, 0);
    canFundMeCount[msg.sender] += 1;
    canFundMeAddresses[msg.sender].push(address(newCanFundMe));
    canFundMeAddressesAll.push(address(newCanFundMe));

    canFundTotal += 1;

    emit CanFundMeCreated(address(newCanFundMe), msg.sender);
    return address(newCanFundMe);
    
}

function createCanFundMeGitcoin(address beneficiary, uint256 _threshold, uint256 _time_limit, uint256 _note_threshold, uint16 gitcoinScore) external noDelegateCall returns (address) {
    CanFundMe newCanFundMe = new CanFundMe(address(this), beneficiary, _threshold, _time_limit, _note_threshold, gitcoinScore);
    canFundMeCount[msg.sender] += 1;
    canFundMeAddresses[msg.sender].push(address(newCanFundMe));

    canFundMeAddressesAll.push(address(newCanFundMe));
    canFundTotal += 1;
    emit CanFundMeCreated(address(newCanFundMe), msg.sender);
    return address(newCanFundMe);
    
}


/// @notice using ECDSA for bytes32 - signature verification
using ECDSA for bytes32;

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

function verifyPassport (uint16 score, bytes memory signature) public returns (bool) {
    if (eippy.verifySignature(score, msg.sender, address(this), signature) == false) {  
        revert("Invalid signature");
     } 

    gitcoin_scores[msg.sender] = score;

}

}






