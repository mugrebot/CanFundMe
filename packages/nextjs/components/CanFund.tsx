import React, { useEffect, useState } from "react";
import { EventAnimation } from "./EventAnimation";
import IERC20_ABI from "./IERC20.json";
import { IntegerInput } from "./scaffold-eth";
import { Abi } from "abitype";
import { ethers, utils } from "ethers";
import { Checkbox, Counter, ProgressBar } from "react95";
import Draggable from "react-draggable";
import styled from "styled-components";
import { useDarkMode } from "usehooks-ts";
import { useContract, useSigner, useProvider } from "wagmi";
import { StyledButton, StyledWindow, StyledWindowHeader, StyledProgressBar } from "~~/components/styledcomponents";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import QRCode from "qrcode";

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

const StyledSvg = styled.div`
  svg {
    ${({ isDarkMode }) => isDarkMode && `
      filter: invert(1);
    `}
  }
  
`;

export const CanFund = ({ contractAddress }) => {
  const [amount, setAmount] = useState("");
  const [_accept_note, setAcceptNote] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [_qrCode, setQRCode] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);



  const { isDarkMode } = useDarkMode();

  // Create a useRef for each draggable Window
  const window1Ref = React.useRef(null);
  const window2Ref = React.useRef(null);
  const window3Ref = React.useRef(null);


  const IERC20ABI = IERC20_ABI.abi;

  const { data: signer } = useSigner();

  const provider = useProvider();

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

  const { writeAsync: withdrawCantoAsync, isLoading: withdrawCantoIsLoading } = useScaffoldContractWrite({
    contractName: "CanFundMe",
    functionName: " withdraw_threshold_missed",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { writeAsync: withdrawNoteAsync, isLoading: withdrawNoteIsLoading } = useScaffoldContractWrite({
    contractName: "CanFundMe",
    functionName: "withdraw_threshold_missed_with_token",
    address: contractAddress,
    abi: CanFundMeABI,
  });



  //set below to type number
  const [contract_balance, setContractBalance] = useState("");

  const contract = useContract({
    address: contractAddress,
    abi: CanFundMeABI,
    signerOrProvider: provider,
  });

  const fetchContractBalance = async () => {
    const balance = await contract?.provider?.getBalance(contractAddress);
    if (balance) {
      const balance_ether = utils.formatUnits(balance, "ether");
      setContractBalance(balance_ether);
    }
  };

  useEffect(() => {
    fetchContractBalance();
  });

  const handleAmountChange = (value: React.SetStateAction<number>) => {
    setAmount(value);
  };

  const getTimeRemainingInSeconds = (timestamp: number) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = timestamp - currentTime;
    return remainingSeconds;
  };

  useEffect(() => {
    const updateRemainingTime = () => {
      const remainingSeconds = getTimeRemainingInSeconds(time_limit);
      setRemainingTime(remainingSeconds);
    };

    updateRemainingTime(); // initial update
    const interval = setInterval(updateRemainingTime, 1000); // 1000 milliseconds (1 second) interval for updating time

    return () => clearInterval(interval);
  }, [time_limit]);



  const calculateProgress = (balance: number, threshold: number) => {
    if (Number(threshold * 10 ** -18) > Number(balance)) {
      const progress_canto = (Number(balance) / (Number(threshold) * 10 ** -18)) * 100;
      const progress_note = (Number(note_balance) / (Number(note_threshold) * 10 ** -18)) * 100;
      //return the larger value of the two
      const progress = Math.max(progress_canto, progress_note);
      return progress.toFixed(0);
    } else {
      return 100;
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      fetchContractBalance();
    }, 100);

    return () => clearInterval(interval);
  });

  const clear = () => {
    setAmount("");
  };

  // Calculate default positions
  const calculateDefaultPositions = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const timeRemainingWindowPosition = {
      x: windowWidth / 10000,
      y: windowHeight / 10000,
    };
    const fundingProgressWindowPosition = {
      x: windowWidth / 9000,
      y: windowHeight / 9000,
    };
    const fundMeWindowPosition = {
      x: windowWidth / 8000,
      y: windowHeight / 8000,
    };
    const qrCodeWindowPosition = {
      x: windowWidth/8,
      y: windowHeight/10000,
    };

    return { timeRemainingWindowPosition, fundingProgressWindowPosition, fundMeWindowPosition, qrCodeWindowPosition };
  };

  const resetPositions = () => {
    window1Ref.current.style.transform = `translate(${fundMeWindowPosition.x}px, ${fundMeWindowPosition.y}px)`;
    window2Ref.current.style.transform = `translate(${timeRemainingWindowPosition.x}px, ${timeRemainingWindowPosition.y}px)`;
    window3Ref.current.style.transform = `translate(${fundingProgressWindowPosition.x}px, ${fundingProgressWindowPosition.y}px)`;
  };

  const { timeRemainingWindowPosition, fundingProgressWindowPosition, fundMeWindowPosition, qrCodeWindowPosition } =
    calculateDefaultPositions();

  const handleApproveClick = async () => {
    try {
      const erc20 = new ethers.Contract("0x03F734Bd9847575fDbE9bEaDDf9C166F880B5E5f", IERC20ABI, signer);
      console.log(erc20);
      const tx = await erc20.approve(contractAddress, amount);
      console.log(tx.hash);
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

    
  useEffect(() => {
    async function fetchQr() {
      const qr_string = await QRCode.toString(contractAddress, { type: "svg", color: { dark: "#06fc99", light:"#00190f" } });
      setQRCode(qr_string);
    }

    fetchQr();
  }, [contractAddress]);


  return (
    <div>
      <div>
        <EventAnimation contractAddress={contractAddress} />
      </div>
      <div>
              {remainingTime<=0 && !threshold_crossed &&  <StyledWindow
  isDarkMode={isDarkMode}
  style={{
    height: 150,
    width: 250,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }}
  shadow={true}
>
  <StyledWindowHeader isDarkMode={isDarkMode} className="window-title">
    threshold_missed.exe
  </StyledWindowHeader>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <label>Withdraw Note?</label>
    <Checkbox variant="flat" checked={_accept_note} onChange={() => setAcceptNote(!_accept_note)} />
  </div>
  {!_accept_note && (
    <StyledButton
      variant="flat"
      isDarkMode={isDarkMode}
      onClick={withdrawCantoAsync}
      disabled={withdrawCantoIsLoading}
    >
      {withdrawCantoIsLoading ? "Loading..." : "Withdraw"}
    </StyledButton>
  )}
  {_accept_note && (
    <StyledButton
      variant="flat"
      isDarkMode={isDarkMode}
      onClick={withdrawNoteAsync}
      disabled={withdrawNoteIsLoading}
    >
      {withdrawNoteIsLoading ? "Loading..." : "Withdraw"}
    </StyledButton>
  )}
</StyledWindow>}
        <Draggable nodeRef={window2Ref} bounds="body" defaultPosition={timeRemainingWindowPosition}>
          <StyledWindow isDarkMode={isDarkMode} ref={window2Ref}>
            <div>
              <h3>Time Remaining:</h3>
              {time_limit && remainingTime > 0 && (
                <Counter minLength={11} value={remainingTime} />
              )}
              {time_limit && remainingTime < 0 && <Counter minLength={11} value={0} />}
            </div>
          </StyledWindow>
        </Draggable>
        <Draggable nodeRef={window3Ref} bounds="body" defaultPosition={fundingProgressWindowPosition}>
          <ProgressBarContainer ref={window3Ref}>
            <StyledWindow isDarkMode={isDarkMode} ref={window3Ref}>
              <div>
                <h3>Funding Progress:</h3>
                {!threshold_crossed && contract_balance && threshold && (
                  <StyledProgressBar isDarkMode={isDarkMode} style={{ width: 289}} value={Number(calculateProgress(contract_balance, threshold))} />
                )}
                {threshold_crossed && (
                  <StyledProgressBar isDarkMode={isDarkMode} style={{ width: 289 }} value={100} />
                )}
              </div>
            </StyledWindow>
          </ProgressBarContainer>
        </Draggable>
        <Draggable nodeRef={window1Ref} bounds="body" defaultPosition={fundMeWindowPosition} handle=".window-title">
          <StyledWindow isDarkMode={isDarkMode} style={{ height: 400, width: 301 }} shadow={true} ref={window1Ref}>
            <StyledWindowHeader isDarkMode={isDarkMode} className="window-title">
              <span>FundMe.exe</span>
              <StyledButton variant='flat' isDarkMode={isDarkMode} onClick={resetPositions}>
                /
              </StyledButton>
            </StyledWindowHeader>
            <div>
              <h3>Canto Threshold:</h3>
              {threshold * 10 ** -18 && <span>{(threshold * 10 ** -18).toString()}</span>}
            </div>
            <h3>NoteThreshold</h3>
            {note_threshold * 10 ** -18 && <span>{(note_threshold * 10 ** -18).toString()}</span>}
            <div>
              <h3>Funded:</h3>
              {threshold_crossed && threshold_crossed.toString()}
            </div>
            <div>
              <h3>Contract Balance:</h3>
              {contract_balance} CANTO
              <br />
              {Number(note_balance) * 10 ** -18} NOTE
            </div>

            <div>
              <h3>Amount:</h3>
              <IntegerInput value={amount} name={"amount"} placeholder="0" onChange={handleAmountChange} />
            </div>
            <label>Sending Note?</label>
            <Checkbox variant='flat' checked={_accept_note} onChange={() => setAcceptNote(!_accept_note)} />
            <div style={{ padding: 0 }}>
            { _accept_note && <StyledButton variant='flat' isDarkMode={isDarkMode} onClick={handleApproveClick} disabled={!_accept_note}> 
                Approve
              </StyledButton> }
              <StyledButton
                variant='flat'
                isDarkMode={isDarkMode}
                onClick={handleAddFundsClick}
                disabled={fundMeIsLoading || contributeWithTokenIsLoading}
              >
                {fundMeIsLoading || contributeWithTokenIsLoading ? "Funding..." : "Fund"}
              </StyledButton>
              <StyledButton variant='flat' isDarkMode={isDarkMode} onClick={gitcoin} disabled={gitcoinLoading}>
                {gitcoinLoading ? "Loading..." : "Gitcoin"}
              </StyledButton>
              <StyledButton variant="thin" isDarkMode={isDarkMode} onClick={clear} disabled={!amount || fundMeIsLoading}>
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
