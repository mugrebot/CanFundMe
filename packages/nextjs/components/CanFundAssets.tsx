import React, { useState } from "react";
import { ethers } from "ethers";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";
import { ContractAbi, ContractName, UseScaffoldWriteConfig } from "~~/utils/scaffold-eth/contract";
import { Abi, ExtractAbiFunctionNames } from "abitype";
import { useDeployedContractInfo, useTransactor } from "~~/hooks/scaffold-eth";
import { useContract, useSigner, useAccount, useProvider } from "wagmi";
import { TextInput, Button } from "react95";


const CanFundAssets = ({ contractAddress }) => {
    const [name, setName] = useState("");
    const [cid, setCID] = useState("");
    const [_message, setMessage] = useState("");
    const [_signature, setSignature] = useState("");

    const { data: deployedContractData } = useDeployedContractInfo("CanFundMe");
  
    const contract = useContract({
        address: contractAddress,
        abi: deployedContractData?.abi as Abi,
      })
    const { address: account } = useAccount();
    const { data: signer } = useSigner();
    const provider = useProvider();
  
    const handleClick = async () => {
      const message = encodeMessage(name, cid);
      setMessage(message);

      const signature = await signer.signMessage(message);
      const recoveredAddress = ethers.utils.verifyMessage(
        message,
        signature
      );

      console.log(signature);
      const contents = await getContents(signature);
      setName(contents.name);
      setCID(contents.cid);
    };
  
    const encodeMessage = (name, cid) => {
      const data = { name, cid };
      return JSON.stringify(data);
    };
  
    const getContents = async (_signature) => {
        console.log(_signature.signature);
        const message = ethers.utils.arrayify(_signature.signature);
        const recoveredAddress = ethers.utils.recoverAddress(
            message,
            _signature.slice(0, 32)
          );
        const isOwner = recoveredAddress === account;
        console.log(isOwner);
      };

      const parseHexMessage = (hexMessage) => {
        // Replace this with your custom parser
        const message = hexMessage.substring(2); // remove "0x" prefix
        const name = message.substring(0, 32); // first 32 bytes = name
        const cid = message.substring(32, 64); // next 32 bytes = cid
        return { name: name, cid: cid };
      };
      
  
    return (
      <div>
        <div>
        <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        <TextInput value={cid} onChange={(e) => setCID(e.target.value)} />

        <Button onClick={handleClick}>Sign message</Button>
        </div>

        <Button onClick={getContents}> Get Message contents</Button>




      </div>
    );
  };
  
  export default CanFundAssets;