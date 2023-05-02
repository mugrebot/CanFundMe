//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


contract CanFundMe {

    /// @notice A record of each accounts delegate
    mapping (address => uint256) public contributions;

    /// @notice The platform address
    address public platform_address = 0xcd258fCe467DDAbA643f813141c3560FF6c12518;

    address public owner;

    /// @notice the factory address 
    address public factory;

    /// @notice a counter for the number of contributors
    uint256 public contributors;

    /// @notice the threshold for the contract in wei
    uint256 public threshold;

    uint256 public time_limit;

    // Errors 

    /// @notice no funds sent error
    error NoFundsSent();

    /// @notice not owner error
    error NotOwner();

    /// @notice not contributor error
    error NotContributor();

    /// @notice threshold not met error
    error ThresholdNotMet();

    /// @notice threshold met error
    error ThresholdMet();

    /// @notice time limit not met error
    error TimeLimitNotMet();

    /// @notice time limit too long
    error TimeLimitTooLong();

    constructor (address CanFundFactory, uint256 _threshold, uint256 _time_limit) {
        // set the owner
        owner = msg.sender;
        // set the threshold in ether
        threshold = _threshold;
        // set the factory address
        factory = CanFundFactory;
        // set the time limit in seconds
        // put a max time limit of 90 days 
        if (_time_limit > 7776000) {
            revert TimeLimitTooLong();
        }
        time_limit = block.timestamp + _time_limit* 1 seconds;
    }

    receive() external payable {
        fundMe();
    }

    /// @notice view function that returns true/false if the threshold has been met
    function funded() public view returns (bool) {
    if (address(this).balance >= threshold) {
        return true;
    } else {
        return false;
    }
    }

    /// @notice function to fund the contract
    function fundMe() public payable {
    if (msg.value <= 0) {
        revert NoFundsSent();
    }
    contributions[msg.sender] += msg.value;
    contributors++;
    //check if the threshold has been met
    }

    /// @notice function to withdraw funds if the threshold is not met after the time limit has passed
    function withdraw_threshold_missed() public {
    if (contributions[msg.sender] <= 0) {
        revert NotContributor();
    }
    if (address(this).balance >= threshold) {
        revert ThresholdMet();
    }
    if (block.timestamp < time_limit) {
        revert TimeLimitNotMet();
    }
    uint256 amount = contributions[msg.sender];
    contributions[msg.sender] = 0;
    payable(msg.sender).transfer(amount);
    }

    /// @notice function to withdraw funds if the threshold is met
    function withdraw_threshold_met() public {
    if (msg.sender != owner) {
        revert NotOwner();
    }
    if (address(this).balance < threshold) {
        revert ThresholdNotMet();
    }

    //withdraw the full amount from the contract to the owner, minus 5% fee to platform
    uint256 platform_fee = (address(this).balance * 5) / 100;
    uint256 amount = (address(this).balance * 95) / 100;
    payable(msg.sender).transfer(amount);
    payable(platform_address).transfer(platform_fee);
    }

}