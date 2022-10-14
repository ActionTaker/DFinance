import React, {useState, useEffect} from 'react'
import {Context} from '../context/Context'
import {faArrowDown} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import zaptokens from './zaptokens';
import ZapList from './ZapList'

const Zap = () => {
    const [selectedTokenInfo, setSelectedTokenInfo] = useState({});
    const [tokenInAmount, setTokenInAmount] = useState();
    const [tokenOutAmount, setTokenOutAmount] = useState();

    const [allowance, setAllowance] = useState(false);
    
    const {zapEstimate, zap_getAllowance, zap_approve, zap} = React.useContext(Context);
    const onTokenInAmountChange = (e) => {
        setTokenInAmount(e.target.value);
        if(e.target.value === ''){setTokenInAmount(''); setTokenOutAmount('');}
        zapEstimate(selectedTokenInfo.decimals, selectedTokenInfo.address, e.target.value, setTokenOutAmount);
    }

    const _approve = async () =>
    {
        await zap_approve(selectedTokenInfo.address)
        zap_getAllowance(selectedTokenInfo.address, setAllowance)
        console.log(allowance)
    }

    const _zap = async () =>
    {
        await zap(selectedTokenInfo.decimals, selectedTokenInfo.address, tokenInAmount);
    }

    useEffect(() => {
		
        zap_getAllowance(selectedTokenInfo.address, setAllowance)

	}, [selectedTokenInfo, allowance, zap_getAllowance]);

    return (
        <div className="p-1 flex space-y-4 flex-col">
            <div className='w-full flex flex-col p-4 bg-gray-100 rounded-lg max-w-3xl m-auto'>
                <h2 className="mb-3 font-extrabold text-lg">Zap</h2>
                <div className='flex justify-center items-center m-auto space-x-5 m-5'>
                {zaptokens.map(zaptoken => (
					<ZapList
                        key={zaptoken.tokenName}
                        address={zaptoken.address}
						tokenName={zaptoken.tokenName}
						tokenimg={zaptoken.tokenimg}
                        selectedTokenInfo = {selectedTokenInfo}
                        setSelectedTokenInfo = {setSelectedTokenInfo}
					/>
				))}
                </div>
                <h1 className='ml-10 text-sm text-gray-500'>You Pay</h1>
                <div className="mt-4 m-auto mb-4 w-full rounded-lg h-14 max-w-2xl hover:rounded-md flex items-center text-2xl bg-gray-200 pl-6 hover:border-gray-400 border-solid border border-gray-200">
                    <input
                        placeholder=""
                        type="number"
                        step="0.1"
                        value={tokenInAmount}
                        onChange={(e) => onTokenInAmountChange(e)}
                        className="outline-none placeholder-slate-700 text-gray-600 bg-gray-200 h-full w-1 flex-grow"
                                />
                                
                    <p className="pl-2 pr-2 text-sm text-gray-600 bg-gray-200">{selectedTokenInfo.tokenName}</p>    
                </div>
                <FontAwesomeIcon className='m-4' icon={faArrowDown}/>
                <h1 className='ml-10 text-sm text-gray-500'>You Get</h1>
                <div className="m-auto mb-1 w-full rounded-lg h-14 max-w-2xl hover:rounded-md flex items-center text-2xl bg-gray-200 pl-6 hover:border-gray-400 border-solid border border-gray-200">
                    <input
                        placeholder=""
                        type="number"
                        step="0.1"
                        value={tokenOutAmount}
                        className="outline-none placeholder-slate-700 text-gray-600 bg-gray-200 h-full w-1 flex-grow"
                                />
                                
                    <p className="pl-2 pr-2 text-sm text-gray-600 bg-gray-200">sVTR</p>    
                </div>
                <div onClick={()=>{allowance? _zap() : _approve()}} className=" mt-4 cursor-pointer hover:bg-slate-500  hover:text-black transition-all duration-400 text-center bg-slate-400 py-2 px-10 text-white text-lg font-normal rounded-lg">
                        {allowance? 'Zap' : 'Approve'}
                        </div>
            </div>  
        </div>
    )
}

export default Zap
