import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDeployedContractInfo, useFetchCanFundAddresses, useScaffoldContractRead } from '~~/hooks/scaffold-eth';
import { Abi } from "abitype";
import Rounds from './Rounds';

const CanFundMeWrapper: React.FC = () => {
  const [canFundMeAddresses, setCanFundMeAddresses] = useState([]);

  // Fetch the deployed CanFundMe's.
  const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

  // Factory Stuff
  const { data: totalNumberofCanFundMes } = useScaffoldContractRead({
    contractName: "CanFundMeFactory",
    functionName: "canFundTotal",
    abi: deployedContractData?.abi as Abi,
  });


  const fetchCanFundAddress = async (index) => {
    const { data: canFundAddress } = await useScaffoldContractRead({
      contractName: "CanFundMeFactory",
      functionName: "canFundMeAddressesAll",
      abi: deployedContractData?.abi as Abi,
      args: [index],
    });

    return canFundAddress;
  };

  useEffect(() => {
    const fetchCanFundAddresses = async () => {
      // Replace this with your logic to fetch the CanFundMe addresses
      const fetchedAddresses = await useFetchCanFundAddresses(deployedContractData, totalNumberofCanFundMes);
      setCanFundMeAddresses(fetchedAddresses);
    };

    fetchCanFundAddresses();
  }, []);

  return <Rounds addresses={canFundMeAddresses} />;
};

export default CanFundMeWrapper;

