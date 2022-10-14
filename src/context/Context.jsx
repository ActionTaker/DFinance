import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {stakingContractABI, zeroAddress, zapContractAddress, zapContractABI, stakingContractAddress, tokenContractAddress, tokenContractABI, bondHelpContractAddress, bondHelpContractABI, bondContractABI, bondContractAddress, auctionSwapContractAddress, auctionSwapContractABI, KSPAddress } from "../constant/Constant";
import { prepare, getResult} from 'klip-sdk';
import dayjs from 'dayjs';
import { parse } from "@ethersproject/transactions";
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

export const Context = React.createContext();

const Caver = require('caver-js')
const rpcURL = 'https://public-node-api.klaytnapi.com/v1/cypress'
const caver = new Caver(rpcURL);
const { ethereum, klaytn } = window;
const gasPrice_ = 250000000000;

const createStakeContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(stakingContractAddress, stakingContractABI, signer);
    return contract;
  };
  
export const Provider = ({ children }) => {
    const [newNet, setnewNet] = useState(false);
    const [klipRequest, setKlipRequest] = useState('');
    const [klipTimer, setKlipTimer] = useState(0);
    const [klipVisible, setKlipVisible] = useState(false);
    const [checked, setChecked] = useState(false);
    const [loader, setLoader] = useState(false);
    const [account, setAccount] = useState('');
    const [wallet, setWallet] = useState('');

    /*****************************LIB FUNCTION*******************************/
    const convertfinal = (target, decimal, tofix) => {
        const token = ethers.utils.formatUnits(target, decimal)
        const string = (+token).toFixed(tofix)
        return string;
     }
    const convert = (target) => {
        const token = ethers.utils.formatUnits(target, 9)
        const string = (+token).toFixed(4)
        return string;
    }
    
    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);

    
        var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m === 1 ? " minute " : " minutes ") : "1 minute ";

        return hDisplay + mDisplay; 
    }
    /*****************************LIB FUNCTION END*******************************/

    /*****************************BASIC SETTING*******************************/
    const checkIfWalletIsConnect = async () => {
        setAccount(localStorage.getItem('account'));
        setWallet(localStorage.getItem('wallet'));
      };

    const connectWallet = async () => {
        try {
          if (!ethereum) toast.error('Please install Metamask wallet.');
    
          const accounts = await ethereum.request({ method: "eth_requestAccounts", });
          localStorage.setItem('address', accounts[0])
          localStorage.setItem('wallet', 'mm')
          setAccount(accounts[0]);
          setWallet('mm');
          toast.success('Connected to Metamask wallet.');
          
        } catch (error) {
          console.log(error);
          toast.error('Falied to connect to Metamask wallet.')
        }
      };

      const setCBR = async () => {
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', // Initially only supports ERC20, but eventually more!
              options: {
                address: tokenContractAddress, // The address that the token is at.
                symbol: "CBR", // A ticker symbol or shorthand, up to 5 chars.
                decimals: 9, // The number of decimals in the token
                image: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png", // A string url of the token logo
              },
            },
          });
    }
    
    const setsCBR = async () => {
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20', // Initially only supports ERC20, but eventually more!
              options: {
                address: stakingContractAddress, // The address that the token is at.
                symbol: "sCBR", // A ticker symbol or shorthand, up to 5 chars.
                decimals: 9, // The number of decimals in the token
                image: "https://cryptologos.cc/logos/nkn-nkn-logo.svg", // A string url of the token logo
              },
            },
          });
    }
    
    const setNetwork = async () => {
        await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                  chainId: '0x2019',
                  chainName: 'Klaytn Cypress',
                  rpcUrls: ["https://public-node-api.klaytnapi.com/v1/cypress"],
                  nativeCurrency: {
                      name: 'KLAY',
                      symbol: 'KLAY',
                      decimals: 18
                  },
                  blockExplorerUrls: ['https://scope.klaytn.com/']
              }
          ],
          });
          console.log("hi")
          setnewNet(true)
    }
    /*****************************BASIC SETTING END*******************************/









    /*****************************STAKE FUNCTION*******************************/
    const stake = async (amount, type) => {
        try {
            if (wallet==='mm') {
                const accounts = await ethereum.request({ method: "eth_accounts" });
                const stakeContract = createStakeContract();
                const parsedAmount = ethers.utils.parseUnits(amount.toString(), 9);
                console.log(parsedAmount)
                const stake = await stakeContract.stake(parsedAmount, type, accounts[0], {
                gasPrice: gasPrice_
            });
            setLoader(true);
            toast.info('Transaction has been submitted.')
            await stake.wait()
            setLoader(false);
            toast.success('Transaction successful!')
            }
          } catch (error) {
            console.log("something went wrong!")
            setLoader(false);
            toast.error('Transaction failed.')
            console.log(error);
          }

          try {
            if (wallet==='kk') {
                const caver = new Caver(klaytn);
                const stakeContract = caver.contract.create(stakingContractABI, stakingContractAddress);
                const parsedAmount = ethers.utils.parseUnits(amount.toString(), 9);
                console.log(parsedAmount)
                const stake = await caver.klay.sendTransaction({
                  type: 'SMART_CONTRACT_EXECUTION',
                  from: account,
                  to: stakingContractAddress,
                  data: stakeContract.methods.stake(parsedAmount, type, account).encodeABI(),
                  gas: '3000000',
                })
                .on('transactionHash', (hash) => {setLoader(true); toast.info('Transaction has been submitted.');
                })
                .on('receipt', (receipt) => {setLoader(false); toast.success('Transaction successful!');
                  // success
                })
                .on('error', (e) => {setLoader(false); toast.error('Transaction failed.');
                  // failed
                });
                }
              } catch (e) {
                setLoader(false);
                console.log("something went wrong!")
                console.log(e);
              }

              try {
                const parsedAmount = ethers.utils.parseUnits(amount.toString(), 9);
                if (wallet==='kl') {
                    setKlipVisible(true);
                    const {request_key} = await prepare.executeContract({
                      bappName: 'Vector Finance',
                      to: stakingContractAddress,
                      value: '0',
                      abi: JSON.stringify({
                        "inputs": [
                          {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                          },
                          {
                            "internalType": "uint8",
                            "name": "stakeType",
                            "type": "uint8"
                          },
                          {
                            "internalType": "address",
                            "name": "user",
                            "type": "address"
                          }
                        ],
                        "name": "stake",
                        "outputs": [],
                        "stateMutability": "payable",
                        "type": "function"
                      }),
                      params: `["${parsedAmount.toString()}", "${type}", "${account}"]`
                    });
                    console.log(request_key)
                    setKlipTimer(dayjs()+300000);
                    setKlipRequest(request_key); 
                    console.log(request_key)
                    var counter = 0;
                    const looper = setInterval(async() => {
                      counter ++;
                      const res = await getResult(request_key);
                      if (res.status === 'completed') {clearInterval(looper); setKlipVisible(false); toast.success('Transaction successful!')} 
                      if (counter>300) {clearInterval(looper); setKlipVisible(false);}
                  }, 1000);
                    }
                  } catch (error) {
                    setKlipVisible(false); 
                    toast.error('Transaction failed.');
                    console.log("something went wrong!")
                    console.log(error);
                  }
    }
    const unstake = async (amount) => {
        try {
            if (wallet==='mm') {
              const stakeContract = createStakeContract();
              const parsedAmount = ethers.utils.parseUnits(amount.toString(), 9);
              const unstake = await stakeContract.unstake(parsedAmount, {
                gasPrice: gasPrice_
            });
            setLoader(true);
            toast.info('Transaction has been submitted.');
            await unstake.wait()
            setLoader(false);
            toast.success('Transaction successful!');
            }
          } catch (error) {
            setLoader(false);
            toast.error('Transaction failed.');
            console.log(error);
          }

          try {
            if (wallet==='kk') {
              const caver = new Caver(klaytn);
              const stakeContract = caver.contract.create(stakingContractABI, stakingContractAddress);
              const parsedAmount = ethers.utils.parseUnits(amount.toString(), 9);
              const unstake = await caver.klay.sendTransaction({
                type: 'SMART_CONTRACT_EXECUTION',
                from: account,
                to: stakingContractAddress,
                data: stakeContract.methods.unstake(parsedAmount).encodeABI(),
                gas: '3000000',
              })
              .on('transactionHash', (hash) => {setLoader(true); toast.info('Transaction has been submitted.');
              })
              .on('receipt', (receipt) => {setLoader(false); toast.success('Transaction successful!');
                // success
              })
              .on('error', (e) => {setLoader(false); toast.error('Transaction failed.');
                // failed
              });
              }
            } catch (error) {
              console.log("something went wrong!")
              console.log(error);
              setLoader(false);
            }

        try {
          const parsedAmount = ethers.utils.parseUnits(amount.toString(), 9);
          if (wallet==='kl') {
              setKlipVisible(true);
              const {request_key} = await prepare.executeContract({
                bappName: 'Vector Finance',
                to: stakingContractAddress,
                value: '0',
                abi: JSON.stringify({
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                    }
                  ],
                  "name": "unstake",
                  "outputs": [],
                  "stateMutability": "nonpayable",
                  "type": "function"
                }),
                params: `["${parsedAmount.toString()}"]`
              });
              console.log(request_key)
              setKlipTimer(dayjs()+300000);
              setKlipRequest(request_key); 
              console.log(request_key)
              var counter = 0;
              const looper = setInterval(async() => {
                counter ++;
                const res = await getResult(request_key);
                if (res.status === 'completed') {clearInterval(looper); setKlipVisible(false); toast.success('Transaction successful!')} 
                if (counter>300) {clearInterval(looper); setKlipVisible(false); }
            }, 1000);
              }
            } catch (error) {
              console.log("something went wrong!")
              setKlipVisible(false);
              toast.error('Transaction failed.');
              console.log(error);
            }
    }
    const getStakeInfo = async (setGenInfo, setIndInfo) => {
        try {
          if (wallet==='mm') {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const stakeGenContract = new ethers.Contract(stakingContractAddress, stakingContractABI, provider);
            const stakeContract = createStakeContract();
            const a = await stakeGenContract.getFrontGenInfo();
            console.log(a);
            const [_round, _totalSupply, _index, _secondLeft, _rate] = await stakeGenContract.getFrontGenInfo();
            const genInfo = {round : ethers.utils.formatUnits(_round, 0), totalSupply : convert(_totalSupply), index : convert(_index), secondToHM : secondsToHms(_secondLeft), secondLeftPercent : parseFloat((100 - (_secondLeft.toNumber()/28800*100)).toFixed(1)), secondLeftPercent0 : parseFloat((100 - (_secondLeft.toNumber()/28800*100)).toFixed(0)), rate : (_rate.toNumber() - 10000)/100, roi : ((Math.pow((_rate.toNumber()/10000), 5 * 3) - 1) * 100).toFixed(4), apy : ((Math.pow((_rate.toNumber()/10000), 365 * 3) - 1) * 100).toFixed(1)}
            setGenInfo(genInfo)
            
            const indInfo = await stakeContract.getFrontInd(); 
            const indInfoObject = {
                claimableAmount : convertfinal(indInfo[0], 9, 4), 
                claimableExactAmount : convertfinal(indInfo[0], 9, 9),
                lockedAmount : convertfinal(indInfo[1], 9, 4), 
                lockedAmountArray : [convertfinal(indInfo[2][0], 9, 4), convertfinal(indInfo[2][1], 9, 4), convertfinal(indInfo[2][2], 9, 4)],
                roundArray : [convertfinal(indInfo[3][0], 0, 0), convertfinal(indInfo[3][1], 0, 0), convertfinal(indInfo[3][2], 0, 0)],
                cbrAmount : convertfinal(indInfo[4], 9, 4),
                cbrExactAmount : convertfinal(indInfo[4], 9, 9),
                scbrAmount : convertfinal(indInfo[5], 9, 4),
                scbrExactAmount : convertfinal(indInfo[5], 9, 9),
            }
            setIndInfo(indInfoObject)
            console.log(indInfoObject)
            //const indInfo = {indRound : ethers.utils.formatUnits(_indRound, 0), sCBRBalance : convert(_sCBRBalance), CBRBalance : convert(_CBRBalance), rCBRBalance : (+ethers.utils.formatUnits(_CBRBalance, 9)), rsCBRBalance :(+ethers.utils.formatUnits(_sCBRBalance, 9)) }

          } else {
            console.log("Ethereum is not present");
          }
        } catch (error) {
          console.log(error);
        }

        try {
          if (wallet==='kk') {
            const stakeGenContract = new caver.contract(stakingContractABI, stakingContractAddress);
            const [_round, _totalSupply, _index, _secondLeft, _rate] = await stakeGenContract.methods.getFrontGenInfo().call();
            const genInfo = {round : ethers.utils.formatUnits(_round, 0), totalSupply : convert(_totalSupply), index : convert(_index), secondToHM : secondsToHms(_secondLeft), secondLeftPercent : parseFloat((100 - (_secondLeft/28800*100)).toFixed(1)), secondLeftPercent0 : parseFloat((100 - (_secondLeft/28800*100)).toFixed(0)), rate : (_rate - 10000)/100, roi : ((Math.pow((_rate/10000), 5 * 3) - 1) * 100).toFixed(4), apy : ((Math.pow((_rate/10000), 365 * 3) - 1) * 100).toFixed(1)}
            setGenInfo(genInfo)
            
            const indInfo = await stakeGenContract.methods.getFrontInd().call({
              from: account
            }); 
            const indInfoObject = {
                claimableAmount : convertfinal(indInfo[0], 9, 4), 
                claimableExactAmount : convertfinal(indInfo[0], 9, 9),
                lockedAmount : convertfinal(indInfo[1], 9, 4), 
                lockedAmountArray : [convertfinal(indInfo[2][0], 9, 4), convertfinal(indInfo[2][1], 9, 4), convertfinal(indInfo[2][2], 9, 4)],
                roundArray : [convertfinal(indInfo[3][0], 0, 0), convertfinal(indInfo[3][1], 0, 0), convertfinal(indInfo[3][2], 0, 0)],
                cbrAmount : convertfinal(indInfo[4], 9, 4),
                cbrExactAmount : convertfinal(indInfo[4], 9, 9),
                scbrAmount : convertfinal(indInfo[5], 9, 4),
                scbrExactAmount : convertfinal(indInfo[5], 9, 9),
            }
            setIndInfo(indInfoObject)
            console.log(indInfoObject)

          } else {
            console.log("Ethereum is not present");
          }
        } catch (error) {
          console.log(error);
        }

        try {
          if (wallet==='kl') {
            const stakeGenContract = new caver.contract(stakingContractABI, stakingContractAddress);
            const [_round, _totalSupply, _index, _secondLeft, _rate] = await stakeGenContract.methods.getFrontGenInfo().call();
            const genInfo = {round : ethers.utils.formatUnits(_round, 0), totalSupply : convert(_totalSupply), index : convert(_index), secondToHM : secondsToHms(_secondLeft), secondLeftPercent : parseFloat((100 - (_secondLeft/28800*100)).toFixed(1)), secondLeftPercent0 : parseFloat((100 - (_secondLeft/28800*100)).toFixed(0)), rate : (_rate - 10000)/100, roi : ((Math.pow((_rate/10000), 5 * 3) - 1) * 100).toFixed(4), apy : ((Math.pow((_rate/10000), 365 * 3) - 1) * 100).toFixed(1)}
            setGenInfo(genInfo)
            
            const indInfo = await stakeGenContract.methods.getFrontInd().call({
              from: account
            }); 
            const indInfoObject = {
                claimableAmount : convertfinal(indInfo[0], 9, 4), 
                claimableExactAmount : convertfinal(indInfo[0], 9, 9),
                lockedAmount : convertfinal(indInfo[1], 9, 4), 
                lockedAmountArray : [convertfinal(indInfo[2][0], 9, 4), convertfinal(indInfo[2][1], 9, 4), convertfinal(indInfo[2][2], 9, 4)],
                roundArray : [convertfinal(indInfo[3][0], 0, 0), convertfinal(indInfo[3][1], 0, 0), convertfinal(indInfo[3][2], 0, 0)],
                cbrAmount : convertfinal(indInfo[4], 9, 4),
                cbrExactAmount : convertfinal(indInfo[4], 9, 9),
                scbrAmount : convertfinal(indInfo[5], 9, 4),
                scbrExactAmount : convertfinal(indInfo[5], 9, 9),
            }
            setIndInfo(indInfoObject)
            console.log(indInfoObject)

          } else {
            console.log("Ethereum is not present");
          }
        } catch (error) {
          console.log(error);
        }
      };  
    /*****************************STAKE FUNCTION END*******************************/

    /*****************************BOND FUNCTION*******************************/

    const bond = async(address, amount, decimal) => {
        try {
            if (wallet==='mm') {

                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const bondContract = new ethers.Contract(bondContractAddress, bondContractABI, signer);
                
                const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimal);
                console.log(amount)
                console.log(parsedAmount)
                console.log(decimal)
                toast.info('Transaction has been submitted.')
                setLoader(true);
                await bondContract.swapExactLPtoToken(address, parsedAmount, {
                    gasPrice: gasPrice_
                });
                setLoader(false);
                toast.success('Transaction successful!');
            }
          } catch (error) {
            console.log("something went wrong!");
            console.log(error);
            setLoader(false);
            toast.error('Transaction failed.');
          }

          try {
            if (wallet==='kk') {
                const caver = new Caver(klaytn);
                const bondContract = caver.contract.create(bondContractABI,bondContractAddress);
                const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimal);
                console.log(amount)
                console.log(parsedAmount)
                console.log(decimal)
                console.log(bondContract)
                const bond = await caver.klay.sendTransaction({
                  type: 'SMART_CONTRACT_EXECUTION',
                  from: account,
                  to: bondContractAddress,
                  data: bondContract.methods.swapExactLPtoToken(address, parsedAmount).encodeABI(),
                  gas: '3000000',
                })
                .on('transactionHash', (hash) => {toast.info('Transaction has been submitted.'); setLoader(true);
                })
                .on('receipt', (receipt) => {toast.success('Transaction successful!'); setLoader(false);
                  // success
                })
                .on('error', (e) => {toast.error('Transaction failed.'); setLoader(false);
                  // failed
                });
                }
              } catch (error) {
                console.log("something went wrong!")
                console.log(error);
                setLoader(false);
              }

          try {
            const parsedAmount = ethers.utils.parseUnits(amount.toString(), decimal);
            if (wallet==='kl') {
                setKlipVisible(true);
                const {request_key} = await prepare.executeContract({
                  bappName: 'Vector Finance',
                  to: bondContractAddress,
                  value: '0',
                  abi: JSON.stringify({
                    "inputs": [
                      {
                        "internalType": "address",
                        "name": "pair",
                        "type": "address"
                      },
                      {
                        "internalType": "uint256",
                        "name": "lpAmount_n",
                        "type": "uint256"
                      }
                    ],
                    "name": "swapExactLPtoToken",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                  }),
                  params: `["${address}","${parsedAmount.toString()}"]`
                });
                console.log(request_key)
                setKlipTimer(dayjs()+300000);
                setKlipRequest(request_key); 
                console.log(request_key)
                var counter = 0;
                const looper = setInterval(async() => {
                  counter ++;
                  const res = await getResult(request_key);
                  if (res.status === 'completed') {clearInterval(looper); setKlipVisible(false); toast.success('Transaction successful!')} 
                  if (counter>300) {clearInterval(looper); setKlipVisible(false); }
              }, 1000);
                }
              } catch (error) {
                setKlipVisible(false);
                toast.error('Transaction failed.');
                console.log("something went wrong!")
                console.log(error);
              }
  }
    const approve = async (address) => {
        try {
            if (wallet==='mm') {

                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const tokenContract = new ethers.Contract(address, tokenContractABI, signer);
                const inputString = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
                const parsedAmount = ethers.utils.parseUnits(inputString, 0)
                const approve = await tokenContract.approve(bondContractAddress, parsedAmount, {
                    gasPrice: gasPrice_
                }); 
                toast.info('Transaction has been submitted.');
                setLoader(true);
                await approve.wait();
                toast.success('Transaction successful!');
                setLoader(false);
            }
          } catch (error) {
            console.log("something went wrong!")
            console.log(error);
            toast.error('Transaction failed.');
            setLoader(false);
          }
            try {
              if (wallet==='kk') {
                  const caver = new Caver(klaytn);
                  const tokenContract = caver.contract.create(tokenContractABI, address);
                  const inputString = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
                  const parsedAmount = ethers.utils.parseUnits(inputString, 0)
                  const approve = await caver.klay.sendTransaction({
                    type: 'SMART_CONTRACT_EXECUTION',
                    from: account,
                    to: address,
                    data: tokenContract.methods.approve(bondContractAddress, parsedAmount).encodeABI(),
                    gas: '300000',
                  })
                  .on('transactionHash', (hash) => {toast.info('Transaction has been submitted.'); setLoader(true);
                  })
                  .on('receipt', (receipt) => {toast.success('Transaction successful!'); setLoader(false);
                    // success
                  })
                  .on('error', (e) => {toast.error('Transaction failed.'); setLoader(false);
                    // failed
                  });
                  }
                } catch (error) {
                  setLoader(false);
                  console.log("something went wrong!")
                  console.log(error);
                }

            try {
              const inputString = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
              const parsedAmount = ethers.utils.parseUnits(inputString, 0)
              if (wallet==='kl') {
                  setKlipVisible(true);
                  const {request_key} = await prepare.executeContract({
                    bappName: 'Vector Finance',
                    to: address,
                    value: '0',
                    abi: JSON.stringify({
                      "constant": false,
                      "inputs": [
                          {
                              "name": "_spender",
                              "type": "address"
                          },
                          {
                              "name": "_value",
                              "type": "uint256"
                          }
                      ],
                      "name": "approve",
                      "outputs": [
                          {
                              "name": "",
                              "type": "bool"
                          }
                      ],
                      "payable": false,
                      "stateMutability": "nonpayable",
                      "type": "function"
                  }),
                    params: `["${bondContractAddress}","${parsedAmount.toString()}"]`
                  });
                  console.log(request_key)
                  setKlipTimer(dayjs()+300000);
                  setKlipRequest(request_key); 
                  console.log(request_key)
                  var counter = 0;
                  const looper = setInterval(async() => {
                    counter ++;
                    const res = await getResult(request_key);
                    if (res.status === 'completed') {clearInterval(looper); setKlipVisible(false); toast.success('Transaction successful!')} 
                    if (counter>300) {clearInterval(looper); setKlipVisible(false);}
                }, 1000);
                  }
                } catch (error) {
                  setKlipVisible(false); 
                  toast.error('Transaction failed.');
                  console.log("something went wrong!")
                  console.log(error);
                }
    }
    const getAllowance = async(address, setAllowance) => {
      if (wallet==='mm') {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(address, tokenContractABI, signer);
        const allowance = await tokenContract.allowance(accounts[0], bondContractAddress);
        const bignum = "15792089237316195423570985008687907853269984665640564039457584007913129639935"
        const parsedAmount = ethers.utils.parseUnits(bignum, 0)
        console.log(allowance)
        console.log(parsedAmount)
        setAllowance(allowance.gt(parsedAmount))
      }

      if (wallet==='kk') {
        const tokenContract = new caver.contract(tokenContractABI, address);
        const method = await tokenContract.methods.allowance(account, bondContractAddress).call({
          from: account,
        });
        const allowance = caver.utils.BigNumber(method);
        const bignum = "15792089237316195423570985008687907853269984665640564039457584007913129639935"
        const parsedAmount = ethers.utils.parseUnits(bignum, 0)
        console.log(allowance)
        console.log(parsedAmount)
        setAllowance(allowance.gt(parsedAmount))
      }

      if (wallet==='kl') {
        const tokenContract = new caver.contract(tokenContractABI, address);
        const method = await tokenContract.methods.allowance(account, bondContractAddress).call({
          from: account,
        });
        const allowance = caver.utils.BigNumber(method);
        const bignum = "15792089237316195423570985008687907853269984665640564039457584007913129639935";
        const parsedAmount = caver.utils.BigNumber(bignum);
        console.log(allowance)
        console.log(parsedAmount)
        setAllowance(allowance.gt(parsedAmount))
      }

    }
    const getRealTimeDiscountRatePrice = async(address, setBondPriceInfo) => {
        try {
              const bondContract = new caver.contract(bondContractABI, bondContractAddress);
              const _discountRate = await bondContract.methods.realTimeDiscountRate(address).call();
              const _discountedPrice = await bondContract.methods.discountedPrice(address).call();
              const discountRatePrice = { rate : convertfinal(_discountRate, 4, 2), price : convertfinal(_discountedPrice, 4, 4)}
              setBondPriceInfo(discountRatePrice)
                         
          } catch (error) {
            console.log("something went wrong!")
            console.log(error);
          }
          
    }
    
    const getUserStableLPvalue = async (decimals, address, setBalanceInfo) => {
        try {
            if (wallet==='mm') {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const bondHelpContract = new ethers.Contract(bondHelpContractAddress, bondHelpContractABI, signer);
                const a = await bondHelpContract.getUserStableLPvalue(address);
                const balanceInfo = {lpBalance : convertfinal(a[0], decimals, 6), lpBalanceFull : convertfinal(a[0], decimals, decimals), userlpinUSD : convertfinal(a[1], 18, 2)}
                console.log(balanceInfo);
                setBalanceInfo(balanceInfo);

            }
            else {
                console.log("Ethereum is not present");
              }
          } catch (error) {
            console.log("something went wrong!")

            console.log(error);
          }

          try {
            if (wallet==='kk') {
              const bondHelpContract = new caver.contract(bondHelpContractABI, bondHelpContractAddress);
              const a = await bondHelpContract.methods.getUserStableLPvalue(address).call({
                from: account,
              });
              const balanceInfo = {lpBalance : convertfinal(a[0], decimals, 6), lpBalanceFull : convertfinal(a[0], decimals, decimals), userlpinUSD : convertfinal(a[1], 18, 2)}
              console.log(a);
              setBalanceInfo(balanceInfo);
            }
            else{
              console.log("Klaytn is not present")
            }
          } catch (e) {
            console.log(e)
          }

          try {
            if (wallet==='kl') {
              const bondHelpContract = new caver.contract(bondHelpContractABI, bondHelpContractAddress);
              const a = await bondHelpContract.methods.getUserStableLPvalue(address).call({
                from: account,
              });
              const balanceInfo = {lpBalance : convertfinal(a[0], decimals, 6), lpBalanceFull : convertfinal(a[0], decimals, decimals), userlpinUSD : convertfinal(a[1], 18, 2)}
              console.log(a);
              setBalanceInfo(balanceInfo);
            }
            else{
              console.log("Klaytn is not present")
            }
          } catch (e) {
            console.log(e)
          }
    }
    
    const getLPValueCBRAmount = async (decimals, address, lpAmount, CBRUSD, setCBRAmount, setLPinUSD) => {
          try {
              const bondHelpContract = new caver.contract(bondHelpContractABI, bondHelpContractAddress);
              const parsedLPAmount = ethers.utils.parseUnits(lpAmount.toString(), decimals);
              const parsedCBRUSD = ethers.utils.parseUnits(CBRUSD.toString(), 4);
              console.log(parsedLPAmount);
              console.log(parsedCBRUSD);
              const a = await bondHelpContract.methods.getInputLPValueTokenAmount(address, parsedLPAmount, parsedCBRUSD).call();
              const lpinUSD = convertfinal(a[0], 18, 2)
              const cbrAmount = convertfinal(a[3], 9, 4)
              setLPinUSD(lpinUSD)
              setCBRAmount(cbrAmount)
          } catch (e) {
            console.log(e)
          }
    }

    const getKSPValue = async (setKSPPrice) => {         
          try {
              const bondHelpContract = new caver.contract(bondHelpContractABI, bondHelpContractAddress);
              const a = await bondHelpContract.methods.getRatioWithToken(KSPAddress).call();
              const b = convertfinal(a[0], 18, 4)
              setKSPPrice(b)
          } catch (e) {
            console.log(e)
          }
    }

    /*****************************BOND FUNCTION END*******************************/



    /*****************************AS FUNCTION*******************************/
    const auctionSwap = async (klayAmount) => {
        try {
            if (wallet==='mm') {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const ASContract = new ethers.Contract(auctionSwapContractAddress, auctionSwapContractABI, signer);
                const parsedAmount = ethers.utils.parseUnits(klayAmount.toString(), 18);
             
                const swap = await ASContract.pledge(parsedAmount, { value: parsedAmount, gasPrice : gasPrice_}, );
                setLoader(true);
                toast.info('Transaction has been submitted.');
                await swap.wait()
                setLoader(false);
                toast.success('Transaction successful!');
                }
              } catch (error) {
                console.log("something went wrong!")
                setLoader(false);
                toast.error('Transaction failed.');
                console.log(error);
              }
        
        try {
          if (wallet==='kk') {
              const caver = new Caver(klaytn);
              const ASContract = caver.contract.create(auctionSwapContractABI, auctionSwapContractAddress);
              const parsedAmount = ethers.utils.parseUnits(klayAmount.toString(), 18);
              const swap = await caver.klay.sendTransaction({
                type: 'SMART_CONTRACT_EXECUTION',
                from: account,
                to: auctionSwapContractAddress,
                data: ASContract.methods.pledge(parsedAmount).encodeABI(),
                value: parsedAmount,
                gas: '300000',
              })
              .on('transactionHash', (hash) => {setLoader(true); toast.info('Transaction has been submitted.');
              })
              .on('receipt', (receipt) => {setLoader(false); toast.success('Transaction successful!');
                // success
              })
              .on('error', (e) => {setLoader(false); toast.error('Transaction failed.');
                // failed
              });
              }
            } catch (error) {
              console.log("something went wrong!")
              setLoader(false);
              console.log(error);
            }

        try {
          const parsedAmount = ethers.utils.parseUnits(klayAmount.toString(), 18);
          if (wallet==='kl') {
              setKlipVisible(true);
              const {request_key} = await prepare.executeContract({
                bappName: 'Vector Finance',
                to: auctionSwapContractAddress,
                value: parsedAmount.toString(),
                abi: JSON.stringify({
                  "inputs": [
                    {
                      "internalType": "uint256",
                      "name": "klayAmount",
                      "type": "uint256"
                    }
                  ],
                  "name": "pledge",
                  "outputs": [],
                  "stateMutability": "payable",
                  "type": "function"
                }),
                params: `["${parsedAmount.toString()}"]`
              });
              console.log(request_key)
              setKlipTimer(dayjs()+300000);
              setKlipRequest(request_key); 
              console.log(request_key)
              var counter = 0;
              const looper = setInterval(async() => {
                counter ++;
                const res = await getResult(request_key);
                if (res.status === 'completed') {clearInterval(looper); setKlipVisible(false); toast.success('Transaction successful!')} 
                if (counter>300) {clearInterval(looper); setKlipVisible(false); }
            }, 1000);
              }
            } catch (error) {
              console.log("something went wrong!")
              setKlipVisible(false); 
              toast.error('Transaction failed.');
              console.log(error);
            }
    }
   
    const getAuctionSwapInfo = async (setGenInfo, setIndInfo) => {
      try {
          if (wallet==='mm') {
              const provider = new ethers.providers.Web3Provider(ethereum);
              const signer = provider.getSigner();
              const ASContract = new ethers.Contract(auctionSwapContractAddress, auctionSwapContractABI, provider);
              const ASgenInfo = await ASContract.getFrontGenInfo();
              const ASgenInfoObj = {
                  totalFund : convertfinal(ASgenInfo[0], 18, 0), 
                  goal : convertfinal(ASgenInfo[1], 18, 0), 
                  percent : convertfinal(ASgenInfo[2], 16, 0),
                  klayLeft : +convertfinal(ASgenInfo[1], 18, 0) - +convertfinal(ASgenInfo[0], 18, 0)
              }
              console.log(ASgenInfoObj)
              setGenInfo(ASgenInfoObj)

              const ASContractForInd = new ethers.Contract(auctionSwapContractAddress, auctionSwapContractABI, signer);
              const ASIndInfo = await ASContractForInd.getFrontIndInfo();
              
              const ASIndInfoObj = {
                  klayBalance : convertfinal(ASIndInfo[0], 18, 4),
                  VTRBalance : convertfinal(ASIndInfo[1], 9, 4)
              }
              setIndInfo(ASIndInfoObj)
              console.log(ASIndInfoObj)
          }else {
              console.log("Ethereum is not present");
            }
        } catch (error) {
          console.log("something went wrong!")
          console.log(error);
        }
      try {
        if (wallet==='kk') {
          const ASContract = new caver.contract(auctionSwapContractABI, auctionSwapContractAddress);
          const ASgenInfo = await ASContract.methods.getFrontGenInfo().call();
          const ASgenInfoObj = {
            totalFund : convertfinal(ASgenInfo[0], 18, 0), 
            goal : convertfinal(ASgenInfo[1], 18, 0), 
            percent : convertfinal(ASgenInfo[2], 16, 0),
            klayLeft : +convertfinal(ASgenInfo[1], 18, 0) - +convertfinal(ASgenInfo[0], 18, 0)
        }
          console.log(ASgenInfoObj)
          setGenInfo(ASgenInfoObj)
          
          const ASContractForInd = new caver.contract(auctionSwapContractABI, auctionSwapContractAddress);
          const ASIndInfo = await ASContractForInd.methods.getFrontIndInfo().call({
            from: account
          });
          const ASIndInfoObj = {
            klayBalance : convertfinal(ASIndInfo[0], 18, 4),
            VTRBalance : convertfinal(ASIndInfo[1], 9, 4)
        }
          setIndInfo(ASIndInfoObj)
        } else{
          console.log("Klaytn is not present")
        }
      } catch (e) {
        console.log(e)
      }

      try {
        if (wallet==='kl') {
          const ASContract = new caver.contract(auctionSwapContractABI, auctionSwapContractAddress);
          const ASgenInfo = await ASContract.methods.getFrontGenInfo().call();
          const ASgenInfoObj = {
            totalFund : convertfinal(ASgenInfo[0], 18, 0), 
            goal : convertfinal(ASgenInfo[1], 18, 0), 
            percent : convertfinal(ASgenInfo[2], 16, 0),
            klayLeft : +convertfinal(ASgenInfo[1], 18, 0) - +convertfinal(ASgenInfo[0], 18, 0)
        }
          console.log(ASgenInfoObj)
          setGenInfo(ASgenInfoObj)
          
          const ASContractForInd = new caver.contract(auctionSwapContractABI, auctionSwapContractAddress);
          const ASIndInfo = await ASContractForInd.methods.getFrontIndInfo().call({
            from: account
          });
          const ASIndInfoObj = {
            klayBalance : convertfinal(ASIndInfo[0], 18, 4),
            VTRBalance : convertfinal(ASIndInfo[1], 9, 4)
        }
          setIndInfo(ASIndInfoObj)
        } else{
          console.log("Klaytn is not present")
        }
      } catch (e) {
        console.log(e)
      }
    }

    const getKlayToVTR = async (setVTRAmount, klayAmount) => {
          try {
                const ASContract = new caver.contract(auctionSwapContractABI, auctionSwapContractAddress);
                const parsedAmount = ethers.utils.parseUnits(klayAmount.toString(), 18);
                const VTRAmount = await ASContract.methods.getVTRAmountforExactKlay(parsedAmount).call();
                setVTRAmount(convertfinal(VTRAmount, 9, 0))
          } catch (error) {
            console.log("something went wrong!")
            console.log(error);
          }
    }
    /*******************ZAP************* */
    /************************ ZAP ******* */

const zapEstimate = async (decimals, addressIn, tokenInAmount, setTokenOut) => {
  try {
      if (ethereum) {

          console.log(decimals)
          const provider = new ethers.providers.Web3Provider(ethereum);
          const zapContract = new ethers.Contract(zapContractAddress, zapContractABI, provider);

          const parsedInAmount = ethers.utils.parseUnits(tokenInAmount.toString(), decimals);


          const a = await zapContract.estimatePoswithUSDT(addressIn, parsedInAmount, KSPAddress);
          const tokenOutAmount = convertfinal(a, 18, 6)

          setTokenOut(tokenOutAmount)
          
      }
      else {
          console.log("Ethereum is not present");
        }
    } catch (error) {
      console.log("something went wrong!")

      console.log(error);
    }
}

const zap = async (decimals, addressIn, tokenInAmount) => {
  try {
      if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          
          const signer = provider.getSigner();
          const zapContract = new ethers.Contract(zapContractAddress, zapContractABI, signer);


          const parsedInAmount = ethers.utils.parseUnits(tokenInAmount.toString(), decimals);
          
          if(addressIn === zeroAddress)
          {
              await zapContract.swapthruUSDTwithKlay(KSPAddress, 1, parsedInAmount, { value: parsedInAmount, gasPrice : gasPrice_})
          } else 
          {
              await zapContract.swapthruUSDT(addressIn, parsedInAmount, KSPAddress, 1, {
                  gasPrice: gasPrice_
              })
          }
          
          
      }else {
          console.log("Ethereum is not present");
        }
    } catch (error) {
      console.log("something went wrong!")
      console.log(error);
    }
}


const zap_approve = async (address) => {
  try {
      if (wallet==='mm') {

          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const tokenContract = new ethers.Contract(address, tokenContractABI, signer);
          const inputString = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
          const parsedAmount = ethers.utils.parseUnits(inputString, 0)
          const approve = await tokenContract.approve(zapContractAddress, parsedAmount, {
              gasPrice: gasPrice_
          }); 
          toast.info('Transaction has been submitted.');
          setLoader(true);
          await approve.wait();
          toast.success('Transaction successful!');
          setLoader(false);
      }
    } catch (error) {
      console.log("something went wrong!")
      console.log(error);
      toast.error('Transaction failed.');
      setLoader(false);
    }
      try {
        if (wallet==='kk') {
            const caver = new Caver(klaytn);
            const tokenContract = caver.contract.create(tokenContractABI, address);
            const inputString = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
            const parsedAmount = ethers.utils.parseUnits(inputString, 0)
            const approve = await caver.klay.sendTransaction({
              type: 'SMART_CONTRACT_EXECUTION',
              from: account,
              to: address,
              data: tokenContract.methods.approve(zapContractAddress, parsedAmount).encodeABI(),
              gas: '300000',
            })
            .on('transactionHash', (hash) => {toast.info('Transaction has been submitted.'); setLoader(true);
            })
            .on('receipt', (receipt) => {toast.success('Transaction successful!'); setLoader(false);
              // success
            })
            .on('error', (e) => {toast.error('Transaction failed.'); setLoader(false);
              // failed
            });
            }
          } catch (error) {
            setLoader(false);
            console.log("something went wrong!")
            console.log(error);
          }

      try {
        const inputString = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
        const parsedAmount = ethers.utils.parseUnits(inputString, 0)
        if (wallet==='kl') {
            setKlipVisible(true);
            const {request_key} = await prepare.executeContract({
              bappName: 'Vector Finance',
              to: address,
              value: '0',
              abi: JSON.stringify({
                "constant": false,
                "inputs": [
                    {
                        "name": "_spender",
                        "type": "address"
                    },
                    {
                        "name": "_value",
                        "type": "uint256"
                    }
                ],
                "name": "approve",
                "outputs": [
                    {
                        "name": "",
                        "type": "bool"
                    }
                ],
                "payable": false,
                "stateMutability": "nonpayable",
                "type": "function"
            }),
              params: `["${bondContractAddress}","${parsedAmount.toString()}"]`
            });
            console.log(request_key)
            setKlipTimer(dayjs()+300000);
            setKlipRequest(request_key); 
            console.log(request_key)
            var counter = 0;
            const looper = setInterval(async() => {
              counter ++;
              const res = await getResult(request_key);
              if (res.status === 'completed') {clearInterval(looper); setKlipVisible(false); toast.success('Transaction successful!')} 
              if (counter>300) {clearInterval(looper); setKlipVisible(false);}
          }, 1000);
            }
          } catch (error) {
            setKlipVisible(false); 
            toast.error('Transaction failed.');
            console.log("something went wrong!")
            console.log(error);
          }
}
const zap_getAllowance = async(address, setAllowance) => {
if (wallet==='mm') {
  const accounts = await ethereum.request({ method: "eth_accounts" });
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const tokenContract = new ethers.Contract(address, tokenContractABI, signer);
  const allowance = await tokenContract.allowance(accounts[0], bondContractAddress);
  const bignum = "15792089237316195423570985008687907853269984665640564039457584007913129639935"
  const parsedAmount = ethers.utils.parseUnits(bignum, 0)
  console.log(allowance)
  console.log(parsedAmount)
  setAllowance(allowance.gt(parsedAmount))
}

if (wallet==='kk') {
  const tokenContract = new caver.contract(tokenContractABI, address);
  const method = await tokenContract.methods.allowance(account, bondContractAddress).call({
    from: account,
  });
  const allowance = caver.utils.BigNumber(method);
  const bignum = "15792089237316195423570985008687907853269984665640564039457584007913129639935"
  const parsedAmount = ethers.utils.parseUnits(bignum, 0)
  console.log(allowance)
  console.log(parsedAmount)
  setAllowance(allowance.gt(parsedAmount))
}

if (wallet==='kl') {
  const tokenContract = new caver.contract(tokenContractABI, address);
  const method = await tokenContract.methods.allowance(account, bondContractAddress).call({
    from: account,
  });
  const allowance = caver.utils.BigNumber(method);
  const bignum = "15792089237316195423570985008687907853269984665640564039457584007913129639935";
  const parsedAmount = caver.utils.BigNumber(bignum);
  console.log(allowance)
  console.log(parsedAmount)
  setAllowance(allowance.gt(parsedAmount))
}

}


    /* kaikas */    
    const connectWalletKlay = async () => {
      try {
          if (!klaytn) return toast.error('Please install Kaikas wallet.');
          const accounts = await klaytn.enable();
          localStorage.setItem('wallet', 'kk');
          localStorage.setItem('address', accounts[0]);
          setAccount(accounts[0]);
          setWallet('kk');
          toast.success('Connected to Kaikas wallet.');
          console.log(account)
      } catch (error) {
          console.log(error);  
          toast.error('Falied to connect to Kaikas wallet.');
      }
  };

    /* Klip */
    const connectWalletKlip = async () => {
      const bappName = 'Vector Finance'
      try{
        const {request_key} = await prepare.auth({bappName})
        setKlipTimer(dayjs()+300000);
        setKlipRequest(request_key); 
        console.log(request_key)
        var counter = 0;
        const looper = setInterval(async() => {
          counter ++;
          const res = await getResult(request_key);
          if (res.status === 'completed') {localStorage.setItem('wallet', 'kl'); localStorage.setItem('address', res.result.klaytn_address); clearInterval(looper); setKlipVisible(false); setAccount(res.result.klaytn_address); setWallet('kl'); toast.success('Connected to Klip wallet.');} 
          if (counter>300) {clearInterval(looper); toast.error('Falied to connect to Klip wallet.')}   
        }, 1000);
      } catch (e) {toast.error('Falied to connect to Klip wallet.')};
    }
    

    useEffect(() => {
        setNetwork();
        checkIfWalletIsConnect();
      }, []);

      return (
        <Context.Provider
          value={{
           connectWallet,
           getStakeInfo,
           setNetwork,
           setCBR,
           setsCBR,
           stake,
           unstake,
           newNet,
           getKSPValue,
           getLPValueCBRAmount,
           getUserStableLPvalue,
           getAuctionSwapInfo, 
           getKlayToVTR,
           auctionSwap,
           getRealTimeDiscountRatePrice,
           bond, 
           approve, 
           getAllowance, 
           zap_approve, 
           zap_getAllowance,
           zapEstimate,
           zap,
           connectWalletKlay,
           connectWalletKlip,
           klipRequest,
           klipTimer,
           klipVisible,
           setKlipVisible,
           checked,
           setChecked,
           loader,
          }}
        >
          {children}
        </Context.Provider>
      );
};