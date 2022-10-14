// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;
import "./Ownable.sol";

//0x9831064C43987B8eB6D375Edb6Ff23015A78f377
//KLAY ETH : 0x27f80731dddb90c51cd934e9bd54bff2d4e99e8a
contract Bond is Ownable{
    

    address token;
    address stake;
    Oracle ORC;
    Twap TWP;
    address Treasury = 0x971D8389c8d04E9D0Ff91AbdD740cD11a21a2D42;
    address Team = 0x4f1C516E2087E7c9A9e15471fFc5772d649f77C7;
    address KSP = 0x068741f96635B8174C6A89802b91d1746Da2fc15;

    bool fixedPriceMode = false; // 가격 수동모드 자동모드.
    bool marketPriceMode = true;
    uint256 fixedPrice_4 = 10000;
    uint256 totalSold = 1;
    //오라클 연동하기
    // 할인율, 세일중인지, 시장가, 할인가
    struct Pair{
        uint256 pairSold;
        uint256 discountRate_6; //ex 10000000 -> 10 %
        bool onSale;
    }
    
    constructor(address _token, address _stake, address _oracle, address _twap) {
        token = _token;
        stake = _stake;
        ORC = Oracle(_oracle);
        TWP = Twap(_twap);
    }
    mapping(address => Pair) pairInfo; //세일중인지, 
    //시장가는 oracle 에서 불러오기!
 
    function pairSold(address pair, uint256 amount) public{
        pairInfo[pair].pairSold += amount;
        totalSold += amount; // in VTR
    }

    function discountRate(address pair) public view returns(uint256){  // 지정된 할인율 플마 1 퍼 계산기
        uint256 discountRate_6 = pairInfo[pair].discountRate_6 + pairInfo[pair].pairSold * (10**6)/totalSold;
        return discountRate_6;
    }
    //할인률
    function realTimeDiscountRate(address pair)public view returns(int256){ //시장가에서 할인된가격 (시장가 - 본딩가)/시장가 = 할인율
        int256 discountedPrice_4 = int256(discountedPrice(pair)); //
        uint256 marketPriceinUSD_18;
        (marketPriceinUSD_18, , , , ) = ORC.getRatioWithToken(KSP);
        int256 marketPriceinUSD_4 = int256(marketPriceinUSD_18 / (10**14));
        int256 priceDiff_4 = marketPriceinUSD_4 - discountedPrice_4;
        int256 priceDiff_10 = priceDiff_4 * (10**6);
        int256 realTimeDiscountRate_6 = priceDiff_10 / marketPriceinUSD_4;
        return realTimeDiscountRate_6;
    }
    function addOrEditBond(address pair, uint256 _discountPriceRate_6, bool _onSale)public onlyOwner{
        pairInfo[pair].discountRate_6 = _discountPriceRate_6;
        pairInfo[pair].onSale = _onSale;
    }
    

    //할인가
    function discountedPrice(address pair)public view returns(uint256){  // 본딩가격 => 시장가, 오라클, 지정가 * 지정된 할인율
        uint256 tokenPriceinUSD_4;
        if(fixedPriceMode) tokenPriceinUSD_4 = fixedPrice_4; // 지정가모드라면              //지정가모드-시장가모드(진짜 시장가, 오라클)
        else{
            if(marketPriceMode){ // 찐시장가모드라면
                uint256 marketPriceinUSD_18;
                (marketPriceinUSD_18, , , , ) = ORC.getRatioWithToken(KSP); // for now 나중에 꼭바꾸짜!!!
                tokenPriceinUSD_4 = marketPriceinUSD_18 / (10**14);
            }
            else
            {
                uint256 tokenPriceinUSD_18;
                tokenPriceinUSD_18 = TWP.twap(token, 1000000000000000000);  // TWAP 가져온다. // 나중에 바꾸자!!!!!!!!!!!!!!!!!!!!
                tokenPriceinUSD_4 = tokenPriceinUSD_18 / (10**14);
            } 
        }
        uint256 discountPriceRate_6 = 100000000 - discountRate(pair);
        return tokenPriceinUSD_4 * discountPriceRate_6 / 100000000;
    }



    function swapExactLPtoToken(address pair, uint256 lpAmount_n )public {   // ** 슬리피지 나중에 추가
        require(pairInfo[pair].onSale == true);
        uint256 bondingPrice_4 = discountedPrice(pair);
        uint256 tokenAmount_9;
        ( , , , tokenAmount_9, ) = ORC.getInputLPValueTokenAmount(pair, lpAmount_n, bondingPrice_4);
        pairInfo[pair].pairSold += tokenAmount_9;
        totalSold += tokenAmount_9;
        IKIP7(pair).transferFrom(msg.sender, Treasury, lpAmount_n*9/10);
        IKIP7(pair).transferFrom(msg.sender, Team, lpAmount_n/10);
        IKIP7(token).mint(msg.sender, tokenAmount_9); // mint agent 설정
        Stake(stake).stake(tokenAmount_9, 1, msg.sender);
    } 

    function setTW(address _treasury) public onlyOwner{
        Treasury = _treasury;
    }
    function setKSP(address _token) public onlyOwner {
        KSP = _token;
    }
    function setToken(address _token) public onlyOwner {
        token = _token;
    }
    function setStake(address _stake)public onlyOwner{
        stake = _stake;
    }
    function setFixedPriceMode(bool value) public onlyOwner{
        fixedPriceMode = value;
    }
    function setMarketPriceMode(bool value) public onlyOwner{
        marketPriceMode = value;
    }
    function setFixedPrice(uint256 value) public onlyOwner{
        fixedPrice_4 = value;
    }
}

//** TWAP 오라클 추가 꼭하기

interface Oracle{
    function getRatioWithStable(address stablePair) external view returns(uint256, uint256, uint256, uint256, uint256);  //return(token0inUSD_18, token0inUSD_0, token0inUSD_112, reserve0_18, reserve1_18);
    function getInputLPValueTokenAmount(address pair, uint256 lpAmount_n, uint256 tokenPriceinUSD_4) external view returns(uint256, uint256, uint256, uint256, uint256);
    function getRatioWithToken(address token) external view returns(uint256, uint256, uint256, uint256, uint256) ;
    // return (lpAmountValueinUSD_18, lpAmountValueinUSD_0, lpAmountValueinUSD_112_18, tokenAmount_9, tokenAmount_0);
}
interface Twap{
    function twap(address _token, uint256 _amountIn) external view returns (uint256 _amountOut);
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
