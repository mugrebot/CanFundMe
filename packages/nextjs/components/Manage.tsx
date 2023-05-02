import React, { useEffect, useState, useRef } from "react";
import { EtherInput, IntegerInput } from "./scaffold-eth";
import { ethers, utils } from "ethers";
import {
  Button,
  Counter,
  Frame,
  Hourglass,
  NumberInput,
  ProgressBar,
  Window,
  WindowHeader,
} from "react95";
import styled from "styled-components";
import { useProvider } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import {
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldEventHistory,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth";
import Draggable from "react-draggable";
import CanFundMe_ABI from "../../hardhat/artifacts/contracts/CanFundMe.sol/CanFundMe.json";
import { useAccount } from 'wagmi'

export const Manage = ({ contractAddress }) => {

    const { address: account } = useAccount();

    const CanFundMeABI = CanFundMe_ABI.abi;

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

        const { data: owner } = useScaffoldContractRead({
            contractName: "CanFundMe",
            functionName: "owner",
            address: contractAddress,
            abi: CanFundMeABI,
          });

            const { data: accountant} = useScaffoldContractRead({
                contractName: "CanFundMe",
                functionName: "benificiary",
                address: contractAddress,
                abi: CanFundMeABI,
                });

                console.log(accountant);

                const { writeAsync, isLoading } = useScaffoldContractWrite({
                    contractName: "CanFundMe",
                    functionName: "withdraw_threshold_met",
                    address: contractAddress,
                    abi: CanFundMeABI,
                  });

    return (
        <div>
{account ? <div>
    <h1>Manage</h1>
    <h2>Contract Address: {contractAddress}</h2>
    <h2>Owner: {owner}</h2>
    <h2>Benificiary: {accountant}</h2>
    <h2>Threshold: {Number(threshold)}</h2>
    <h2>Time Limit: {Number(time_limit)}</h2>
    <h2>Funded: {funded}</h2>
    <Button onClick={writeAsync}>Withdraw</Button>
</div> : <div>Sorry You aren't the owner try another contract address</div>}
</div>

    );
    
                };

                export default Manage;