
import React from 'react';
import { useScaffoldContractRead } from '~~/hooks/scaffold-eth';
import { Abi } from "abitype";
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth';
import { useProvider, useContract } from 'wagmi';
import { ethers, utils } from 'ethers';
import { useBalance } from 'wagmi'
import { StyledWindow } from './styledcomponents';
import { StyledWindowHeader } from './styledcomponents';
import { useDarkMode } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import styled from 'styled-components';


// Create a styled component for the grid container
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 16px;
  padding: 16px;
`;

const ContractBounce = dynamic(() => import('../components/ContractBounce'), { ssr: false });

interface FactoryBounceProps {
    index: number;
}

export const FactoryBounce: React.FC<FactoryBounceProps> = ({ index }) => {

    const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

    const {isDarkMode} = useDarkMode();

    const addresses = [];

    for (let i=0; i<index; i++) {

    const { data: canFundMeAddress } = useScaffoldContractRead({
        contractName: "CanFundMeFactory",
        functionName: "canFundMeAddressesAll",
        abi: deployedContractData?.abi as Abi,
        args: [i],
    });

    addresses.push(canFundMeAddress);

    }

 

    return (
        <GridContainer>
            
            {addresses.map((address) => (
                <ContractBounce address={address} />
            ))}
            
        </GridContainer>
    );

};