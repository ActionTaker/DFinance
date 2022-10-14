import React, { useEffect, useState } from 'react';
import {Context} from '../context/Context'


function BondList(pair) {
    const [bondPriceInfo, setBondPriceInfo] = useState({});
    const {getRealTimeDiscountRatePrice} = React.useContext(Context);
	const address = localStorage.getItem('address');
    useEffect(() => {
        getRealTimeDiscountRatePrice(pair.address, setBondPriceInfo)
		console.log(pair.address)
	}, [getRealTimeDiscountRatePrice, pair.address]);


	return (
		<>
      
			<div className="hidden mb-7 md:flex items-center text-center max-w-2xl m-auto">
				<div className="text-sm flex flex-[2_2_0%]">
					<div className="flex">
						<img
							className="w-9 h-9"
							src={pair.token1img}
                            alt="description of ge"
						/>
						<img
							className="relative transform -translate-x-3 w-9 h-9"
							src={pair.token2img}
                            alt="description of e"
						/>
					</div>
					<div className="text-left">
						<p>{pair.token1}-{pair.token2} LP</p>
						<p>Get LP</p>
					</div>
				</div>
				<h1 className="text-sm flex-1">${bondPriceInfo.price}</h1>
				<h1 className="text-sm flex-1">{bondPriceInfo.rate}%</h1>
				<h1 className="text-sm flex-1">2days</h1>

				{(!address) ? <div onClick={()=>{pair.modal(true);}} 
				className="cursor-pointer hover:bg-slate-500 hover:text-black transition-all duration-400 cursor flex-1 bg-slate-400 py-2 px-2 text-white text-sm font-normal rounded-lg">
					Connect Wallet
				</div> : <div onClick={()=>{pair.setModalPair({address: pair.address, decimals:pair.decimals, token1:pair.token1, token2:pair.token2, token1img:pair.token1img, token2img:pair.token2img}); pair.setActive(!pair.active)}} 
				className="cursor-pointer hover:bg-slate-500 hover:text-black transition-all duration-400 cursor flex-1 bg-slate-400 py-1 px-1 text-white text-md font-normal rounded-lg">
					Bond </div>}
                
			</div>

			<div className="text-sm mb-7 md:hidden">
				<div className="flex mb-5">
					<div className="flex">
						<img
							className="w-9 h-9"
							src={pair.token1img}
                            alt="description of ge"
						/>
						<img
							className="relative transform -translate-x-3 w-9 h-9"
							src={pair.token2img}
                            alt="description of ge"
						/>
					</div>
					<div className="text-left">
						<p>{pair.token1}-{pair.token2} LP</p>
						<p>Get LP</p>
					</div>
				</div>
				<div className="flex justify-between mb-2">
					<p className="text-gray-400">Price</p>
					<p>${bondPriceInfo.price}</p>
				</div>
				<div className="flex justify-between mb-2">
					<p className="text-gray-400">Discount</p>
					<p>{bondPriceInfo.rate}%</p>
				</div>
				<div className="flex justify-between mb-2">
					<p className="text-gray-400">Duration</p>
					<p>2days</p>
				</div>
				<div onClick={()=>{pair.setModalPair({address:pair.address, decimals:pair.decimals, token1:pair.token1, token2:pair.token2, token1img:pair.token1img, token2img:pair.token2img}); pair.setActive(!pair.active)}} className="cursor-pointer hover:bg-slate-500  hover:text-black transition-all duration-400 text-center bg-slate-400 py-2 px-1 text-white text-lg font-normal rounded-lg">
					Bond
				</div>
			</div>
		</>
	);
}
export default BondList;
