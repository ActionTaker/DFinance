import React, { useState, useEffect } from 'react';
import { Context } from '../context/Context'
import KlipModal from './KlipModal'

const AuctionSwap = () => {
    const [klayAmount, setKlayAmount] = useState()
    const [VTRAmount, setVTRAmount] = useState()
    const [genInfo, setGenInfo] = useState({})
    const [indInfo, setIndInfo] = useState({})
    const { getKlayToVTR, getAuctionSwapInfo, auctionSwap, klipVisible, klipTimer, setKlipVisible} = React.useContext(Context)

    const onKlayAmountChange = (e) => {
        if(e.target.value === ''){setKlayAmount(''); setVTRAmount('');}
        setKlayAmount(e.target.value);
        getKlayToVTR(setVTRAmount, e.target.value);
    }

    const _auctionSwap = async () =>
    {
        await auctionSwap(klayAmount);
        setKlayAmount('');
        setVTRAmount('');
        getAuctionSwapInfo(setGenInfo, setIndInfo)
    }

    const progressbar = {
        width: `${genInfo.percent}%`
    }
    
    useEffect(() => {

    getAuctionSwapInfo(setGenInfo, setIndInfo);

	}, [getAuctionSwapInfo]);

    return (
        <div className="p-1"> 
            <div className="rounded-lg bg-gray-100 w-full m-auto max-w-3xl mt-5 p-3 mb-5">
            <div className='flex justify-between text-lg w-full m-auto'><h1 className='text-gray-800'>Start/End time:</h1><h1 className='text-black font-semibold'>2022.Jul.24 15:00 (PST) ~ 2022.Jul.25 15:00 (PST)</h1>  </div>
                <div className="relative h-6 my-4 rounded-full bg-gray-300">
                        <div id="progress" style={progressbar} className={` ${!genInfo.percent && 'w-0' } h-6 rounded-full bg-white transition-all duration-1000`}></div>
                        <h4 className="absolute text-center w-full inline h-full inset-0 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 font-thin text-slate-600 text-md font-semibold">
                            {genInfo.percent}%
                        </h4>
                    </div>
                <div className='max-w-lg m-auto'>
                    <div className="w-full text-sm">
                        <div className='flex justify-between  m-auto'><h1 className='text-gray-500'>Funds to raise:</h1><h1 className='text-black font-semibold'>{genInfo.goal} KLAY</h1>  </div>
                        <div className='flex justify-between  m-auto'><h1 className='text-gray-500'>Swap ratio:</h1><h1 className='text-black font-semibold'>1 VTR = 0.1 KLAY</h1>  </div>
                        <div className='flex justify-between  m-auto'><h1 className='text-gray-500'>Total sold KLAY:</h1><h1 className='text-black font-semibold'>{genInfo.totalFund} KLAY</h1>  </div>
                        <div className='flex justify-between  m-auto'><h1 className='text-gray-500'>Status:</h1><h1 className='text-black font-semibold'>{genInfo.klayLeft} KLAY left / {genInfo.goal} KLAY</h1>  </div>
                    </div>
                </div>
            </div>

            <div className="rounded-lg max-w-3xl m-auto md:flex-1">
                <div className="flex-1 rounded-lg rounded-b-none md:rounded-b-none md:rounded-lg bg-gray-100 p-1">
                    <div className="p-3">
                        <p className="text-sm font-semibold text-stone-500 mb-4">From</p>
                        <div className="flex items-center">
                            <input
                                className="outline-none text-3xl text-gray-600 placeholder-slate-400 bg-gray-100 placeholder-font-light w-1 flex-grow"
                                type="number"
                                onChange={(e) => onKlayAmountChange(e)}
                                value={klayAmount}
                                placeholder="0"
                                step="0.0001" />
                            <img className="w-9" alt="" src="img/klaytntrans.png" />
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 my-4">Balance {indInfo.klayBalance}</p>
                            <p className="text-sm font-semibold">KLAY</p>
                        </div>

                    </div>
                    <div className="border-solid border-1 border-t border-gray-300"></div>
                    <div className="p-3">
                        <p className="text-sm mt-1 font-semibold text-stone-500 mb-4">To</p>
                        <div className="flex items-center">
                            <input
                                className="outline-none text-3xl text-gray-600 placeholder-slate-400 bg-gray-100 placeholder-font-light w-1 flex-grow"
                                type="number"
                                value={VTRAmount}
                                placeholder="0" />
                            <img className="w-9" alt="" src="img/vec.svg" />
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500 my-4">Balance</p>
                            <p className="text-sm font-semibold ml-2">VTR</p>
                        </div>
                    </div>
                </div>
                <div onClick={()=>{_auctionSwap()}}className="rounded-lg rounded-t-none md:rounded-t-none md:rounded-lg text-sm cursor-pointer hover:bg-slate-500 hover:text-black font-medium text-gray-100 flex justify-center items-center p-2 bg-slate-400">
                    <p className="text-lg">Swap</p>
                </div>
            </div>

            <div className="rounded-lg max-w-3xl m-auto mt-4">
                <div className="bg-gray-100 rounded-lg p-4 text-slate-800 flex-1 rounded-lg rounded-b-none bg-gray-100">
                    <div className="mb-2">
                        <p className="text-lg text-stone-500">Your Total Purchase Amount</p>
                        <p className="text-2xl font-bold">{indInfo.VTRBalance} VTR</p>
                    </div>
                </div>
                <div className="rounded-lg rounded-t-none text-lg cursor-pointer hover:bg-slate-500 hover:text-black font-medium text-gray-100 flex justify-center items-center p-1 bg-slate-400">
                    <p>Claim</p>
                </div>
            </div>
            <KlipModal onCloseKlip={() => setKlipVisible(false)} visible={klipVisible} countdownTimestampMs={klipTimer} />  
        </div>
    )
}

export default AuctionSwap
