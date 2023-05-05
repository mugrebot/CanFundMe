import React, { useEffect, useState } from "react";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { EventAnimation } from "./EventAnimation";
import { EtherInput, IntegerInput } from "./scaffold-eth";
import { ethers, utils } from "ethers";
import { Button, Checkbox, Counter, Frame, Hourglass, NumberInput, ProgressBar, Window, WindowHeader } from "react95";
import Draggable from "react-draggable";
import styled from "styled-components";
import { useProvider, useAccount, useSigner, useContract } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import {
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";
import IERC20_ABI from "./IERC20.json";
import { useDarkMode } from "usehooks-ts";
import { StyledButton, StyledWindow, StyledSelect, StyledWindowHeader } from "~~/components/styledcomponents";
import { Abi, ExtractAbiFunctionNames } from "abitype";

// Add these styled components
const Wrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  padding: 5rem;
`;

const ProgressBarContainer = styled.div`
  max-width: 200px;
`;

export const CanFund = ({ contractAddress }) => {
  const [amount, setAmount] = useState();
  const [_accept_note, setAcceptNote] = useState(false);
  const [txHash, setTxHash] = useState("");

  const {isDarkMode} = useDarkMode();

  // Create a useRef for each draggable Window
  const window1Ref = React.useRef(null);
  const window2Ref = React.useRef(null);
  const window3Ref = React.useRef(null);

  const IERC20ABI = IERC20_ABI.abi;

  const { data: signer } = useSigner();

  const provider = useProvider();

  const { address: account } = useAccount();

  const { data: deployedContractData } = useDeployedContractInfo("CanFundMe");

  const CanFundMeABI = deployedContractData?.abi as Abi;

  const { writeAsync: fundMeAsync, isLoading: fundMeIsLoading } = useScaffoldContractWrite({
    contractName: "CanFundMe",
    functionName: "fundMe",
    value: amount && amount?.toString(),
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { writeAsync: contributeWithTokenAsync, isLoading: contributeWithTokenIsLoading } = useScaffoldContractWrite({
    contractName: "CanFundMe",
    functionName: "contributeWithToken",
    address: contractAddress,
    abi: CanFundMeABI,
    args: [`${amount}`],
  });

  const { data: note_balance } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "token_balance",
    address: contractAddress,
    abi: CanFundMeABI,
  });


  const { data: threshold } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "threshold",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: time_limit } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "time_limit",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: funded } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "funded",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: threshold_crossed } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "threshold_crossed",
    address: contractAddress,
    abi: CanFundMeABI,
  });


  const { writeAsync: gitcoin, isLoading: gitcoinLoading } = useScaffoldContractWrite({
    contractName: "CanFundMe",
    functionName: "updateFeeStatusGitcoin",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: note_threshold } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "note_threshold",
    address: contractAddress,
    abi: CanFundMeABI,
    });

  //set below to type number
  const [contract_balance, setContractBalance] = useState();

  
  const contract = useContract({
    address: contractAddress,
    abi: CanFundMeABI,
    signerOrProvider: signer,

  });


  const fetchContractBalance = async () => {
    const balance = await contract?.provider?.getBalance(contractAddress);
    if (balance) {
      const balance_ether = utils.formatUnits(balance, 'ether');
      setContractBalance(balance_ether);
    }
  };

  useEffect(() => {
    fetchContractBalance();
  }, [contractAddress]);

  const handleAmountChange = value => {
    setAmount(value);
  };

  const getTimeRemaining = timestamp => {
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = timestamp - currentTime;

    const days = Math.floor(remainingSeconds / (60 * 60 * 24));
    const hours = Math;
    const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
    const seconds = Math.floor(remainingSeconds % 60);

    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
  };

  const getTimeRemainingInSeconds = timestamp => {
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = timestamp - currentTime;
    return remainingSeconds;
  };

  const calculateProgress = (balance, threshold) => {
    const progress_canto = (1 - (Number(threshold)*10**-18 - balance)/(Number(threshold)*10**-18))*100;
    const progress_note = (1 - (Number(note_threshold) - Number(note_balance))/(Number(note_threshold)))*100; 
    //return the larger value of the two
    const progress = Math.max(progress_canto, progress_note);
    return progress.toFixed(0);
  };
  

  useEffect(() => {
    const interval = setInterval(() => {
      fetchContractBalance();
    }, 100);

    return () => clearInterval(interval);
  }, [contractAddress]);

  const [timeRemaining, setTimeRemaining] = useState(getTimeRemainingInSeconds(time_limit));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemainingInSeconds(time_limit));
    }, 1000);

    return () => clearInterval(interval);
  }, [time_limit]);

  const clear = () => {
    setAmount("");
  };

  // Calculate default positions
  const calculateDefaultPositions = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const window1Width = window1Ref.current?.offsetWidth || 400;
    const window1Height = window1Ref.current?.offsetHeight || 290;

    const window2Width = window2Ref.current?.offsetWidth || 276;
    const window2Height = window2Ref.current?.offsetHeight || 89;

    const window3Width = window3Ref.current?.offsetWidth || 200;
    const window3Height = window3Ref.current?.offsetHeight || 79;

    //find the total width of the screen
    const totalHeight = Math.max(window1Height, window2Height, window3Height);

    const timeRemainingWindowPosition = {
      x: windowWidth / 10000 + 10,
      y: windowHeight / 10000,
    };
    const fundingProgressWindowPosition = {
      x: windowWidth / 9000 + 10,
      y: windowHeight / 9000,
    };
    const fundMeWindowPosition = {
      x: windowWidth / 8000 + 10,
      y: windowHeight / 8000,
    };

    return { timeRemainingWindowPosition, fundingProgressWindowPosition, fundMeWindowPosition };
  };

  const resetPositions = () => {
    const { timeRemainingWindowPosition, fundingProgressWindowPosition, fundMeWindowPosition } =
      calculateDefaultPositions();

    window1Ref.current.style.transform = `translate(${fundMeWindowPosition.x}px, ${fundMeWindowPosition.y}px)`;
    window2Ref.current.style.transform = `translate(${timeRemainingWindowPosition.x}px, ${timeRemainingWindowPosition.y}px)`;
    window3Ref.current.style.transform = `translate(${fundingProgressWindowPosition.x}px, ${fundingProgressWindowPosition.y}px)`;
  };

  const { timeRemainingWindowPosition, fundingProgressWindowPosition, fundMeWindowPosition } =
    calculateDefaultPositions();

    const handleApproveClick = async () => {
      
      try {
        const erc20 = new ethers.Contract('0x03F734Bd9847575fDbE9bEaDDf9C166F880B5E5f', IERC20ABI, signer);
        console.log(erc20);
        const tx = await erc20.approve(contractAddress, amount);
        setTxHash(tx.hash);
        
      } catch (error) {
        console.error("Error in handleApproveClick:", error);
      }
    };



    const handleAddFundsClick = async () => {
      if (_accept_note) {
        try {
          // Initialize the token contract
    
          // Approve the CanFundMe contract to spend 'amount' tokens on behalf of the user
    
          // Call the 'contributeWithToken' function on the CanFundMe contract
          await contributeWithTokenAsync();
        } catch (error) {
          console.error("Error in handleAddFundsClick:", error);
        }
      } else {
        await fundMeAsync();
      }
    };

  return (
    <div>
      <div>
        <EventAnimation contractAddress={contractAddress} />
      </div>
      <div>
        <Draggable nodeRef={window2Ref} bounds="body" defaultPosition={timeRemainingWindowPosition}>
          <StyledWindow isDarkMode={isDarkMode} ref={window2Ref}>
            <div>
              <h3>Time Remaining:</h3>
              {time_limit && getTimeRemainingInSeconds(time_limit) > 0 && (
                <Counter minLength={11} value={getTimeRemainingInSeconds(time_limit)} />
              )}
              {time_limit && getTimeRemainingInSeconds(time_limit) < 0 && <Counter minLength={11} value={0} />}
            </div>
          </StyledWindow>
        </Draggable>
        <Draggable nodeRef={window3Ref} bounds="body" defaultPosition={fundingProgressWindowPosition}>
          <ProgressBarContainer ref={window3Ref}>
            <StyledWindow isDarkMode={isDarkMode} ref={window3Ref}>
              <div>
                <h3>Funding Progress:</h3>
                {!threshold_crossed && contract_balance && threshold && (
                  <ProgressBar  style={{ width: 289 }} value={calculateProgress(contract_balance, threshold)} />
                )}
                {threshold_crossed && note_balance && note_threshold && (
                  <ProgressBar style={{  width: 289 }} value={100} />
                )}

              </div>
            </StyledWindow>
          </ProgressBarContainer>
        </Draggable>
        <Draggable nodeRef={window1Ref} bounds="body" defaultPosition={fundMeWindowPosition} handle=".window-title">
          <StyledWindow isDarkMode={isDarkMode} style={{ height: 400, width: 301 }} shadow={true} ref={window1Ref}>
            <StyledWindowHeader isDarkMode={isDarkMode} className="window-title">
              <span>FundMe.exe</span>
              <StyledButton isDarkMode={isDarkMode} onClick={resetPositions}>
                <span className="close-icon" />
              </StyledButton>
            </StyledWindowHeader>
            <div>
              <h3>Canto Threshold:</h3>
              {threshold*10**-18 && <span>{(threshold*10**-18).toString()}</span>}
            </div>
            <h3>NoteThreshold</h3>
            {note_threshold*10**-18 && <span>{(note_threshold*10**-18).toString()}</span>}
            <div>
              <h3>Funded:</h3>
              {threshold_crossed && threshold_crossed.toString()}
            </div>
            <div>
              <h3>Contract Balance:</h3>
              {contract_balance} CANTO
              <br />
              {Number(note_balance) * 10**-18} NOTE
            </div>

            <div>
              <h3>Amount:</h3>
              <IntegerInput value={amount} name={"amount"} placeholder="0" onChange={handleAmountChange} />
            </div>
            <label>Sending Note?</label>
            <Checkbox checked={_accept_note} onChange={value => setAcceptNote(!_accept_note)} />
            <div style={{ padding: 0 }}>
              <StyledButton isDarkMode={isDarkMode} onClick={handleAddFundsClick} disabled={fundMeIsLoading || contributeWithTokenIsLoading}>
                {fundMeIsLoading || contributeWithTokenIsLoading ? "Funds..." : "Funds"}
              </StyledButton>
              <StyledButton isDarkMode={isDarkMode} onClick={gitcoin} disabled={gitcoinLoading}>
                {gitcoinLoading ? "Loading..." : "Gitcoin"}
              </StyledButton>
              <StyledButton isDarkMode={isDarkMode} onClick={handleApproveClick}>
                Approve
              </StyledButton>
              <StyledButton isDarkMode={isDarkMode} onClick={clear} disabled={!amount || fundMeIsLoading}>
    Clear
  </StyledButton> 
            </div>
          </StyledWindow>
        </Draggable>
      </div>
    </div>
  );
};

export default CanFund;
