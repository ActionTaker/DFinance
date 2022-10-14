    
// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./HomoraMath.sol";
//deployed address :0xc02DBAc48af645bD84C85560868D731f034E1867
//store:0x1289550d988177575154c2CA45c95CCfb32F837d

//factory:0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654

// 0x0eB5a83c3590b29c8F4DBAdDAf0E2C3886eE4861
contract BondHelp {
    using HomoraMath for uint256;
    address USDT = 0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167;
    
    IKlayswapStore store;
    IKlayswapFactory factory;

    //stake 컨트렉 불러와야하고, VTR 가격오라클도 불러와야한다. 
    
    constructor(address _store, address _factory) {
        store = IKlayswapStore(_store); 
        factory = IKlayswapFactory(_factory);   
    }
    function getRatioWithToken(address token) public view returns(uint256, uint256, uint256, uint256, uint256){ //인풋 토큰 컨트렉 아웃풋 토큰 가격
        address stablePair = getUSDTPairAddress(token);
        return getRatioWithStable(stablePair);
    }

    function getUSDTPairAddress(address token) public view returns(address){
        address stablePair = factory.tokenToPool(token, USDT);
        return stablePair;
    }

    function getLPvalueWithPair(address pair) public view returns(uint256){  //합친함수, 

        address token0 = IKlayExchange(pair).tokenA();
        address token1 = IKlayExchange(pair).tokenB();
        uint256 token0inUSD_112;
        uint256 token1inUSD_112;
        uint256 lpValueinUSD_112_18_n;
        if((token0 != USDT) && (token1 != USDT)) // 둘다 스테이블아니면
        {
            ( , , token0inUSD_112, , ) = getRatioWithToken(token0); //가격 구하고
            ( , , token1inUSD_112, , ) = getRatioWithToken(token1);

            lpValueinUSD_112_18_n = getNonStableLPvalue(pair, token0inUSD_112, token1inUSD_112); 

            return lpValueinUSD_112_18_n;
        }
        else{
            if(token0 == USDT){
                ( , , token1inUSD_112, , ) = getRatioWithToken(token1);
                lpValueinUSD_112_18_n = getNonStableLPvalue(pair, 2**112, token1inUSD_112);
                return lpValueinUSD_112_18_n;
            }else if(token1 == USDT){
                ( , , token0inUSD_112, , ) = getRatioWithToken(token0);
                lpValueinUSD_112_18_n = getNonStableLPvalue(pair, 2**112, token0inUSD_112);    
                return lpValueinUSD_112_18_n;      
            }
            else{
                return 0;
            }
        }
    }
    
    function getRatioWithStable(address stablePair) public view returns(uint256, uint256, uint256, uint256, uint256){ //인풋 토큰-스테이블페어 아웃풋 가격
        uint112 reserve0;
        uint112 reserve1;
        uint256 reserve0_18;
        uint256 reserve1_18;


        address token0 = IKlayExchange(stablePair).tokenA();
        address token1 = IKlayExchange(stablePair).tokenB();
        (reserve0, reserve1, ) = store.getReserves(stablePair);

        if(token0 == address(0)){
            reserve0_18 = stablePair.balance;
            reserve1_18 = reserve1*(10**(18-IKIP7(token1).decimals()));
        }
        else if(token1 == address(0)){
            reserve1_18 = stablePair.balance;
            reserve0_18 = reserve0*(10**(18-IKIP7(token0).decimals()));
        }else{
            reserve0_18 = reserve0*(10**(18-IKIP7(token0).decimals()));
            reserve1_18 = reserve1*(10**(18-IKIP7(token1).decimals()));
        }

        uint256 reserve0_112_18 = reserve0_18 * (2**112);
        uint256 reserve1_112_18 = reserve1_18 * (2**112);
        require(reserve0_18 != 0 && reserve1_18 != 0, "Oracle: NO_RESERVES");

        if(token0 == USDT){
            uint256 token1inUSD_112 = reserve0_112_18 / reserve1_18;
            uint256 token1inUSD_18 = token1inUSD_112 / 5192296858534827;
            uint256 token1inUSD_0 = token1inUSD_18 / (10**18);
            return(token1inUSD_18, token1inUSD_0 ,token1inUSD_112, reserve0_18, reserve1_18);
        }
        else{
            uint256 token0inUSD_112 = reserve1_112_18 / reserve0_18;
            uint256 token0inUSD_18 = token0inUSD_112 / 5192296858534827;
            uint256 token0inUSD_0 = token0inUSD_18 / (10**18);
            return(token0inUSD_18, token0inUSD_0, token0inUSD_112, reserve0_18, reserve1_18);
        }
    }

    function getNonStableLPvalue(address pair, uint256 token0inUSD_112, uint256 token1inUSD_112) public view returns(uint256){ //인풋 페어 그리고 그둘의 토큰 가격 아웃풋 lp 토큰가격
        uint112 reserve0;
        uint112 reserve1;
        uint256 reserve0_18;
        uint256 reserve1_18;
        address token0 = IKlayExchange(pair).tokenA();
        address token1 = IKlayExchange(pair).tokenB();
        (reserve0, reserve1, ) = store.getReserves(pair);

        if(token0 == address(0)){
            reserve0_18 = pair.balance;
            reserve1_18 = reserve1*(10**(18-IKIP7(token1).decimals()));
        }
        else if(token1 == address(0)){
            reserve1_18 = pair.balance;
            reserve0_18 = reserve0*(10**(18-IKIP7(token0).decimals()));
        }else{
            reserve0_18 = reserve0*(10**(18-IKIP7(token0).decimals()));
            reserve1_18 = reserve1*(10**(18-IKIP7(token1).decimals()));
        }

        require(reserve0_18 != 0 && reserve1_18 != 0, "Oracle: NO_RESERVES");

        uint256 totalSupply_n = IKlayExchange(pair).totalSupply();
        uint256 sqrtK_112_18_n = HomoraMath.sqrt(reserve0_18*reserve1_18).fdiv(totalSupply_n);
        uint256 lpValueinUSD_112_18_n = (2*sqrtK_112_18_n*HomoraMath.sqrt(token0inUSD_112)/2**56*HomoraMath.sqrt(token1inUSD_112)/2**56);
        return lpValueinUSD_112_18_n;
    } 

    function getTotalTVL(address pair) public view returns(uint256, uint256, uint256){
        uint256 lpValueinUSD_112_18_n = getLPvalueWithPair(pair);
        uint256 lpAmount_n = IKlayExchange(pair).totalSupply();
        return getInputLPvalue(lpValueinUSD_112_18_n, lpAmount_n);
    }

    function getUserStableLPvalue(address pair) public view returns(uint256, uint256){
        uint256 lpValueinUSD_112_18_n = getLPvalueWithPair(pair); 
        uint256 userlpAmount_n = IKlayExchange(pair).balanceOf(msg.sender);
        uint256 lpAmountValueinUSD_18;
        (lpAmountValueinUSD_18, , ) = getInputLPvalue(lpValueinUSD_112_18_n, userlpAmount_n);
        return (userlpAmount_n, lpAmountValueinUSD_18);
    }

    function getUserAddressLPvalue(address pair, address user) public view returns(uint256, uint256){
        uint256 lpValueinUSD_112_18_n = getLPvalueWithPair(pair); 
        uint256 userlpAmount_n = IKlayExchange(pair).balanceOf(user);
        uint256 lpAmountValueinUSD_18;
        (lpAmountValueinUSD_18, , ) = getInputLPvalue(lpValueinUSD_112_18_n, userlpAmount_n);
        return (userlpAmount_n, lpAmountValueinUSD_18);
    }


    function getInputLPValueTokenAmount(address pair, uint256 lpAmount_n, uint256 tokenPriceinUSD_4) public view returns(uint256, uint256, uint256, uint256, uint256){ // 마지막 인풋 페어 주소로 바꿔야함
        uint256 lpValueinUSD_112_18_n = getLPvalueWithPair(pair);
        uint256 lpAmountValueinUSD_18;
        uint256 lpAmountValueinUSD_0;
        uint256 lpAmountValueinUSD_112_18;
        (lpAmountValueinUSD_18, lpAmountValueinUSD_0, lpAmountValueinUSD_112_18) = getInputLPvalue(lpValueinUSD_112_18_n, lpAmount_n);
        uint256 lpAmountValueinUSD_112 = lpAmountValueinUSD_112_18 / (10**18);
        uint256 tokenAmount_9;
        uint256 tokenAmount_0;
        (tokenAmount_9, tokenAmount_0) = convertUSDtoCBR(lpAmountValueinUSD_112, tokenPriceinUSD_4);
        return (lpAmountValueinUSD_18, lpAmountValueinUSD_0, lpAmountValueinUSD_112_18, tokenAmount_9, tokenAmount_0);
    }
 
    function getInputLPvalue(uint256 lpValueinUSD_112_18_n, uint256 lpAmount_n) public pure returns(uint256, uint256, uint256){
        uint256 lpAmountValueinUSD_112_18 = lpValueinUSD_112_18_n * lpAmount_n;
        uint256 lpAmountValueinUSD_18 = lpAmountValueinUSD_112_18 / (2**112);
        uint256 lpAmountValueinUSD_0 = lpAmountValueinUSD_18 / (10**18);
        return(lpAmountValueinUSD_18, lpAmountValueinUSD_0, lpAmountValueinUSD_112_18);
    }

    function convertUSDtoCBR(uint256 USD_112, uint256 tokenPriceinUSD_4) public pure returns(uint256, uint256){
        uint256 tokenAmount_9 = USD_112 / tokenPriceinUSD_4 * (10**13) / (2**112);
        uint256 tokenAmount_0 = tokenAmount_9 / (10**9);
        return (tokenAmount_9, tokenAmount_0);
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


interface IKlayswapStore {
    function reserveA(address) external view returns (uint112);
    function reserveB(address) external view returns (uint112);
    function getReserves(address) external view returns(uint112 _reserveA, uint112 _reserveB, uint32 _blockTimestampLast);
    function priceACumulativeLast(address) external view returns(uint256);
    function priceBCumulativeLast(address) external view returns(uint256);
    function blockTimestampLast(address) external view returns(uint32);
    event Sync(address pool, uint112 reserveA, uint112 reserveB);
}

interface IKIP7 {
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