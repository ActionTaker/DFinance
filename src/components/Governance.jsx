import React, { useEffect, useState } from 'react';

function Governance() {

    const [first, setFirst] = useState(false);
    useEffect(() => {
        setFirst(true);
    }, []);
    return(
    <div className='p-1'>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 m-auto md:space-x-4 max-w-3xl" >
            <div className={`flex p-4 w-full bg-gray-100 flex-col items-center md:flex-1 rounded-lg ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`}>
					<p className="-mb-1 font-extrabold text-lg">Proposals</p>
			</div>
        </div>
        <div className={`bg-gray-100 shadow-lg bg-opacity-50 rounded-lg mt-6 w-full max-w-3xl m-auto p-4 hover:bg-opacity-10 cursor-pointer ${first ? 'scale-100' : 'scale-0'} transition-all duration-700`} >
            <p className="font-normal text text-gray-500">No.</p>
            <p className="font-normal text text-gray-500">Title</p>
            <p className="font-normal text text-gray-500">Voter Turnout</p>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700"></div>
            <p className="font-normal text text-gray-500">Start/End Block</p>
        </div>
    </div>
    );
}
export default Governance;