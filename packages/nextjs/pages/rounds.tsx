import React from "react";
import dynamic from "next/dynamic";
import { FactoryBounce } from "../components/FactoryBounce";
import { Abi } from "abitype";
import { WindowContent } from "react95";
import { useDarkMode } from "usehooks-ts";
import { StyledScrollView, StyledWindow } from "~~/components/styledcomponents";
import { useDeployedContractInfo, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { NextPage } from "next";

//for each contract, we need to get the address, and then pass it to the ContractBounce component

const rounds: NextPage = () => {
  //calculate the total number of contracts and retrieve them from FactoryBounce
  //then pass them to ContractBounce

  const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

  const { isDarkMode } = useDarkMode();

  const { data: totalCanFundMes } = useScaffoldContractRead({
    contractName: "CanFundMeFactory",
    functionName: "canFundTotal",
    abi: deployedContractData?.abi as Abi,
  });

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
          <div className="content-container">
      <StyledWindow style={{marginTop: '50px'}}isDarkMode={isDarkMode}>
        <WindowContent>
          <StyledScrollView isDarkMode={isDarkMode}>
            {totalCanFundMes && Number(totalCanFundMes) > 0 && <FactoryBounce index={Number(totalCanFundMes)} />}
            {!totalCanFundMes && <h1>There are no CanFundMes yet!</h1>}
          </StyledScrollView>
        </WindowContent>
      </StyledWindow>
    </div>
    </div>
  );
}

export default rounds;
