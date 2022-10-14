import React, { useEffect, useState } from 'react';

function Dashboard() {

    const [first, setFirst] = useState(false);
    useEffect(() => {
        setFirst(true);
    },[]);
    return(
        <div className='p-4'>
            <div className="grid grid-cols-2 gap-2 max-w-3xl m-auto gap-x-6 gap-y-6">
                <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                        <p className="font-normal text-xl text-gray-500">VTR Price</p>
                        <p className="font-bold text-lg">$25</p>
                </div>
                <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                        <p className="font-normal text-xl text-gray-500">Market Cap</p>
                        <p className="font-bold text-lg">$30,291,330</p>
                </div>
                <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                        <p className="font-normal text-xl text-gray-500">Treasury Assets</p>
                        <p className="font-bold text-lg">$35,291,330</p>
                </div>
                <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                        <p className="font-normal text-xl text-gray-500">Current Index</p>
                        <p className="font-bold text-lg">187.23 sVTR</p>
                </div>
                <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                        <p className="font-normal text-xl text-gray-500">Current APY</p>
                        <p className="font-bold text-lg">123,552,123%</p>
                </div>
                <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                        <p className="font-normal text-xl text-gray-500">VTR Staked</p>
                        <p className="font-bold text-lg">98.2%</p>
                </div>
                <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                        <p className="font-normal text-xl text-gray-500">Liquid Backing per VTR</p>
                        <p className="font-bold text-lg">$15.2</p>
                </div>
                <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
                        <p className="font-normal text-xl text-gray-500">Protocol Owned Liquidity</p>
                        <p className="font-bold text-lg">98.2%</p>
                </div>
            </div>
        </div>
    );
}
export default Dashboard;