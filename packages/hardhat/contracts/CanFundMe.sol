//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//import IERC20 from "@openzeppelin/contracts/token/ERC20/IERC20";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CanFundMeFactory.sol";


contract CanFundMe {

    ////VARIABLES///

    /// @notice the address of the token that is allowed to be used to fund the contract
    address immutable public ALLOWED_TOKEN_ADDRESS = 0x03F734Bd9847575fDbE9bEaDDf9C166F880B5E5f;

    /// @notice IERC20 interface for the token
    IERC20 public noteToken;

    /// @notice A record of each accounts delegate
    mapping (address => uint256) public contributions;

    mapping (address => uint256) public note_contributions;

    /// @notice The platform address
    address public immutable platform_address = 0xcd258fCe467DDAbA643f813141c3560FF6c12518;

    /// @notice the CanFundMeFactory contract
    CanFundMeFactory private immutable canFundMeFactory;

    /// @notice the benificiary of the contract
    address public benificiary;

    /// @notice the owner of the contract
    address immutable public owner;

    /// @notice the threshold for the contract in wei
    uint256 public immutable threshold;

    /// @notice the threshold for the contract in ERC20 tokens
    uint256 public immutable note_threshold;

    /// @notice the time limit for the contract in seconds
    uint256 public time_limit;

    /// @notice the threshold for the contract in wei
    uint8 public gitcoin_scoreThreshold = 10;

    /// @notice the platform fee
    uint8 public platform_fee;

    /// @notice the threshold crossed bool
    bool public threshold_crossed;

    /// Events

    /// @notice event for when the contract is funded
    event Funded(address contributor, uint256 amount);

    /// @notice event for when the is funded with erc20 token
    event NoteFunded(address contributor, uint256 amount);

    // Errors 

    /// @notice isnt the allowed token error
    error IsntAllowedToken();

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

    constructor (address CanFundFactory, address _benificiary, uint256 _threshold, uint256 _time_limit, uint256 _note_threshold, uint16 gitcoinScore) {
        if (gitcoinScore > gitcoin_scoreThreshold) {
            platform_fee = 0;
        }

        //initialize the token
        noteToken = IERC20(ALLOWED_TOKEN_ADDRESS);
        // set the platform fee to 5%
        platform_fee = 5;
        // set the owner
        owner = tx.origin;
        // set the threshold in ether
        threshold = _threshold;
        // set the note_threshold in tokens
        note_threshold = _note_threshold;

        canFundMeFactory = CanFundMeFactory(CanFundFactory);

        benificiary = _benificiary;
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
        return address(this).balance >= threshold || noteToken.balanceOf(address(this)) >= note_threshold;
    }

    /// @notice pure function to return the address balance of the token
    function token_balance() public view returns (uint256) {
    return noteToken.balanceOf(address(this));
    }

    /// @notice function to fund the contract
    function fundMe() public payable {
    if (msg.value <= 0) {
        revert NoFundsSent();
    }
    contributions[msg.sender] += msg.value;

    //check if the threshold has been met
    if (funded() == true) {
        threshold_crossed = true;
    }

    emit Funded(msg.sender, msg.value);
    }

    ///@notice function to change the benificiary
    function change_benificiary(address _benificiary) public {
    if (msg.sender != owner) {
        revert NotOwner();
    }
    benificiary = _benificiary;
    }

    function updateFeeStatusGitcoin () external returns (uint16) {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        if (canFundMeFactory.gitcoin_scores(msg.sender) > gitcoin_scoreThreshold) {
            platform_fee = 0;
        }
        return canFundMeFactory.gitcoin_scores(msg.sender);  
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

    //withdraw the full amount from the contract to the owner, minus 5% fee to platform if the user is not verified on gitcoin with score >10
    uint256 _platform_fee = (address(this).balance * (platform_fee))/100;
    uint256 amount = (address(this).balance - _platform_fee);


    payable(benificiary).transfer(amount);
    if (platform_fee > 0) {
        payable(platform_address).transfer(_platform_fee);
    }
    }

    function contributeWithToken(uint256 amount) external {
    note_contributions[msg.sender] += amount;
    noteToken.transferFrom(msg.sender, address(this), amount);

    //check if the threshold has been met
    if (funded() == true) {
        threshold_crossed = true;
    }

    emit NoteFunded(msg.sender, amount);
    }

    function withdraw_threshold_missed_with_token() public {
    if (threshold_crossed != true) {
        revert ThresholdNotMet();
    }
    if (note_contributions[msg.sender] <= 0) {
        revert NotContributor();
    }
    if (block.timestamp < time_limit) {
        revert TimeLimitNotMet();
    }

    uint256 amount = note_contributions[msg.sender];

    note_contributions[msg.sender] = 0;

    noteToken.transfer(msg.sender, amount);
    }

    function withdraw_threshold_met_with_token() public {
    if (msg.sender != owner) {
        revert NotOwner();
    }
    if (threshold_crossed != true) {
        revert ThresholdNotMet();
    }

    // withdraw the full amount from the contract to the owner, minus 5% fee to platform
    uint256 note_balance = token_balance();
    uint256 _platform_fee = (note_balance * (platform_fee)) / 100;
    uint256 amount = (note_balance - _platform_fee);

    noteToken.transfer(benificiary, amount);

    if (platform_fee > 0) {
    noteToken.transfer(platform_address, _platform_fee);
    }

}
}