import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar'
import Container from './components/Container'
import {Provider} from './context/Context'
import './App.css';

function App() {
	const [active, setActive] = useState(false);
    const [firstLoading, setFirstLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setFirstLoading(false);
          }, 500);
          
      },[]);
    
    if(firstLoading){
        return(
        <div className="w-screen h-screen bg-black flex justify-center items-center">
            <div id="firstLoading"></div>
        </div>
            
        )
    }
    else
    {
        return (
            <Provider>
                <div id="wrap" className="fixed w-screen h-screen overflow-auto md:flex bg-gray-500">
                    <Sidebar active={active} setActive={setActive}/>
                    <Container active={active} setActive={setActive}/>
                </div>
            </Provider>
        )
    }
	
}

export default App;
