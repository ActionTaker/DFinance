// SPDX-License-Identifier: MIT
pragma solidity 0.5.6;

//twap : 0xc9aE641314362e4541A9C5164b14B9c88e3e0C61  


// fixed window oracle that recomputes the average price for the entire period once every period
// note that the price average is only guaranteed to be over at least 1 period, but may be over a longer period
contract OracleKlayswap {
    using FixedPoint for *;
    using SafeMath for uint256;

    /* ========== STATE VARIABLES ========== */

    // klayswap
    IKlayswapStore public store;
    address public token0;
    address public token1;
    address public pair;

    uint256 public PERIOD = 30;

    uint32 public blockTimestampLast;
    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    FixedPoint.uq112x112 public price0Average;
    FixedPoint.uq112x112 public price1Average;

    uint256 public token0Decimals;
    uint256 public token1Decimals;

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _store,
        address _pair,
        uint256 _period
    ) public {
        store = IKlayswapStore(_store);        
        pair = _pair;
        PERIOD = _period;
        token0 = IKlayExchange(pair).tokenA();
        token1 = IKlayExchange(pair).tokenB();
        token0Decimals = IKIP7(token0).decimals();
        token1Decimals = IKIP7(token1).decimals();

        price0CumulativeLast = store.priceACumulativeLast(pair);
        price1CumulativeLast = store.priceBCumulativeLast(pair);
        blockTimestampLast = store.blockTimestampLast(pair);        

        uint112 reserve0_;
        uint112 reserve1_;
        (reserve0_, reserve1_, ) = store.getReserves(pair);
        require(reserve0_ != 0 && reserve1_ != 0, "Oracle: NO_RESERVES"); // ensure that there's liquidity in the pair
    }

    function _update() private view returns (uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp) {
        price0Cumulative = store.priceACumulativeLast(pair);
        price1Cumulative = store.priceBCumulativeLast(pair);
        blockTimestamp = store.blockTimestampLast(pair);
    }

    /* ========== MUTABLE FUNCTIONS ========== */

    function updatePeriod(uint256 period) external { //only owner 추가하기
        PERIOD = period;
    }
    /** @dev Updates 1-day EMA price from Uniswap.  */
    function update() external  {        
        (uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp) = _update();
        
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        require(timeElapsed >= PERIOD, 'ExampleOracleSimple: PERIOD_NOT_ELAPSED');
        

        // overflow is desired, casting never truncates
        // cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
        price0Average = FixedPoint.uq112x112(uint224((price0Cumulative - price0CumulativeLast) / timeElapsed));
        price1Average = FixedPoint.uq112x112(uint224((price1Cumulative - price1CumulativeLast) / timeElapsed));

        price0CumulativeLast = price0Cumulative;
        price1CumulativeLast = price1Cumulative;
        blockTimestampLast = blockTimestamp;

        emit Updated(price0CumulativeLast, price1CumulativeLast);
    }

    // note this will always return 0 before update has been called successfully for the first time.
    function consult(address _token, uint256 _amountIn) external view returns (uint256 _amountOut) {
        if (_token == token0) {
            _amountOut = price0Average.mul(_amountIn.mul(10**(18-token1Decimals))).decode144();
        } else {
            require(_token == token1, "Oracle: INVALID_TOKEN");
            _amountOut = price1Average.mul(_amountIn.mul(10**(18-token0Decimals))).decode144();
        }
    }
    
    function twap(address _token, uint256 _amountIn) external view returns (uint256 _amountOut) {
        (uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp) = _update();
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        if (timeElapsed > 0) {
            if (_token == token0) {
                _amountOut = FixedPoint.uq112x112(uint224((price0Cumulative - price0CumulativeLast) / timeElapsed)).mul(_amountIn.mul(10**(18-token1Decimals))).decode144();
            } else if (_token == token1) {
                _amountOut = FixedPoint.uq112x112(uint224((price1Cumulative - price1CumulativeLast) / timeElapsed)).mul(_amountIn.mul(10**(18-token0Decimals))).decode144();
            }
        }
        else {
            if (_token == token0) {
                _amountOut = price0Average.mul(_amountIn.mul(10**(18-token1Decimals))).decode144();
            } else {
                _amountOut = price1Average.mul(_amountIn.mul(10**(18-token0Decimals))).decode144();
            }
        }
    }

    event Updated(uint256 price0CumulativeLast, uint256 price1CumulativeLast);
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

library FixedPoint {

    struct uq112x112 {
        uint224 _x;
    }

    struct uq144x112 {
        uint256 _x;
    }

    uint8 private constant RESOLUTION = 112;
    uint256 private constant Q112 = uint256(1) << RESOLUTION;
    uint256 private constant Q224 = Q112 << RESOLUTION;

    function encode(uint112 x) internal pure returns (uq112x112 memory) {
        return uq112x112(uint224(x) << RESOLUTION);
    }

    // encodes a uint144 as a UQ144x112
    function encode144(uint144 x) internal pure returns (uq144x112 memory) {
        return uq144x112(uint256(x) << RESOLUTION);
    }

    // divide a UQ112x112 by a uint112, returning a UQ112x112
    function div(uq112x112 memory self, uint112 x) internal pure returns (uq112x112 memory) {
        require(x != 0, "FixedPoint: DIV_BY_ZERO");
        return uq112x112(self._x / uint224(x));
    }

    // multiply a UQ112x112 by a uint, returning a UQ144x112
    // reverts on overflow
    function mul(uq112x112 memory self, uint256 y) internal pure returns (uq144x112 memory) {
        uint256 z;
        require(y == 0 || (z = uint256(self._x) * y) / y == uint256(self._x), "FixedPoint: MULTIPLICATION_OVERFLOW");
        return uq144x112(z);
    }

    // returns a UQ112x112 which represents the ratio of the numerator to the denominator
    // equivalent to encode(numerator).div(denominator)
    function fraction(uint112 numerator, uint112 denominator) internal pure returns (uq112x112 memory) {
        require(denominator > 0, "FixedPoint: DIV_BY_ZERO");
        return uq112x112((uint224(numerator) << RESOLUTION) / denominator);
    }

    // decode a UQ112x112 into a uint112 by truncating after the radix point
    function decode(uq112x112 memory self) internal pure returns (uint112) {
        return uint112(self._x >> RESOLUTION);
    }

    // decode a UQ144x112 into a uint144 by truncating after the radix point
    function decode144(uq144x112 memory self) internal pure returns (uint144) {
        return uint144(self._x >> RESOLUTION);
    }

    // take the reciprocal of a UQ112x112
    function reciprocal(uq112x112 memory self) internal pure returns (uq112x112 memory) {
        require(self._x != 0, "FixedPoint: ZERO_RECIPROCAL");
        return uq112x112(uint224(Q224 / self._x));
    }

  
}



library SafeMath {

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }


    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }


    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
       
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

  
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
       
        require(b > 0, errorMessage);
        uint256 c = a / b;

        return c;
    }


}