import { useRouter } from "next/router";
import React from 'react';
import { useEffect } from "react";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead, useFetchCanFundAddresses } from "~~/hooks/scaffold-eth";


interface RoundsProps {
  addresses: string[];
}

const Rounds: React.FC<{ fetchCanFundAddress: (index: number) => Promise<string> }> = ({ fetchCanFundAddress }) => {
    const router = useRouter();
  
    // Fetch the deployed CanFundMe's.
    const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");
  
    // Factory Stuff
    const { data: totalCanFundMes } = useScaffoldContractRead({
      contractName: "CanFundMeFactory",
      functionName: "canFundTotal",
      abi: deployedContractData?.abi as Abi,
    });
  
    console.log("totalCanFundMes", totalCanFundMes);

    console.log("yeet");

  
  return (
    <div>
      <h2>CanFundMe Rounds</h2> 
    </div>
  );
};


export default Rounds;