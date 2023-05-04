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
import { StyledButton, StyledSelect, StyledWindow, StyledWindowHeader } from "./styledcomponents";

const CreateCanFund: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState();
  const [timelimit, setTimelimit] = useState();
  const [benificiaryInput, setBenificiaryInput] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

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


  return (
    <div>
      {/* Wrap your Window components with Draggable */}
      <Draggable defaultPosition={createWindowPosition}>
      <StyledWindow isDarkMode={isDarkMode}>
          <StyledWindowHeader isDarkMode={isDarkMode} className="window-title">
          <span>create</span>
            <StyledButton isDarkMode={isDarkMode} onClick={resetPositions}>
              <span className="close-icon"></span>
            </StyledButton>
          </StyledWindowHeader>
          <h1>Create a new CanFund</h1>
          <div>
            <label>Name:</label>
            <TextInput value={name} onChange={(e) => setName(e.target?.value)} />
          </div>
          <div>
            <label>Description:</label>
            <TextInput value={description} onChange={(e) => setDescription(e.target?.value)} />
          </div>
          <div>
            <label>Goal:</label>
            <IntegerInput value={goal} onChange={(value) => setGoal(value)} />
          </div>
          <div>
            <label>Time limit:</label>
            <IntegerInput value={timelimit} onChange={(value) => setTimelimit(value)} />
          </div>
          <div>
            <label>Beneficiary:</label>
            <AddressInput value={benificiaryInput} onChange={(value) => setBenificiaryInput(value)} />
          </div>
          <label>Note Goal</label>
          <IntegerInput value={_note_threshold} onChange={(value) => setNoteThreshold(value)} />
          <div>

          {gitcoin_score > 10 ? (
  <StyledButton isDarkMode={isDarkMode} style={{marginTop: 5}}onClick={createGitcoinCanFundMe} disabled={isGitcoinLoading}>
    {isGitcoinLoading ? "Creating..." : "Create GitcoinCanFundMe"}
  </StyledButton>
) : (
  <StyledButton isDarkMode={isDarkMode} onClick={writeAsync} disabled={isLoading}>
    {isLoading ? "Creating..." : "Create"}
  </StyledButton>
)}

          </div>
        </StyledWindow>
      </Draggable>
      {/* Wrap your Window components with Draggable */}
      <Draggable defaultPosition={manageWindowPosition}>
        <StyledWindow isDarkMode={isDarkMode}>
          <StyledWindowHeader isDarkMode={isDarkMode}>
            <span>Select Address</span>
          </StyledWindowHeader>
          <div>
            <label>Select Address:</label>
            <StyledSelect isDarkMode={isDarkMode}
  options={addressOptions.length === 0 ? [{ value: "", label: "No Address Found" }] : addressOptions}
  value={selectedAddress}
  onChange={handleSelectChange}
  width={425}
/>

            <StyledButton
            isDarkMode={isDarkMode}
              onClick={handleManageClick}
              disabled={!selectedAddress || addressOptions.length === 0} 
            >
              Manage
            </StyledButton>
          </div>
        </StyledWindow>
      </Draggable>
    </div>
  );
};

export default CreateCanFund;
