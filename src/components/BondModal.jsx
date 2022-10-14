import React, { useEffect, useState } from 'react';
import {faX, faGear, faArrowDown} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {Context} from '../context/Context'

function BondModal(pair) {
	const [first, setFirst] = useState(false);
    const [setting, setSetting] = useState(false);
    const [slippage, setSlippage] = useState();
    const [lpAmount, setlpAmount] = useState();
    const [allowance, setAllowance] = useState(false);
    const [CBRAmount, setCBRAmount] = useState();
    const [balanceInfo, setBalanceInfo] = useState({});
    const [lpinUSD, setLPinUSD] = useState();
    const {connectWallet, getLPValueCBRAmount, getUserStableLPvalue, getRealTimeDiscountRatePrice, bond, approve, getAllowance} = React.useContext(Context);
    const [bondPriceInfo, setBondPriceInfo] = useState({});
    const address = localStorage.getItem('address');

    const _bond = async () =>
    {
        await bond(pair.address, lpAmount, pair.decimals);
    }
    const onSlippageChange = (e) => {
        setSlippage(e.target.value);
    }
    const onLPAmountChange = (e) => {
        setlpAmount(e.target.value);
        if(e.target.value === ''){setLPinUSD(''); setCBRAmount('');}
        getLPValueCBRAmount(pair.decimals, pair.address, e.target.value, bondPriceInfo.price, setCBRAmount, setLPinUSD, allowance);
    }
    const onCBRAmountChange = (e) => {
        setCBRAmount(e.target.value);
    }
    const _approve = async () =>
    {
        await approve(pair.address)
        
        getAllowance(pair.address, setAllowance)
        console.log(allowance)
    }

	useEffect(() => {
		setFirst(true);
        getUserStableLPvalue(pair.decimals, pair.address, setBalanceInfo)
        getRealTimeDiscountRatePrice(pair.address, setBondPriceInfo)
        getAllowance(pair.address, setAllowance)

	}, [getUserStableLPvalue, getRealTimeDiscountRatePrice, pair.address, pair.decimals, getAllowance, allowance]);
	return (
		<div
			onClick={e => {
				pair.setActive(!pair.active);
				e.stopPropagation();
			}}
			className="fixed inset-0 z-50 h-full w-screen bg-black/60 backdrop-blur"
		>
			<div
				onClick={e => {
					e.stopPropagation();
				}}
				className={`relative shadow-lg shadow-black p-3 top-1/2 -translate-y-1/2 inset-0 w-11/12 m-auto bg-gray-100 rounded-xl max-w-2xl ${
					first ? 'scale-100' : 'scale-0'
				} transition-all duration-500`}
			>
                {setting ? (
                <>
                    <div className="flex justify-between items-center p-5">
                        <div  />
                        <p className="font-semibold">Adjust Slippage</p>
                        <FontAwesomeIcon icon={faX} onClick={()=>{setSetting(false)}} className="cursor-pointer hover:text-slate-400"/>
                    </div>
                    <div className="px-5 flex flex-col items-center w-full">
                        <p className="text-slate-500 text-sm mb-5">
                            Important: Recommended slippage is 1-5% to avoid a failed transaction.
                        </p>
                        <div className="w-full rounded-md h-12 hover:rounded-md flex items-center text-2xl bg-gray-200 px-6 hover:border-gray-600 border-solid border border-gray-300">
                            <input
                                placeholder=""
                                type="number"
                                step="0.1"
                                value={slippage}
                                onChange={(e) => onSlippageChange(e)}
                                className="outline-none placeholder-slate-700 text-gray-600 bg-gray-200 h-full w-1 flex-grow"
                            />
                            <p className="pl-2 text-gray-600 bg-gray-200">%</p>
                        </div>
                        <div className="flex w-full justify-between space-x-5 m-5">
                            <div onClick={()=>{setSlippage(1.0)}}className="rounded-md transition-all duration-200 hover:bg-slate-600 cursor-pointer hover:text-black text-center text-white bg-slate-400 p-2 flex-1">1%</div>
                            <div onClick={()=>{setSlippage(2.0)}} className="rounded-md transition-all duration-200 hover:bg-slate-600 cursor-pointer hover:text-black text-center text-white bg-slate-400 p-2 flex-1">2%</div>
                            <div onClick={()=>{setSlippage(3.0)}} className="rounded-md transition-all duration-200 hover:bg-slate-600 cursor-pointer hover:text-black text-center text-white bg-slate-400 p-2 flex-1">3%</div>
                            <div onClick={()=>{setSlippage(4.0)}} className="rounded-md transition-all duration-200 hover:bg-slate-600 cursor-pointer hover:text-black text-center text-white bg-slate-400 p-2 flex-1">4%</div>
                            <div onClick={()=>{setSlippage(5.0)}} className="rounded-md transition-all duration-200 hover:bg-slate-600 cursor-pointer hover:text-black text-center text-white bg-slate-400 p-2 flex-1">5%</div>
                        </div>
                        <div onClick={()=>{setSetting(false)}} className="bg-slate-300 rounded-md px-7 py-2 text-center text-gray-600 cursor-pointer hover:bg-slate-600 hover:text-white transition-all duration-200">
                            Adjust Slippage
                        </div>
                    </div>
                </>) : (
                <>
                    <div className="mb-4 flex justify-between">
                        <div
                            className="cursor-pointer text-slate-700 hover:text-slate-400"
                            onClick={() => {
                                pair.setActive(!pair.active);
                            }}
                        >
                            <FontAwesomeIcon icon={faX}/>
                        </div>
                        <div>
                            <div className="flex items-center">
                                <img className="w-9 h-9" src={pair.token1img} alt="description of ge"/>
                                <img
                                    className="relative transform -translate-x-3 w-9 h-9"
                                    src={pair.token2img}
                                    alt="description of ge"
                                />
                                <p className="text-lg font-semibold -translate-x-2">
                                    {pair.token1}-{pair.token2} LP
                                </p>
                            </div>
                        </div>
                        <div onClick={()=>{setSetting(true)}} className="text-slate-700 hover:text-slate-400 cursor-pointer">
                            <FontAwesomeIcon icon={faGear} />
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-sm">Fixed Term</p>
                        <p className="-m-1 text-sm">2 days</p>
                        <div className="w-full flex justify-around">
                            <div>
                                <p className="text-lg text-gray-500">Bond Price</p>
                                <p className="text-center text-2xl font-bold">${bondPriceInfo.price}</p>
                            </div>
                            <div>
                                <div>
                                    <p className="text-lg text-gray-500">Market Price</p>
                                    <p className="text-center text-2xl font-bold">${pair.KSPPrice}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="relative flex flex-col items-center w-full">
                            <div className="mt-4 mb-1 w-full rounded-lg h-14 max-w-sm hover:rounded-md flex items-center text-2xl bg-gray-200 pl-6 hover:border-gray-400 border-solid border border-gray-200">
                                <input
                                    placeholder=""
                                    type="number"
                                    step="0.1"
                                    value={lpAmount}
                                    onChange={(e) => onLPAmountChange(e)}
                                    className="outline-none placeholder-slate-700 text-gray-600 bg-gray-200 h-full w-1 flex-grow"
                                />
                                
                                <p className="pl-2 text-sm text-gray-600 bg-gray-200">LP</p>
                                <p onClick={()=>{setlpAmount(balanceInfo.lpBalanceFull); getLPValueCBRAmount(pair.decimals, pair.address, balanceInfo.lpBalanceFull, pair.KSPPrice, setCBRAmount, setLPinUSD);}} className="p-1 cursor-pointer font-semibold m-1 bg-slate-300 rounded-md text-xs text-gray-600 bg-gray-200">MAX</p>
                            </div>
                            <div className="absolute inset-0 top-1/2 -translate-y-1 left-1/2 -translate-x-1/2 flex text-xs items-center justify-center h-7 w-7 rounded-xl bg-gray-200 border-solid border-4 border-gray-100">
                                <FontAwesomeIcon icon={faArrowDown}/>
                            </div>
                            <div className="w-full rounded-lg h-14 max-w-sm flex items-center text-2xl bg-gray-200 px-6 hover:border-gray-400 border-solid border border-gray-200">
                                <input
                                    placeholder=""
                                    type="number"
                                    step="0.1"
                                    value={CBRAmount}
                                    onChange={(e) => onCBRAmountChange(e)}
                                    className="outline-none placeholder-slate-700 text-gray-600 bg-gray-200 h-full w-1 flex-grow"
                                />
                                <p className="pl-2 text-sm text-gray-600 bg-gray-200">sVTR</p>
                            </div>
                            
                        </div>
                        {!(address) ? (<div onClick={()=>{connectWallet()}} className="cursor-pointer bg-slate-400 hover:bg-slate-500 transition-all duration-200 hover:text-black py-3 px-12 text-white text-lg font-normal m-4 rounded-lg">
							Connect Wallet
						</div>
						) : (<div onClick={()=>{allowance? _bond() : _approve()}} className=" mt-4 cursor-pointer hover:bg-slate-500  hover:text-black transition-all duration-400 text-center bg-slate-400 py-2 px-10 text-white text-lg font-normal rounded-lg">
                        {allowance? 'Bond' : 'Approve'}
                        </div>)}
                        
                        <div className="flex flex-col space-y-2 w-full p-4 text-sm">
                            <div className="flex justify-center text-lg">
                                <p>{lpAmount} <span className="text-gray-500">LP</span> = {lpinUSD} <span className="text-gray-500">USD</span></p>
                            </div>
                            
                            <div className="flex justify-between">
                                <p>Your Balance</p>
                                <p>
                                    {balanceInfo.lpBalance} <span className="text-gray-500">{pair.token1}-{pair.token2} LP</span>
                                </p>
                            </div>
                            <div className="flex justify-between">
                                <p>Your Balance in USD</p>
                                <p>{balanceInfo.userlpinUSD} <span className="text-gray-500">USD</span></p>
                            </div>
                            <div className="flex justify-between">
                                <p>You Will Get</p>
                                <p>
                                    {CBRAmount} <span className="text-gray-500">sVTR</span>
                                </p>
                            </div>
                            <div className="flex justify-between">
                                <p>Discount</p>
                                <p>{bondPriceInfo.rate} <span className="text-gray-500">%</span></p>
                            </div>
                            <div className="flex justify-between">
                                <p>Duration</p>
                                <p>2 <span className="font-light text-gray-500">days</span></p>
                            </div>
                        </div>
                    </div>
                </>)}
				
			</div>
		</div>
	);
}
export default BondModal;
