import "./Ownable.sol";
// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.7 .0 < 0.9 .0;
// 0xc384924b2FaED0D8243cB90Dc3B6E427421cfDe7
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC20/ERC20.sol";

contract TOKEN is ERC20, Ownable {
    
    mapping(address => bool) saleAgentList;
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        // Mint 100 tokens to msg.sender
        // Similar to how
        // 1 dollar = 100 cents
        // 1 token = 1 * (10 ** decimals)
        _mint(msg.sender, 20000 * 10**uint(decimals()));
    }

    function setSaleAgent(address newSaleAgent) public onlyOwner{
        saleAgentList[newSaleAgent] = true;
    }
    function mint(address who, uint256 amount) public{ //나중에 sale agent 추가
        require(saleAgentList[msg.sender]==true || msg.sender == owner);
        _mint(who, amount);
    }
    function burn(address account, uint256 amount) public{ //나중에 sale agent 추가
        require(saleAgentList[msg.sender]==true || msg.sender == owner);
        _burn(account, amount);
    }
        function decimals() public view virtual override returns (uint8) {
        return 9;
    }
}
