// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;
import "./Ownable.sol";
/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */
 //0x3B85987a6459ebCDF2092402ba2E6C6b47647f58
contract Stake is Ownable{
    IKIP7 CBR;   //TOKEN


    uint256 private constant MAX_UINT256 = type(uint256).max;
    uint256 private constant INITIAL_FRAGMENTS = 5_000_000_000 * 10**9;
    uint256 private constant TOTAL_GONS = MAX_UINT256 - (MAX_UINT256 % INITIAL_FRAGMENTS);

    
    /************FRONT END DATA**************/
     struct FrontGenInfo {
        uint256 rRound;
        uint256 rTotalSupply;
        uint256 rIndex;
        uint256 rSecondLeft;
        uint256 rate;
    }

    struct FrontIndInfo {
        uint256[3] rIndRound;
        uint256 rBalance;
        uint256 cbrBalance;
    }
    /************FRONT END DATA END**************/

 

    /************BACK END DATA*************/
    address auctionSwap;
    uint256 internal INDEX; // Index Gons - tracks rebase growth

    uint256 roundStartTime = 1660863600;
    uint256 roundDuration = 28800;
    uint256 lastUpdateRound = 1;
    uint256 currentRate = 10030;
    uint256 private _gonsPerFragment;
    uint256 private _fragment;
    uint256 private _totalGonSupply;

    uint8[] roundType = [2, 4, 6];


    mapping(address => mapping(uint8 => uint256)) private _startRound;
    mapping(address => uint256) private _totalGon;
    mapping(address => mapping(uint8 => uint256)) private _gonLockedBalances;
    mapping(address => uint256) private _gonUnlockedBalances;


    /************BACK END DATA*************/

//1659341400

    constructor(address _tokenAddress) {
        roundStartTime = 1660863600;
        CBR = IKIP7(_tokenAddress);
        _fragment = INITIAL_FRAGMENTS;
        _gonsPerFragment = TOTAL_GONS/_fragment;
        INDEX = (10**9) * _gonsPerFragment;

    }
    //TOTAL_GONS 는 분자 _totalSupply는 분모로 생각하자
    /********STAKE UNSTAKE REBASE***********/
    function rebase() public {
        _fragment = rFragment();
        _gonsPerFragment = TOTAL_GONS / _fragment;
        lastUpdateRound = rRound();
    }


    function transferToClaimable() public {
        for(uint8 i = 0; i < 3; i++){
            if(_startRound[msg.sender][i] + roundType[i] < rRound()){
                _gonUnlockedBalances[msg.sender] += _gonLockedBalances[msg.sender][i];
                _gonLockedBalances[msg.sender][i] = 0;
            }
        }
    }


    function stake(uint256 amount, uint8 stakeType, address user) payable public {  //type 에 따라 컨트렉 제한걸기
        require(CBR.balanceOf(user) >= amount);
   
        if(lastUpdateRound < rRound()) rebase();
        transferToClaimable();

        CBR.burn(user, amount);
        if(rRound() == 0) _startRound[user][stakeType] = 1;
        else _startRound[user][stakeType] = rRound();
        uint256 senderGons = amountToGons(amount);
        _gonLockedBalances[user][stakeType] += senderGons;
        _totalGon[user] += senderGons;
        _totalGonSupply += senderGons;
    }

    function unstake(uint256 amount) public {
        if(lastUpdateRound != rRound()) rebase();
        transferToClaimable();

        uint256 senderGons = amountToGons(amount);
        require(senderGons <= _gonUnlockedBalances[msg.sender]);
        _gonUnlockedBalances[msg.sender] -= senderGons;
        _totalGon[msg.sender] -= senderGons;

        CBR.mint(msg.sender, amount);
        _totalGonSupply -= senderGons;
    }

    function setRoundType(uint8 _stake, uint8 _bond, uint8 _auctionSwap) public onlyOwner{
        roundType[0] = _stake;
        roundType[1] = _bond;
        roundType[2] = _auctionSwap;
    }

    function setStartTime(uint256 time) public onlyOwner{
        roundStartTime = time;
    }

    function setRate(uint256 rate) public onlyOwner {
        currentRate = rate;
    }
    function setDuration(uint256 duration) public onlyOwner {
        roundDuration = duration;
    }
    function setlastUpdateRound(uint256 _lastupdateRound) public onlyOwner {
        lastUpdateRound = _lastupdateRound;
    }
        /********STAKE UNSTAKE REBASE***********/




    
    /******************** Internal view Ind***************/

    function claimableAmount() public view returns(uint256){
        uint256 gonsAmount;

        for(uint8 i = 0; i < 3; i++){
            if(_startRound[msg.sender][i] + roundType[i] < rRound()) gonsAmount += _gonLockedBalances[msg.sender][i];
        }

        return gonsToAmount(gonsAmount + _gonUnlockedBalances[msg.sender]);
    }

    function lockedAmount() public view returns(uint256){
        uint256 gonsAmount;

        for(uint8 i = 0; i < 3; i++){
            if(_startRound[msg.sender][i] + roundType[i] >= rRound()) gonsAmount += _gonLockedBalances[msg.sender][i];
        }

        return gonsToAmount(gonsAmount);
    }

    function lockedAmountInd() public view returns(uint256[3] memory){
        uint256[3] memory round = rIndRoundforLocked();
        uint256[3] memory amountLocked;
        for(uint8 i = 0; i < 3; i++){
            if(round[i] > 0) 
                amountLocked[i] = gonsToAmount(_gonLockedBalances[msg.sender][i]);
            else
                amountLocked[i] = 0;
        }
        return amountLocked;
    }

    function rIndRoundforLocked() public view returns(uint256[3] memory) { //will return 0 if its unlocked or doesnt have balance
        
        uint256[3] memory round;
        for(uint8 i = 0; i < 3; i++){
            if(_gonLockedBalances[msg.sender][i] != 0)
            {
                if(_startRound[msg.sender][i] == 0)
                    round[i] = 1;
                else if(_startRound[msg.sender][i] + roundType[i] < rRound())
                    round[i] = 0;
                else
                    round[i] = rRound() - _startRound[msg.sender][i] + 1;
            }
            else
            {
                round[i] = 0;
            }
        }
        return round;

    }

    function balanceOf(address who) public view returns (uint256) {
        return _totalGon[who] /rGonsPerFragment();
    }
    /******************** Internal view Ind END ***************/

    /********************** External view ***************/
     function decimals() public view virtual returns (uint8) {
        return 9;
    }
    function showlastupdateround() external view returns(uint256){
        return lastUpdateRound;
    }
    function showRFrac() external view returns(uint256){
        return rFragment();
    }
    function getFrontGenInfo() external view returns(FrontGenInfo memory) {

        FrontGenInfo memory frontGenInfo;

        frontGenInfo.rRound = rRound();
        frontGenInfo.rTotalSupply = totalSupply();
        frontGenInfo.rIndex = rIndex();
        frontGenInfo.rSecondLeft = rSecondLeft();
        frontGenInfo.rate = currentRate;

        return(frontGenInfo);
    }
    function getFrontInd() external view returns(uint256, uint256, uint256[3] memory, uint256[3] memory, uint256, uint256){ //대장
        uint256 claimable = claimableAmount();
        uint256 locked = lockedAmount();
        uint256[3] memory lockedInd = lockedAmountInd();
        uint256[3] memory lockedRound = rIndRoundforLocked();
        uint256 CBRBalance = CBR.balanceOf(msg.sender);
        uint256 sCBRBalance = balanceOf(msg.sender);
        return(claimable, locked, lockedInd, lockedRound, CBRBalance, sCBRBalance);
    }
    
    function getFrontIndInfo() external view returns(FrontIndInfo memory){

        FrontIndInfo memory frontIndInfo;

        frontIndInfo.rIndRound = rIndRoundforLocked();
        frontIndInfo.rBalance = balanceOf(msg.sender);
        frontIndInfo.cbrBalance = CBR.balanceOf(msg.sender);

        return(frontIndInfo);
    }


























        /******************** Internal view Gen***************/
    function rRound() public view returns(uint256) // 절대라운드시간.
    {
        if(block.timestamp < roundStartTime) return 1;
        return ((block.timestamp - roundStartTime) / roundDuration + 1);
    }
    function rSecondLeft() internal view returns(uint256){
        if(block.timestamp < roundStartTime) return 0;
        return roundDuration - ((block.timestamp - roundStartTime) % roundDuration);
    }
    function rFragment() internal view returns(uint256) {

        uint256 roundDiff;
        if(block.timestamp < roundStartTime) roundDiff = 0;
        else roundDiff = rRound() - lastUpdateRound;
        uint256 temFragment = _fragment;
        if (roundDiff != 0) {
            for (uint256 i = 0; i < roundDiff; i++) {
                temFragment = temFragment * currentRate / 10000;
            }
            return temFragment;
        } else {
            return _fragment;
        }
    }
    function rIndex() public view returns(uint256)
    {
        return gonsToAmount(INDEX);
    }

    function rGonsPerFragment() public view returns (uint256) {
        return TOTAL_GONS / rFragment();
    }

    function getCurrentRate() public view returns (uint256) {
        return currentRate;
    }

    function totalSupply() public view returns (uint256) {
        return _totalGonSupply / rGonsPerFragment();
    }

    function gonsToAmount(uint256 gons) view internal returns (uint256){
        return (gons / rGonsPerFragment());
    }

    function amountToGons(uint256 amount) view internal returns (uint256){
        return (amount * rGonsPerFragment());
    }
}


interface IKIP7 {
    function mint(address who, uint256 amount) external;
    function burn(address who, uint256 amount) external;
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
