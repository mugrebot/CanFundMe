import { useState, useEffect } from 'react';
import { useScaffoldContractRead } from './useScaffoldContractRead';
import { Abi } from "abitype";

export const useFetchCanFundAddresses = (deployedContractData, totalCanFundMes) => {
    //address array
    const address = [];


    const fetchCanFundAddresses = async () => {
      const fetchedAddresses = [];
      for (let i = 0; i < Number(totalCanFundMes); i++) {
        const { data: canFundAddress } = await useScaffoldContractRead({
          contractName: "CanFundMeFactory",
          functionName: "canFundMeAddressesAll",
          abi: deployedContractData?.abi as Abi,
          args: [i],
        });

        fetchedAddresses.push(canFundAddress);
      }

      address.push(fetchedAddresses);
    };

    if (deployedContractData && totalCanFundMes) {
      fetchCanFundAddresses();
    }


  return address;
};
