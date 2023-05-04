

import React from 'react';
import { useScaffoldContractRead } from '~~/hooks/scaffold-eth';
import { Abi } from "abitype";
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth';
import { useProvider, useContract } from 'wagmi';
import { ethers, utils } from 'ethers';
import { useBalance } from 'wagmi'
import { StyledButton, StyledWindow } from './styledcomponents';
import { StyledWindowHeader } from './styledcomponents';
import { useDarkMode } from 'usehooks-ts';
import { useRouter } from 'next/router';

interface ContractBounceProps {
    address: string;
}

export const ContractBounce: React.FC<ContractBounceProps> = ({ address }) => {

    const router = useRouter();

    const { data: deployedContractData } = useDeployedContractInfo("CanFundMe");


  const {isDarkMode} = useDarkMode();

    // I want to get: funded, platform fee, owner, note_balance and regular balance from the contract
    const { data: funded } = useScaffoldContractRead({
        contractName: "CanFundMe",
        functionName: "funded",
        abi: deployedContractData?.abi as Abi,
        address: address,
    });

    const { data: platformFee } = useScaffoldContractRead({
        contractName: "CanFundMe",
        functionName: "platform_fee",
        abi: deployedContractData?.abi as Abi,
        address: address,
    });

    const { data: owner } = useScaffoldContractRead({
        contractName: "CanFundMe",
        functionName: "owner",
        abi: deployedContractData?.abi as Abi,
        address: address,
    });

    const { data: noteBalance } = useScaffoldContractRead({
        contractName: "CanFundMe",
        functionName: "token_balance",
        abi: deployedContractData?.abi as Abi,
        address: address,
    });

    const { data: cantoBalance, isError, isLoading } = useBalance({address: address});

    if (isLoading) return <div>Fetching balance…</div>
    if (isError) return <div>Error fetching balance</div>

    return (
        <div >
        <StyledWindow isDarkMode={isDarkMode} >
            <StyledWindowHeader isDarkMode={isDarkMode} >
            <h2>CanFundMe.exe</h2>
            </StyledWindowHeader>
            <div style={{textAlign: 'center'}}>
            {platformFee == 5 ? <p></p> : <p>Gitcoin Verified ✅</p>}
            <p>Address: {address}</p>
            <p>Owner: {owner}</p>
            <p>Funded: {funded?.toString()}</p>
            <p>Platform Fee: {platformFee}</p>
            <p>Note Balance: {Number(noteBalance)}</p>
            <p>Regular Balance: {cantoBalance?.formatted}{cantoBalance?.symbol}</p>

        <div style={{margin: 5}}>
            <StyledButton isDarkMode={isDarkMode} onClick={() => router.push(`/CanFund/${address}`)}>FundMe</StyledButton>
            </div>
            </div>
        </StyledWindow>
        </div>
    );
};

export default ContractBounce;


