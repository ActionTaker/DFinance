import React, { useEffect, useState } from 'react';
import {Context} from '../context/Context'
import BondList from './BondList'
import BondModal from './BondModal'
import Skel from './Skel'
import pairs from './pairs';
import TermsModal from './TermsModal';
import WalletModal from './WalletModal';
import KlipModal from './KlipModal';

function Bond() {
	const [first, setFirst] = useState(false);
    const [active, setActive] = useState(false);
    const [modalPair, setModalPair] = useState({});
    const [KSPPrice, setKSPPrice] = useState();
    const {getKSPValue, klipTimer, klipVisible, setKlipVisible} = React.useContext(Context)
	const [showTermsModal, setShowTermsModal] = useState(false)
    const handleonClose = () => setShowTermsModal(false)
    const [showWalletModal, setShowWalletModal] = useState(false)
    const handleonCloseWallet = () => setShowWalletModal(false)

    
	useEffect(() => {
		setFirst(true);
        getKSPValue(setKSPPrice);
	}, [getKSPValue]);

	return (
        
		<div className="p-1">
            {active && <div><BondModal
            KSPPrice={KSPPrice} 
            active={active} 
            setActive={setActive}
            address={modalPair.address}
            decimals={modalPair.decimals}
            token1={modalPair.token1}
			token2={modalPair.token2}
			token1img={modalPair.token1img}
			token2img={modalPair.token2img}/></div>}
			<div className="flex flex-col space-y-4 md:flex-row md:space-y-0 m-auto md:space-x-4 max-w-3xl">
				<div
					className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${
						first ? 'scale-100' : 'scale-0'
					} transition-all duration-700`}
				>
					<p className="font-normal text-xl text-gray-500">Treasury Balance</p>
					<p className="font-bold text-lg">$30,291,330</p>
				</div>

				<div
					className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${
						first ? 'scale-100' : 'scale-0'
					} transition-all duration-700`}
				>
					<p className="font-normal text-xl text-gray-500">VTR Price</p>
                    {KSPPrice && (<p className="font-bold text-lg">${KSPPrice} </p>)}
                    {!KSPPrice && (<Skel/>)}
					
				</div>
			</div>

			<div
				className={`bg-gray-100 shadow-lg bg-opacity-50 rounded-lg mt-6 w-full max-w-3xl m-auto p-4 ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`} 
			>
				<h2 className="mb-4 font-extrabold text-lg">Bond (4,4)</h2>
				<div className="hidden md:flex text-center w-full max-w-2xl mb-7 m-auto">
					<h1 className="text-sm text-gray-400 flex-[2_2_0%]">Bond</h1>
					<h1 className="text-sm text-gray-400 flex-1">Price</h1>
					<h1 className="text-sm text-gray-400 flex-1">Discount</h1>
					<h1 className="text-sm text-gray-400 flex-1">Duration</h1>
					<div className="flex-1" />
				</div>

				{pairs.map(pair => (
					<BondList 
            key={pair.token1+pair.token2}
                        address={pair.address}
                        decimals={pair.decimals}
						token1={pair.token1}
						token2={pair.token2}
						token1img={pair.token1img}
						token2img={pair.token2img}
                        setModalPair={setModalPair}
                        setActive={setActive}
                        active={active}
						modal={setShowTermsModal}
					/>
				))}

       
			</div>
			<div>
			<TermsModal onClose={handleonClose} visible={showTermsModal} walletVisible={setShowWalletModal}/>
            <WalletModal onCloseWallet={handleonCloseWallet} visible={showWalletModal} klipShow={() => setKlipVisible(true)} /> 
            <KlipModal onCloseKlip={() => setKlipVisible(false)} visible={klipVisible} countdownTimestampMs={klipTimer} />  
			</div>
		</div>
	);
}
export default Bond;
