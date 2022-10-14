import React, {useEffect, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";
import {toast} from 'react-toastify'

function AccountModal({visible, onClose}) {
    const wallet = localStorage.getItem('wallet')
    const address = localStorage.getItem('address')
    const [userName, setUserName] = useState('')
    const [copy, setCopy] = useState('false')
    useEffect(() => {
        if (address !== null) {
        setUserName(`${address.slice(0, 7)}...${address.slice(38)}`,)}
        },[address])
    if (!visible) return null;
    return(
        <div className="fixed inset-0 z-50 h-full w-screen bg-black/60 backdrop-blur">
            <div className= 'relative shadow-lg shadow-black p-3 top-1/2 -translate-y-1/2 inset-0 w-11/12 m-auto bg-gray-100 rounded-xl max-w-sm'>
                <div className='border-b px-4 py-2 flex justify-between items-center'>
                    <h1 className='textsm text-black text-bold'>Your Account</h1>
                     <div className="cursor-pointer text-slate-700 hover:text-slate-400" onClick = {()=>{onClose();}}>
                    <FontAwesomeIcon icon={faX}/>
                    </div>
                </div>

                <div className='py-1 border-b-4 border-slate-400'></div>
                    <div onMouseEnter={() => setCopy(true)}
                    onMouseLeave={() => setCopy(false)}
                    onClick={() => {navigator.clipboard.writeText(address); toast.success('Address copied!')}}
                    className='flex flex-col items-center rounded-xl my-3 p-4 space-y-4 bg-slate-300 hover:bg-slate-400 cursor-pointer'>
                        <div>
                            {wallet === 'mm' && <div onClick={() => {
                            }} className="flex">
                            <img className="w-12 h-12" alt="" src="img/metamask.svg"/>                 
                        </div>}
                            {wallet === 'kk' && <div onClick={() => {
                            }} className="flex">
                            <img className="w-12 h-12" alt="" src="img/kaikas.svg"/>
                        </div>}
                            {wallet === 'kl' && <div onClick={() => {
                            }} className="flex">
                            <img className="w-14 h-14" alt="" src="img/klip.svg"/>
                        </div>}
                        </div>
                        {copy ? <div className= 'flex flex-row space-x-2'>
                            <p className='text-slate-700'>Copy Address</p>
                        </div> : <div className= 'flex flex-row space-x-2'>
                            <p className='text-slate-700'>address:</p>
                            <p className='text-slate-700'>{`${userName.slice(0, 7)}...${userName.slice(38)}`}</p>
                        </div>}
                    </div>

                    <div onClick={() => {localStorage.clear(); toast.warn('Wallet disconnected.'); onClose(); }}
                        className='flex flex-col items-center rounded-xl p-4 hover:bg-slate-300 cursor-pointer'>
                        <p className='text-slate-500'>Disconnect Wallet</p>
                    </div>
            </div>
        </div>
    )       
}
export default AccountModal;