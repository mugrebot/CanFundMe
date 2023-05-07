import React from "react";
import dynamic from "next/dynamic";
import { StyledWindow } from "./styledcomponents";
import { StyledWindowHeader } from "./styledcomponents";
import { Abi } from "abitype";
import { ethers, utils } from "ethers";
import styled from "styled-components";
import { useDarkMode } from "usehooks-ts";
import { useContract, useProvider } from "wagmi";
import { useBalance } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  grid-auto-rows: auto;
`;

const ContractBounce = dynamic(() => import("../components/ContractBounce"), { ssr: false });

interface FactoryBounceProps {
  index: number;
}

export const FactoryBounce: React.FC<FactoryBounceProps> = ({ index }) => {
  const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

  const { isDarkMode } = useDarkMode();

  const addresses = [];

  for (let i = 0; i < index; i++) {
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
      {[...new Set(addresses.filter(address => address !== undefined))].map(address => (
        <ContractBounce key={address} address={address} />
      ))}
    </GridContainer>
  );
};
