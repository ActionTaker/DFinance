import React, { useState, useEffect } from 'react';
import {Context} from '../context/Context'
import Skel from './Skel'
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import TermsModal from './TermsModal';
import WalletModal from './WalletModal';
import KlipModal from './KlipModal';

function Stake() {

    const [first, setFirst] = useState(false);
    const [stakeAmount, setStakeAmount] = useState()
    const [genInfo, setGenInfo] = useState([]);
    const [indInfo, setIndInfo] = useState([]);
    const [stakeMenu, setStakeMenu] = useState(true);
    const [lockedInfo, setlockedInfo] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const {getStakeInfo, stake, unstake, newNet, klipTimer, klipVisible, setKlipVisible} = React.useContext(Context)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const handleonClose = () => setShowTermsModal(false)
    const [showWalletModal, setShowWalletModal] = useState(false)
    const handleonCloseWallet = () => setShowWalletModal(false)
    const [showKlipModal, setShowKlipModal] = useState(false)
    const handleonCloseKlip = () => setShowKlipModal(false)

    const onStakeChange = (e) => {
        setStakeAmount(e.target.value);
    }
    const _unstake = async () =>
    {
        await unstake(stakeAmount);
        setStakeAmount('');
        getStakeInfo(setGenInfo, setIndInfo)
    }
    const _stake = async () =>
    {
        await stake(stakeAmount, 0);
        setStakeAmount('');
        getStakeInfo(setGenInfo, setIndInfo)
    }
  
   useEffect(() => {
    const _getStakeInfo = async () =>
    {
        await getStakeInfo(setGenInfo, setIndInfo)
        setLoadingData(false);
    }
    _getStakeInfo()
    const countdown = setInterval(()=>{
        _getStakeInfo()
        console.log("hi")
    }, 60000);
    setFirst(true)
    return () => clearInterval(countdown);

  }, [getStakeInfo, newNet]);

  const progressbar = {
    width: `${genInfo.secondLeftPercent0}%`
  }

	return (
		<div className="p-1 flex space-y-4 flex-col">
            
			<div className={`w-full p-4 bg-gray-100 rounded-lg max-w-3xl m-auto ${first? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                
                <div className="w-full flex justify-between mb-4">
                    
                    <div>
                        <h2 className="-mb-1 font-extrabold text-lg">Single Stake (3,3)</h2>

                    </div>

                    <div className="relative bg-gray-300 rounded-xl w-44 p-1 h-7 shadow-lg">
                        <h4 className="absolute text-center w-full inline inset-0 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 font-thin text-xs">  
                            <span className="font-semibold">{genInfo.secondToHM}</span> <span>to rebase</span>
                        </h4>
                        
                        <div style={progressbar} className={` ${loadingData && 'w-0'} transition-all duration-1000 h-5 rounded-xl bg-gray-100`}></div>
                    </div>
                        
                </div>
				<div className="flex flex-col items-center gap-y-3">
					<div className="flex flex-col items-center gap-y-3 md:flex-row md:justify-around md:w-full">
						<div className="flex flex-col -space-y-1 items-center md:flex-1 ">
							<p className="font-normal text-xl text-gray-500">Round</p>
							<p className="font-bold text-lg"> {loadingData  ? <Skel/> : genInfo.round}</p>
						</div>
						<div className="flex flex-col -space-y-1 items-center md:flex-1 ">
							<p className="font-normal text-xl text-gray-500">
								Total Value Locked
							</p>
							<p className="font-bold text-lg">${loadingData  ? <Skel/> : genInfo.totalSupply*getStakeInfo.getKSPValue}</p>
						</div>
						<div className="flex flex-col -space-y-1 items-center md:flex-1 ">
							<p className="font-normal text-xl text-gray-500">Current Index</p>
							<p className="font-bold text-lg">{loadingData  ? <Skel/> : genInfo.index} VTR</p>
                        
						</div>
					</div>
					<div className="flex flex-col items-center">
                        
						
						
                        
					</div>
				</div>
			</div>

      
			<div className={`w-full flex flex-col items-center p-4 pb-9 bg-gray-100 rounded-lg max-w-3xl m-auto ${first? 'scale-100' : 'scale-0'} transition-all duration-700`}>
				<div className="w-full flex justify-center space-x-3">
					<p onClick={()=>{setStakeMenu(true); setStakeAmount('');}} className={`border-b-4  cursor-pointer hover:text-gray-400 ${stakeMenu ? 'border-slate-600 font-bold' : 'border-gray-100'}`}>Stake</p>
					<p onClick={()=>{setStakeMenu(false); setStakeAmount('');}} className={`border-b-4 cursor-pointer hover:text-gray-400 ${!stakeMenu ? 'border-slate-600 font-bold' : 'border-gray-100'}`}>Unstake</p>
				</div>
                <div className="w-full h-12 px-3 py-1 flex bg-gray-300 items-center rounded-lg mt-4 max-w-md m-auto hover:border-gray-600 border-solid border border-gray-300">
                    <input
                        placeholder={`Amount(${!stakeMenu ? 's' : ''}VTR)`}
                        type="number"
                        step="0.0001"
                        value={stakeAmount}
                        onChange={(e) => onStakeChange(e)}
                        className="outline-none text-xl text-gray-600 placeholder-slate-400 placeholder-font-light bg-gray-300 h-full w-1 flex-grow"
                    />
					<p onClick={()=>{stakeMenu ? setStakeAmount(indInfo.cbrExactAmount) : setStakeAmount(indInfo.claimableExactAmount)}} className="ml-2 text-slate-500 hover:text-slate-900 cursor-pointer">Max</p>
				</div>
                {!(localStorage.getItem('address'))? (<div onClick={()=>{setShowTermsModal(true);}} className="cursor-pointer bg-slate-400 hover:bg-slate-500 transition-all duration-200 hover:text-black py-3 px-12 text-white text-lg font-normal m-4 rounded-lg">
							Connect Wallet
						</div>) :(<div onClick={()=>{stakeMenu? _stake() : _unstake()}} className="text-center transition-all duration-200 hover:bg-slate-500 hover:text-black cursor-pointer bg-slate-400 py-3 px-12 text-white text-lg font-normal mt-4 rounded-lg">
							{stakeMenu? 'Stake' : 'Unstake'}
						</div>) }
                
        
        <div className="my-5 border-solid border-1 border-t border-gray-400 w-full max-w-md"></div>

    
        <div className="w-full text-sm flex justify-between items-center max-w-md m-auto">
          <p>Unstaked Balance</p>
          <p className="text-gray-500">{loadingData ? <Skel/> : indInfo.cbrAmount} VTR</p>
        </div>

        <div className="w-full text-sm flex justify-between items-center max-w-md m-auto">
          <p>Claimable Amount</p>
          <p className="text-gray-500">{loadingData ? <Skel/> : indInfo.claimableAmount} VTR</p>
        </div>

        <div className="w-full text-sm flex justify-between items-center max-w-md m-auto">
            <div className="flex items-center">
                <p>Locked Amount</p>
                <FontAwesomeIcon icon={lockedInfo ? (faChevronUp) : (faChevronDown)} onClick={()=>{setlockedInfo(!lockedInfo)}}className="cursor-pointer ml-1 text-slate-400 hover:text-slate-300"/>
            </div>
            <p className="text-gray-500">{loadingData ? <Skel/> : indInfo.lockedAmount} sVTR</p>
        </div>

        {lockedInfo && (<div className="flex w-full max-w-md m-auto p-1">
            <div className="border-solid border-2 border-l border-gray-400"></div>
            <div className="flex-1 ml-2 w-full text-sm max-w-md m-auto">
                {loadingData ? <Skel/> : !(indInfo.roundArray[0] === '0')&&
                    (<div className="w-full flex justify-between items-center">
                        <p> Standard Stake <span className="text-stone-500">({loadingData ? <Skel/> : indInfo.roundArray[0]} Round)</span></p>
                        <p className="text-gray-500">{loadingData ? <Skel/> : indInfo.lockedAmountArray[0]} sVTR</p>
                    </div>)
                }
                {loadingData ? <Skel/> : !(indInfo.roundArray[1] === '0')&&
                    (<div className="w-full flex justify-between items-center">
                        <p> Bond <span className="text-stone-500">({loadingData ? <Skel/> : indInfo.roundArray[1]} Round)</span></p>
                        <p className="text-gray-500">{loadingData ? <Skel/> : indInfo.lockedAmountArray[1]} sVTR</p>
                    </div>)
                }   
                {loadingData ? <Skel/> : !(indInfo.roundArray[2] === '0')&&
                    (<div className="w-full flex justify-between items-center">
                        <p> Auction Swap <span className="text-stone-500">({loadingData ? <Skel/> : indInfo.roundArray[2]} Round)</span></p>
                        <p className="text-gray-500">{loadingData ? <Skel/> : indInfo.lockedAmountArray[2]} sVTR</p>
                    </div>)
                }
            </div>
        </div>)
        }   

        <div className="my-5 border-solid border-1 border-t border-gray-400 w-full max-w-md"></div>
        <div className="w-full text-sm flex justify-between items-center max-w-md m-auto">
          <p>Next Reward Amount</p>
          <p className="text-gray-500">{loadingData ? <Skel/> : (((indInfo.sCBRBalance) * genInfo.rate / 100)).toFixed(4)} VTR</p>
        </div>
        <div className="w-full text-sm flex justify-between items-center max-w-md m-auto">
          <p>Next Reward Yield</p>
          <p className="text-gray-500">{loadingData ? <Skel/> : genInfo.rate} %</p>
        </div>
        <div className="w-full text-sm flex justify-between items-center max-w-md m-auto">
          <p>ROI (5-Day Rate)</p>
          <p className="text-gray-500">{loadingData ? <Skel/> : genInfo.roi} %</p>
        </div>
			</div>
            <div>
            <TermsModal onClose={handleonClose} visible={showTermsModal} walletVisible={setShowWalletModal}/>
            <WalletModal onCloseWallet={handleonCloseWallet} visible={showWalletModal} klipShow={() => setKlipVisible(true)} /> 
            <KlipModal onCloseKlip={() => setKlipVisible(false)} visible={klipVisible} countdownTimestampMs={klipTimer} />  
            </div>
        </div>
        
	);
}
export default Stake;