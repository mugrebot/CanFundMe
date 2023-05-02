//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

//import IERC20 from "@openzeppelin/contracts/token/ERC20/IERC20";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CanFundMeFactory.sol";


contract CanFundMe {
    
    address immutable public ALLOWED_TOKEN_ADDRESS = 0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503;

    bool public accept_note;

    /// @notice A record of each accounts delegate
    mapping (address => uint256) public contributions;

    mapping (address => uint256) public note_contributions;

    /// @notice The platform address
    address public immutable platform_address = 0xcd258fCe467DDAbA643f813141c3560FF6c12518;

    address public benificiary;

    /// @notice the factory address 
    address immutable public factory;

    address immutable public owner;

    /// @notice a counter for the number of contributors
    uint256 public contributors;

    /// @notice the threshold for the contract in wei
    uint256 public immutable threshold;

    /// @notice the threshold for the contract in ERC20 tokens
    uint256 public immutable note_threshold;

    uint256 public time_limit;

    uint16 public gitcoin_scoreThreshold = 10;

    uint256 public platform_fee;

    CanFundMeFactory private immutable canFundMeFactory ;

    bool public threshold_crossed;

    /// Events
    event Funded(address contributor, uint256 amount);

    event NoteFunded(address contributor, uint256 amount);

    // Errors 

    /// @notice isnt the allowed token error
    error IsntAllowedToken();

    /// @notice no ERC20 accepted 
    error NoERC20Accepted();

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

    constructor (address CanFundFactory, address _benificiary, uint256 _threshold, uint256 _time_limit, uint256 _note_threshold, bool _accept_note, uint16 gitcoinScore) {
        if (gitcoinScore > gitcoin_scoreThreshold) {
            platform_fee = 0;
        }

        // set the platform fee to 5%
        platform_fee = 5;
        
        // set the owner
        owner = tx.origin;
        // set the threshold in ether
        threshold = _threshold;
        // set the factory address
        factory = CanFundFactory;

        //
        canFundMeFactory = CanFundMeFactory(CanFundFactory);
        // set the note_threshold in tokens
        note_threshold = _note_threshold;

        // set the accept_note bool
        accept_note = _accept_note;

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
    if (address(this).balance >= threshold || IERC20(ALLOWED_TOKEN_ADDRESS).balanceOf(address(this)) >= note_threshold) {
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
    

    function contributeWithToken(address tokenAddress, uint256 amount) external {
    if (accept_note == false) {
        revert NoERC20Accepted();
    }
    if (tokenAddress != ALLOWED_TOKEN_ADDRESS) {
        revert IsntAllowedToken();
    }
    IERC20 token = IERC20(tokenAddress);

    //set allowance to the contract address
    token.approve(address(this), amount);

    token.transferFrom(msg.sender, address(this), amount);

    note_contributions[msg.sender] += amount;
    contributors++;

    //check if the threshold has been met
    if (funded() == true) {
        threshold_crossed = true;
    }

    emit NoteFunded(msg.sender, amount);
    }

    function withdraw_threshold_missed_with_token(address tokenAddress) external {
    if (accept_note == false) {
        revert NoERC20Accepted();
    }
    if (threshold_crossed != true) {
        revert ThresholdNotMet();
    }
    if (note_contributions[msg.sender] <= 0) {
        revert NotContributor();
    }
    if (block.timestamp < time_limit) {
        revert TimeLimitNotMet();
    }

    IERC20 token = IERC20(tokenAddress);

    uint256 amount = note_contributions[msg.sender];

    note_contributions[msg.sender] = 0;

    token.transfer(msg.sender, amount);
    }

    function withdraw_threshold_met_with_token(address tokenAddress) external {
    if (accept_note == false) {
        revert NoERC20Accepted();
    }
    if (msg.sender != owner) {
        revert NotOwner();
    }
    if (threshold_crossed != true) {
        revert ThresholdNotMet();
    }

    IERC20 token = IERC20(tokenAddress);

    // withdraw the full amount from the contract to the owner, minus 5% fee to platform
    uint256 note_balance = token.balanceOf(address(this));
    uint256 _platform_fee = (note_balance * (platform_fee)) / 100;
    uint256 amount = (note_balance - _platform_fee);

    token.transfer(msg.sender, amount);

    if (platform_fee > 0) {
    token.transfer(platform_address, _platform_fee);
    }

}
}