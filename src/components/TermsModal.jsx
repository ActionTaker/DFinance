import React, {useState,useEffect, useRef} from 'react';
import {Context} from '../context/Context'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {faX} from "@fortawesome/free-solid-svg-icons";

function TermsModal({visible, onClose, walletVisible}){
    const {checked, setChecked} = React.useContext(Context);

    if (!visible) return null;
    return(
        <div className="fixed inset-0 z-50 h-full w-screen bg-black/60 backdrop-blur">
            <div className= 'relative shadow-lg shadow-black p-3 top-1/2 -translate-y-1/2 inset-0 w-11/12 m-auto bg-gray-100 rounded-xl max-w-2xl'>
                <div className='border-b px-4 py-2 flex justify-between items-center'>
                    <h1 className='text-xl text-black text-bold'>Risk & Security </h1>
                    <div className="cursor-pointer text-slate-700 hover:text-slate-400" onClick = {() => {onClose(); setChecked(false);}}>
                    <FontAwesomeIcon icon={faX}/>
                    </div>
                </div>
                <div className='px-4 text-gray-600'>
                    <p>Please read the terms carefully. Once you use Vector Finance, you are regarded as having understood and agreed to the terms below:</p>
                </div>
                <div className='py-1 border-b-4 border-slate-400'></div>
                <div className='flex items-center px-4 mt-4'>
                    <svg class="h-6 w-6 flex-none fill-white stroke-slate-400 stroke-2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="11" />
                    <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                    </svg>
                    <div className='px-3 text-black'>Vector Finance is a decentralized P2P blockchain and open-source software where participants can participate in the protocol.</div>
                </div>

                <div className='flex items-center px-4'>
                    <svg class="h-6 w-6 flex-none fill-white stroke-slate-400 stroke-2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="11" />
                    <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                    </svg>
                    <div className='px-4 py-1 text-black'>Participants should review the relevant documents before using Vector Finance to ensure that it works properly and how it works.</div>
                </div>

                <div className='flex items-center px-4'>
                    <svg class="h-6 w-6 flex-none fill-white stroke-slate-400 stroke-2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="11" />
                    <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                    </svg>
                    <div className='px-4 py-1 text-black'>Vector Finance doesn't provide any guarantee and is 'itself' operated. Vector Finance team has developed most of the initial source code of Vector Finance, but it does not own Vector Finance itself.</div>
                </div>

                <div className='flex items-center px-4'>
                    <svg class="h-6 w-6 flex-none fill-white stroke-slate-400 stroke-2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="11" />
                    <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                    </svg>
                    <div className='px-4 py-1 text-black'>Upgrades and modifications of the Vector Finance are managed through the community of those who own $sVTR.</div>
                </div>

                <div className='flex items-center px-4'>
                    <svg class="h-6 w-6 flex-none fill-white stroke-slate-400 stroke-2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="11" />
                    <path d="m8 13 2.165 2.165a1 1 0 0 0 1.521-.126L16 9" fill="none" />
                    </svg>
                    <div className='px-4 py-1 text-black'>No developer or entity involved in creating the Vector Finance will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction with other users of the Vector Finance, including any direct, indirect, incidental, special, exemplary, punitive or consequential damages, or loss of profits, cryptocurrencies, tokens, or anything else of value.</div>
                </div>
                <div className='py-1 border-b-4 border-slate-400'></div>

                <div className='flex items-center px-4 mt-4'>
                <input type="checkbox" id='check' className="checked:bg-slate-400 h-4 w-4 flex-none cursor-pointer" onChange={() => setChecked(!checked)}></input>
                <div className='px-4 py-1 text-black text-bold'>I understand the risks and would like to confirm.</div>
                </div>
                <div>
                
                {checked ? (<div onClick={() => {onClose(); setChecked(true); walletVisible(true);}} className="rounded-lg text-lg cursor-pointer hover:bg-slate-500 hover:text-black font-medium text-gray-100 flex justify-center items-center p-1 bg-slate-400 mt-2">
                    <p>Confirm</p>
                </div>) : (<div className="rounded-lg text-lg font-medium text-gray-100 flex justify-center items-center p-1 bg-slate-400 mt-2">
                    <p>Confirm</p>
                </div>)}
                </div>  
            </div>
        </div>
    );
}

export default TermsModal