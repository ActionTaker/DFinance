// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "./Ownable.sol";

contract CrowdFund is Ownable{
    
    IKIP7 public immutable token;
    
    address stake;
    uint256 totalFunded;
    uint256 goal;
    uint256 startAt;
    uint256 endAt;
    uint256 VTRPriceinKLAY = 51922968585348276285304963292200960*5; // 173076561951160920951016544307337/2^112*30 1클레이 주면 저만큼 준다.
    address taker = 0xBf42eA8816503C86DED61De19E41fF31e47F5E50;  //나중에 바꿔야함

    mapping(address => uint) public pledgedVTR;

    constructor(address _token, address _stake) {
        token = IKIP7(_token);
        stake = _stake;
        goal = 1000000000000000000000000;
        totalFunded = 0;
        startAt = 1660554000;
        endAt = startAt + 86400;
    }

    function setting( //only owner 설정
        uint _goal,
        uint32 _startAt,
        uint32 _endAt
    ) external onlyOwner{
    

        goal = _goal;
        startAt = _startAt;
        endAt = _endAt;
    }
    
    function changePrice(uint256 VTRPrice) external onlyOwner{
        VTRPriceinKLAY = VTRPrice;
    }

    function getVTRAmountforExactKlay(uint256 klay) public view returns(uint256){
        return(klay * VTRPriceinKLAY / (2**112) / (10**9));
    }

    function pledge(uint256 klayAmount) external payable{
        require(block.timestamp >= startAt, "not started");
        require(block.timestamp <= endAt, "ended");
        require(msg.value == klayAmount);

        
        uint256 mintAmount = getVTRAmountforExactKlay(klayAmount);
        pledgedVTR[msg.sender] += mintAmount;
        totalFunded += klayAmount;
        token.mint(msg.sender, mintAmount); // mint agent 설정
        Stake(stake).stake(mintAmount, 2, msg.sender);
        payable(taker).transfer(klayAmount);
    }

    function showBalance() public view returns(uint256){
        return pledgedVTR[msg.sender];
    }

    function setStake(address _stake)public onlyOwner{
        stake = _stake;
    }
    function setTreasury(address _treasury)public onlyOwner{
        taker = _treasury;
    }
    function showPercent() public view returns(uint256){
        uint256 totalFunded_112 = totalFunded * (2**112);
        return(totalFunded_112 / goal / 5192296858534827);
    }

    function getFrontGenInfo() public view returns(uint256, uint256, uint256){
        return(totalFunded, goal, showPercent());
    }
    function getFrontIndInfo() public view returns(uint256, uint256){
        return(msg.sender.balance, showBalance());
    }
}

interface Stake{
    function stake(uint256 amount, uint8 stakeType, address user) payable external;
}
interface IKIP7 {
    function mint(address who, uint256 amount) external;
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient,uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
