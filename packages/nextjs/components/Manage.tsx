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

        const { data: note_threshold } = useScaffoldContractRead({
            contractName: "CanFundMe",
            functionName: "note_threshold",
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

      const { data: note_funded } = useScaffoldContractRead({
        contractName: "CanFundMe",
        functionName: "note_funded",
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

                const { writeAsync: token_withdraw, isLoading: note_loading  } = useScaffoldContractWrite({
                        contractName: "CanFundMe",
                        functionName: "withdraw_threshold_met_with_token",
                        address: contractAddress,
                        abi: CanFundMeABI,
                        args: ['0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503']
                        });


    return (
        <div>
    {account ? <div>
    <h1>Manage</h1>
    <h2>Contract Address: {contractAddress}</h2>
    <h2>Owner: {owner}</h2>
    <h2>Benificiary: {accountant}</h2>
    <h2>Threshold: {Number(threshold)}</h2>
    <h2>Note Threshold: {Number(note_threshold)}</h2>
    <h2>Time Limit: {Number(time_limit)}</h2>
    {funded ? <h2>Funded: True</h2> : <h2>Funded: False</h2>}
    <Button onClick={writeAsync}>Withdraw</Button>
    <Button style={{ justifyContent: 'right' }} onClick={token_withdraw}>WithdrawNote</Button>
    </div> : <div>Sorry You aren't the owner try another contract address</div>}
    </div>

    );
    
                };

                export default Manage;