// SPDX-License-Identifier: GPL-3.0
//token A - > USDT -> token B;

//tokenA 인자로받고 내부에서 token A, usdt 컨트렉을 찾는다. 찾은후에 estPos(token A, amount) 입력한다

//usdt tokenb 컨트렉을 찾고 내부에서 estPos(usdt, amount) 한다.

////factory:0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654

pragma solidity >=0.8.0 <0.9.0;

contract GetTokenBalance {

    address zeroAddress = 0x0000000000000000000000000000000000000000;

    function getTokenBalance(address adr) public view returns(uint256){
        if(adr == zeroAddress)
        {
            return msg.sender.balance;
        }
        else
        {
            return (IKIP7(adr).balanceOf(msg.sender));
        }
    }
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
