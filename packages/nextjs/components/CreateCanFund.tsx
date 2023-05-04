import React, { useEffect, useState, useRef } from "react";
import { Button, Window, TextInput, Select, Checkbox, WindowHeader } from "react95";
import { useScaffoldContract, useScaffoldContractWrite, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { ContractAbi, ContractName, UseScaffoldWriteConfig } from "~~/utils/scaffold-eth/contract";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { AddressInput, EtherInput, IntegerInput } from "./scaffold-eth";
import { isAddress } from "ethers/lib/utils";
import { ethers, utils } from "ethers";
import { useAccount } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useRouter } from "next/router";
import Draggable from "react-draggable"; // Import Draggable
import { useDarkMode } from "usehooks-ts";
import { StyledButton, StyledSelect, StyledWindow, StyledWindowHeader, StyledTextInput } from "./styledcomponents";
import { DraggableBounds } from "react-draggable";
import { useWindowSize } from 'usehooks-ts'



const CreateCanFund: React.FC = () => {
  const { width, height } = useWindowSize();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState();
  const [timelimit, setTimelimit] = useState();
  const [benificiaryInput, setBenificiaryInput] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: width*0.85, bottom: height*0.85 } as DraggableBounds);

  const [_note_threshold, setNoteThreshold] = useState(undefined || 0);

  const window1Ref = React.useRef(null);
  const window2Ref = React.useRef(null);


  const { address: account } = useAccount();

  const factory = useScaffoldContract({
    contractName: "CanFundMeFactory",
  });

  const { isDarkMode } = useDarkMode();

  const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "CanFundMeFactory",
    functionName: "createCanFundMe",
    address: factory.data?.address,
    abi: deployedContractData?.abi as Abi,
    args: [benificiaryInput, goal, timelimit, _note_threshold],
  });

  const { data: CanFundAddresses } = useScaffoldContractRead({
    contractName: "CanFundMeFactory",
    functionName: "getCanFundMeAddresses",
    args: [account],
  });

  const { data: gitcoin_score } = useScaffoldContractRead({
    contractName: "CanFundMeFactory",
    functionName: "gitcoin_scores",
    args: [account],
  });

  const { writeAsync: createGitcoinCanFundMe, isLoading: isGitcoinLoading } = useScaffoldContractWrite({
    contractName: "CanFundMeFactory",
    functionName: "createCanFundMeGitcoin",
    address: factory.data?.address,
    abi: deployedContractData?.abi as Abi,
    args: [benificiaryInput, goal, timelimit, _note_threshold, gitcoin_score],
  });

  console.log(CanFundAddresses);

  const addressOptions = CanFundAddresses?.map((address: string) => ({ value: address, label: address })) || [];

  useEffect (() => {
    if (!selectedAddress) {
      setSelectedAddress(addressOptions[0]?.value);
    }
  });


  const router = useRouter();

  const handleManageClick = () => {
    if (selectedAddress) {
      router.push(`/Manage/${selectedAddress}`);
    }
  };

  const handleSelectChange = (selectedOption) => {
    setSelectedAddress(selectedOption.value);
  };

  const [createWindowPosition, setCreateWindowPosition] = useState({ x: 50, y: 50 });
  const [manageWindowPosition, setManageWindowPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const calculateCenterPosition = (windowWidth, windowHeight) => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const xPos = (screenWidth - windowWidth) / 2;
      const yPos = (screenHeight - windowHeight) / 2;

      return { x: xPos, y: yPos };
    };

    setCreateWindowPosition(calculateCenterPosition(400, 290));
    setManageWindowPosition(calculateCenterPosition(276, 89));
  }, []);

  const resetPositions = () => {
    setCreateWindowPosition({x: 0, y: 0});
    setManageWindowPosition({x: 0, y: 0});


  };

  const calculateViewportBounds = () => {
    const viewportWidth = width;
    const viewportHeight = height;


  
    const bounds: DraggableBounds = {
      left: 50,
      right: viewportWidth *0.75,
      top: 50,
      bottom: viewportHeight*0.50,
    };
  
    return bounds;
  };
  
  useEffect(() => {
    const handleResize = () => {
      setBounds(calculateViewportBounds());
    };
  
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  return (
    <div>
      <Draggable defaultPosition={createWindowPosition} bounds={calculateViewportBounds()} handle='.window-title'>
      <StyledWindow isDarkMode={isDarkMode}>
          <StyledWindowHeader isDarkMode={isDarkMode} className="window-title">
          <span>create</span>
            <StyledButton isDarkMode={isDarkMode} onClick={resetPositions}>
              <span className="close-icon"></span>
            </StyledButton>
          </StyledWindowHeader>
            <label>Name:</label>
            <TextInput value={name} onChange={(e) => setName(e.target?.value)} />
            <label>Description:</label>
            <TextInput value={description} onChange={(e) => setDescription(e.target?.value)} />
            <label>Goal:</label>
            <IntegerInput value={goal} onChange={(value) => setGoal(value)} />


            <label>Time limit:</label>
            <IntegerInput value={timelimit} onChange={(value) => setTimelimit(value)} />

            <label>Beneficiary:</label>
            <AddressInput value={benificiaryInput} onChange={(value) => setBenificiaryInput(value)} />

          <label>Note Goal</label>
          <IntegerInput value={_note_threshold} onChange={(value) => setNoteThreshold(value)} />
<div style={{textAlign: 'center'}}>
          {gitcoin_score > 10 ? (
  <StyledButton isDarkMode={isDarkMode} onClick={createGitcoinCanFundMe} disabled={isGitcoinLoading}>
    {isGitcoinLoading ? "Creating..." : "Create GitcoinCanFundMe"}
  </StyledButton>
) : (
  <StyledButton style={{marginTop: 5}} isDarkMode={isDarkMode} onClick={writeAsync} disabled={isLoading}>
    {isLoading ? "Creating..." : "Create"}
  </StyledButton>
)}
</div>
        </StyledWindow>
      </Draggable>
      {/* Wrap your Window components with Draggable */}
      <Draggable defaultPosition={manageWindowPosition} bounds='parent' handle='.window-title'>
        <StyledWindow isDarkMode={isDarkMode}>
          <StyledWindowHeader isDarkMode={isDarkMode} className="window-title">
            <span>Select Address</span>
          </StyledWindowHeader>

            <label>Select Address:</label>
            <StyledSelect isDarkMode={isDarkMode}
  options={addressOptions.length === 0 ? [{ value: "", label: "No Address Found" }] : addressOptions}
  value={selectedAddress}
  onChange={handleSelectChange}
  width={350}
  maxWidth={350}
/>

            <StyledButton
            isDarkMode={isDarkMode}
              onClick={handleManageClick}
              disabled={!selectedAddress || addressOptions.length === 0} 
            >
              Manage
            </StyledButton>

        </StyledWindow>
      </Draggable>
      </div>
  );
};

export default CreateCanFund;
