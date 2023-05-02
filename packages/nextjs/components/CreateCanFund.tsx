import React, { useEffect, useState} from "react";
import { Button, Window, TextInput, Select, Checkbox } from "react95";
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


const CreateCanFund: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState();
  const [timelimit, setTimelimit] = useState();
  const [benificiaryInput, setBenificiaryInput] = useState(""); // Add this line
  const [selectedAddress, setSelectedAddress] = useState();
  const [_note_threshold, setNoteThreshold] = useState(undefined || 0);
  const [_accept_note, setAcceptNote] = useState(true || false);

  //use the connected wallet address as address
    const { address: account } = useAccount();



  const factory = useScaffoldContract({
    contractName: "CanFundMeFactory",
  });




  const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "CanFundMeFactory",
    functionName: "createCanFundMe",
    address: factory.data?.address,
    abi: deployedContractData?.abi as Abi,
    args: [benificiaryInput, goal, timelimit, _note_threshold, _accept_note],
  });

  const { data: CanFundAddresses } = useScaffoldContractRead({
    contractName: "CanFundMeFactory",
    functionName: "getCanFundMeAddresses",
    args: [account],
    });

    const addressOptions = CanFundAddresses?.map((address: string) => ({ value: address, label: address })) || [];

    useEffect(() => {
        if (addressOptions.length === 1) {
          setSelectedAddress(addressOptions[0].value);

        } else {
          setSelectedAddress("No Addresses Found");
        }
      }, [addressOptions]);
      
      console.log(selectedAddress);

    const router = useRouter();

    const handleManageClick = () => {
        if (selectedAddress) {
          router.push(`/Manage/${selectedAddress}`);
        }
      };

      




  return (
    <div>
    <Window style={{ top: 100, left: 50 }}>
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
        <label>Accept Note?</label>
        <Checkbox checked={_accept_note} onChange={(value) => setAcceptNote(!_accept_note)} />

        <Button onClick={writeAsync} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </div>
      </Window>
      <Window style={{ top: 100, left: 500}}>
      <div>
        <label>Select Address:</label>
        <Select
  options={addressOptions.length === 0 ? [{ value: "", label: "No Address Found" }] : addressOptions}
  value={selectedAddress}
  onChange={(value) => setSelectedAddress(value)}
  width={200}
/>

<Button
  onClick={handleManageClick}
  disabled={!selectedAddress || addressOptions.length === 0} 
>
  Manage
</Button>
      </div>
      </Window>
    </div>
  );
};

export default CreateCanFund;
