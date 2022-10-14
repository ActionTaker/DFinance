import React, {useState, useContext} from 'react';
import {Context} from '../context/Context';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";

function WalletModal({visible, onCloseWallet, klipShow}) {
    const {connectWallet, connectWalletKlay, connectWalletKlip, setChecked} = React.useContext(Context);
    if (!visible) return null;
    return(
        <div className="fixed inset-0 z-50 h-full w-screen bg-black/60 backdrop-blur">
            <div className= 'relative shadow-lg shadow-black p-3 top-1/2 -translate-y-1/2 inset-0 w-11/12 m-auto bg-gray-100 rounded-xl max-w-xl'>
                <div className='border-b px-4 py-2 flex justify-between items-center'>
                    <h1 className='text-xl text-black text-bold'>Select Your Wallet</h1>
                    <div className="cursor-pointer text-slate-700 hover:text-slate-400" onClick = {() => {onCloseWallet(); setChecked(false);}}>
                    <FontAwesomeIcon icon={faX}/>
                    </div>
                </div>
                <div className='py-1 border-b-4 border-slate-400'></div>
                <div className='flex flex-col items-center bg-slate-400 py-5 my-5 h-50 rounded-xl cursor-pointer hover:bg-slate-500' onClick={() => {onCloseWallet(); setChecked(false); connectWallet();}}>
                    <img className="w-10" alt="" src="img/metamask_2.svg"/>
                    <p className='text-gray-600 my-1'>Connect to Metamask wallet</p>
                </div>
                <div className='flex flex-col items-center bg-slate-400 py-5 my-5 h-50 rounded-xl cursor-pointer hover:bg-slate-500'onClick={() => {onCloseWallet(); setChecked(false); connectWalletKlay();}}>
                    <img className="w-10" alt="" src="img/kaikas.svg"/>
                    <p className='text-gray-600 my-1'>Connect to Kaikas wallet</p>
                </div>
                <div className='flex flex-col items-center bg-slate-400 py-5 my-5 h-50 rounded-xl cursor-pointer hover:bg-slate-500' onClick={() => {onCloseWallet(); klipShow(); setChecked(false); connectWalletKlip();}}>
                    <img className="w-16" alt="" src="img/klip.svg"/>
                    <p className='text-gray-600 my-1'>Connect to Klip wallet</p>
                </div>
            </div>
        </div>
    )       
}
export default WalletModal;