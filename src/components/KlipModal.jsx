import React, {useEffect, useState} from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faX} from "@fortawesome/free-solid-svg-icons";
import {Context} from '../context/Context';
import {QRCodeSVG} from 'qrcode.react';
import {getRemainingTimeUntilMsTimestamp} from '../utils/CountdownTimerUtils';


function WalletModal({visible, onCloseKlip, countdownTimestampMs}) {
    const {klipRequest, setChecked} =  React.useContext(Context);
    const url = `https://klipwallet.com/?target=/a2a?request_key=${klipRequest}`;
    const defaultRemainingTime = {
        seconds: '00',
        minutes: '00',
        hours: '00',
        days: '00'
    };
    const [remainingTime, setRemainingTime] = useState(defaultRemainingTime);
    useEffect(() => {
        const intervalId = setInterval(() => {
            updateRemainingTime(countdownTimestampMs);
        }, 1000);
        return () => clearInterval(intervalId);
    },[countdownTimestampMs]);
    function updateRemainingTime(countdown) {
        setRemainingTime(getRemainingTimeUntilMsTimestamp(countdown));
    };

    if (!visible) return null;
    return(
        <div className="fixed inset-0 z-50 h-full w-screen bg-black/60 backdrop-blur">
            <div className= 'relative shadow-lg shadow-black p-3 top-1/2 -translate-y-1/2 inset-0 w-11/12 m-auto bg-gray-100 rounded-xl max-w-sm'>
                <div className='border-b px-4 py-2 flex justify-between items-center'>
                    <h1 className='textsm text-black text-bold'>Connect to Kakao Klip wallet via QR Code.</h1>
                     <div className="cursor-pointer text-slate-700 hover:text-slate-400" onClick = {()=>{onCloseKlip(); setChecked(false);}}>
                    <FontAwesomeIcon icon={faX}/>
                    </div>
                </div>
                <div className='py-1 border-b-4 border-slate-400'></div>
                <div className='flex flex-col items-center bg-slate-400 px-10 py-5 my-5 h-50 rounded-xl'>
                    <QRCodeSVG value={url} className="w-100 my-6" alt=""/>
                    <div className='flex flex-row space-x-2'>
                    <p className='text-black my-5 text-sm'>Time remaining:</p>
                    <p className='text-red-600 text-sm my-5'>{remainingTime.minutes}min</p>
                    <p className='text-red-600 text-sm my-5'>{remainingTime.seconds}sec</p>
                    </div>
                    <p className='text-black my-1 text-sm'>Scan the QR code through a QR code reader or the Kakao Talk App.</p>

                </div>
            </div>
        </div>
    )       
}
export default WalletModal;