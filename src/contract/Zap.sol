// SPDX-License-Identifier: GPL-3.0
//token A - > USDT -> token B;

//tokenA 인자로받고 내부에서 token A, usdt 컨트렉을 찾는다. 찾은후에 estPos(token A, amount) 입력한다

//usdt tokenb 컨트렉을 찾고 내부에서 estPos(usdt, amount) 한다.

////factory:0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654
import "./Ownable.sol";
/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 //0x3B85987a6459ebCDF2092402ba2E6C6b47647f58

pragma solidity >=0.8.0 <0.9.0;

contract Zap is Ownable{
        IKlayswapFactory factory;
        address stake;
        IKIP7 VTR;

    constructor(address _factory, address _stake, address _token) {
        factory = IKlayswapFactory(_factory); 
        stake = _stake; // 나중에 지웡함 
        VTR = IKIP7(_token); // 나중에지움
    }
    address USDT = 0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167;
    address constant OTHER_CONTRACT = 0x8016619281F888d011c84d2E2a5348d9417c775B;
    address[] USDTarr = [USDT];

    function estimatePoswithUSDT(address tokenin, uint256 tokeninAmount, address tokenout)public view returns(uint256){
        address pair1 = getUSDTPairAddress(tokenin);
        address pair2 = getUSDTPairAddress(tokenout);
        uint256 USDTfromPair1;
        
        USDTfromPair1 = IKlayExchange(pair1).estimatePos(tokenin, tokeninAmount);
        uint256 tokenoutfromPair2 = IKlayExchange(pair2).estimatePos(USDT, USDTfromPair1);

        return tokenoutfromPair2;
    }


    function getUSDTPairAddress(address token) public view returns(address){
        address stablePair = factory.tokenToPool(token, USDT);
        return stablePair;
    }


    function swapthruUSDT(address tokenA, uint amountA, address tokenB, uint amountB)public{
        require(IKIP7(tokenA).transferFrom(msg.sender, address(this), amountA), 'transferFrom failed.');
        uint256 balanceTokenBb4 = IKIP7(tokenB).balanceOf(address(this));
        require(IKIP7(tokenA).approve(address(factory), amountA), 'approve failed.');
        factory.exchangeKctPos(tokenA, amountA, tokenB, amountB, USDTarr);
        uint256 swapTokenBAmount = IKIP7(tokenB).balanceOf(address(this)) - balanceTokenBb4;
        IKIP7(tokenB).transfer(msg.sender, swapTokenBAmount);
        VTR.mint(msg.sender, swapTokenBAmount/(10**9)); // mint agent 설정
        Stake(stake).stake(swapTokenBAmount/(10**9), 0, msg.sender);
        //swaptokenamount swap 하기
    }
    
    function swapthruUSDTwithKlay(address tokenToReceive, uint amountToReceive, uint klayAmount)payable public{
        require(klayAmount == msg.value);
        uint256 balanceTokenBb4 = IKIP7(tokenToReceive).balanceOf(address(this));
        factory.exchangeKlayPos{ value: klayAmount }(tokenToReceive, amountToReceive, USDTarr);
        uint256 swapTokenBAmount = IKIP7(tokenToReceive).balanceOf(address(this)) - balanceTokenBb4;
        IKIP7(tokenToReceive).transfer(msg.sender, swapTokenBAmount);
        VTR.mint(msg.sender, swapTokenBAmount/(10**9)); // mint agent 설정
        Stake(stake).stake(swapTokenBAmount/(10**9), 0, msg.sender);
    }

    function setStake(address _stake)public onlyOwner{
        stake = _stake;
    }

}

interface IKlayExchange {
    function totalSupply() external view returns(uint256);
    function decimals() external view returns (uint8);
    function balanceOf(address user) external view returns(uint256);
    function tokenA() external view returns(address);
    function tokenB() external view returns(address);
    function getCurrentPool() external view returns(uint256 balance0, uint256 balance1);
    function estimatePos(address token, uint256 amount) external view returns(uint256);
    function estimateNeg(address token, uint256 amount) external view returns(uint256);
}

interface IKlayswapFactory {
    function tokenToPool(address tokenA, address tokenB) external view returns (address);
    function exchangeKlayPos(address token, uint amount, address[] calldata path) payable external;
    function exchangeKlayNeg(address token, uint amount, address[] calldata path) payable external;
    function exchangeKctPos(address tokenA, uint amountA, address tokenB, uint amountB, address[] calldata path) external;
    function exchangeKctNeg(address tokenA, uint amountA, address tokenB, uint amountB, address[] calldata path) external;
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
interface Stake{
    function stake(uint256 amount, uint8 stakeType, address user) payable external;
}

