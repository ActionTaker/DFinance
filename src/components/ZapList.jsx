import React from 'react';

function ZapList(zapList) {


	return (
		<div onClick={()=>{zapList.setSelectedTokenInfo({tokenName : zapList.tokenName, decimals : zapList.decimals,  address : zapList.address})}} className={`bg-gray-300 border-2 ${zapList.selectedTokenInfo.tokenName === zapList.tokenName ? 'border-slate-400' : 'border-gray-300'} flex justify-center items-center hover:bg-slate-300 cursor-pointer rounded-full p-2`}>
                        <img
                                className="w-9 h-9"
                                src={zapList.tokenimg}
                                alt="description of ge"
                            />
                    </div>
	);
}
export default ZapList;
