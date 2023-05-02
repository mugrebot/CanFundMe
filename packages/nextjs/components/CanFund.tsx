import React, { useEffect, useRef, useState } from "react";
import CanFundMe_ABI from "../../hardhat/artifacts/contracts/CanFundMe.sol/CanFundMe.json";
import { EventAnimation } from "./EventAnimation";
import { EtherInput, IntegerInput } from "./scaffold-eth";
import { ethers, utils } from "ethers";
import { Button, Checkbox, Counter, Frame, Hourglass, NumberInput, ProgressBar, Window, WindowHeader } from "react95";
import Draggable from "react-draggable";
import styled from "styled-components";
import { useProvider } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import {
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";

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
  const [_accept_note, setAcceptNote] = useState(true || false);

  // Create a useRef for each draggable Window
  const window1Ref = React.useRef(null);
  const window2Ref = React.useRef(null);
  const window3Ref = React.useRef(null);

  const CanFundMeABI = CanFundMe_ABI.abi;

  const provider = useProvider();

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
    args: ["0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503", amount],
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

  //set below to type number
  const [contract_balance, setContractBalance] = useState();

  const contract = new ethers.Contract(contractAddress, CanFundMeABI, provider);

  const fetchContractBalance = async () => {
    const balance = await contract?.provider.getBalance(contractAddress);
    if (balance) {
      const balance_ether = utils.formatEther(balance);
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
    const progress = (parseFloat(balance) / parseFloat(utils.formatEther(threshold))) * 100;
    return Math.min(progress, 100); // Clamp the value between 0 and 100
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

  const handleAddFundsClick = async () => {
    if (_accept_note) {
      await contributeWithTokenAsync();
    } else {
      await fundMeAsync();
    }
  };

  return (
    <div>
      <div style={{ zIndex: -100 }}>
        <EventAnimation contractAddress={contractAddress} />
      </div>
      <div style={{ zIndex: 0 }}>
        <Draggable nodeRef={window2Ref} bounds="body" defaultPosition={timeRemainingWindowPosition}>
          <Window ref={window2Ref}>
            <div>
              <h3>Time Remaining:</h3>
              {time_limit && getTimeRemainingInSeconds(time_limit) > 0 && (
                <Counter minLength={8} value={getTimeRemainingInSeconds(time_limit)} />
              )}
              {time_limit && getTimeRemainingInSeconds(time_limit) < 0 && <Counter minLength={8} value={0} />}
            </div>
          </Window>
        </Draggable>
        <Draggable nodeRef={window3Ref} bounds="body" defaultPosition={fundingProgressWindowPosition}>
          <ProgressBarContainer ref={window3Ref}>
            <Window ref={window3Ref}>
              <div>
                <h3>Funding Progress:</h3>
                {contract_balance && threshold && (
                  <ProgressBar style={{ width: 212 }} value={calculateProgress(contract_balance, threshold)} />
                )}
              </div>
            </Window>
          </ProgressBarContainer>
        </Draggable>
        <Draggable nodeRef={window1Ref} bounds="body" defaultPosition={fundMeWindowPosition}>
          <Window style={{ height: 350, width: 223 }} shadow={true} ref={window1Ref}>
            <WindowHeader className="window-title">
              <span>FundMe.exe</span>
              <Button onClick={resetPositions}>
                <span className="close-icon" />
              </Button>
            </WindowHeader>
            <div>
              <h3>Threshold:</h3>
              {threshold && <span>{threshold.toString()}</span>}
            </div>

            <div>
              <h3>Funded:</h3>
              {funded && funded.toString()}
            </div>
            <div>
              <h3>Contract Balance:</h3>
              {contract_balance} Canto
            </div>

            <div>
              <h3>Amount:</h3>
              <IntegerInput value={amount} name={"amount"} placeholder="0" onChange={handleAmountChange} />
            </div>
            <label>Sending Note?</label>
            <Checkbox checked={_accept_note} onChange={value => setAcceptNote(!_accept_note)} />
            <div style={{ padding: 5 }}>
              <Button onClick={handleAddFundsClick} disabled={fundMeIsLoading || contributeWithTokenIsLoading}>
                {fundMeIsLoading || contributeWithTokenIsLoading ? "Adding Funds..." : "Add Funds"}
              </Button>
              <Button onClick={clear} disabled={!amount || fundMeIsLoading}>
                Clear
              </Button>
            </div>
          </Window>
        </Draggable>
      </div>
    </div>
  );
};

export default CanFund;
