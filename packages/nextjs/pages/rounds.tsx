import React from 'react';
import { useRouter } from 'next/router';
import { useDeployedContractInfo, useScaffoldContractRead } from '~~/hooks/scaffold-eth';
import { Abi } from "abitype";
import dynamic from 'next/dynamic';
import { FactoryBounce } from '../components/FactoryBounce';
import { ScrollView, Window, WindowContent } from 'react95';
import { StyledWindow, StyledScrollView } from '~~/components/styledcomponents';
import { useDarkMode } from 'usehooks-ts';


const ContractBounce = dynamic(() => import('../components/ContractBounce'), { ssr: false });

//for each contract, we need to get the address, and then pass it to the ContractBounce component


const rounds: React.FC = () => {
//calculate the total number of contracts and retrieve them from FactoryBounce
//then pass them to ContractBounce

const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

const {isDarkMode} = useDarkMode();

const { data: totalCanFundMes } = useScaffoldContractRead({
  contractName: "CanFundMeFactory",
  functionName: "canFundTotal",
  abi: deployedContractData?.abi as Abi,
});


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
<StyledWindow isDarkMode={isDarkMode}>
 <WindowContent>
    <StyledScrollView isDarkMode={isDarkMode} style={{ width: '500px', height: '700px' }}>
    {totalCanFundMes && Number(totalCanFundMes) > 0 && <FactoryBounce index={Number(totalCanFundMes)} />}
    {!totalCanFundMes && <h1>There are no CanFundMes yet!</h1>}
    </StyledScrollView>
    </WindowContent>
    </StyledWindow>
    </div>
  );
};

export default rounds;

