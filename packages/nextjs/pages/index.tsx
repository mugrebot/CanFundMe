import Head from "next/head";
import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useScaffoldContractWrite, useScaffoldContract } from "~~/hooks/scaffold-eth";
import { Button, Select, Window } from "react95"
import { useState, useEffect} from "react";

const Home: NextPage = () => {
  const [selectedAddress, setSelectedAddress] = useState();

  const router = useRouter();

  //use the connected wallet address as address
  const { address: account } = useAccount();

  const factory = useScaffoldContract({
    contractName: "CanFundMeFactory",
  });

  const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

  const { data: CanFundAddresses } = useScaffoldContractRead({
    contractName: "CanFundMeFactory",
    functionName: "getCanFundMeAddresses",
    args: [account],
    });

  const addressOptions = CanFundAddresses?.map((address: string) => ({ value: address, label: address })) || [];

  useEffect (() => {
    if (!selectedAddress) {
      setSelectedAddress(addressOptions[0]?.value);
    }
  });

  const navigateToCreate = () => {
    router.push("/create");
  };

  const handleManageClick = () => {
    if (selectedAddress) {
      router.push(`/Manage/${selectedAddress}`);
    }
  };

  const handleCanFundClick = () => {
    if (selectedAddress) {
      router.push(`/CanFund/${selectedAddress}`);
    }
  };

  const handleSelectChange = (selectedOption) => {
    setSelectedAddress(selectedOption.value);
  };




  return (
    // ... (Other parts of the component remain the same)
    <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
      <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
        {/* Add the new navigation links here */}
        <Window
          className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs cursor-pointer"
          onClick={navigateToCreate}
        >
          <span className="link">Create CanFund</span>
        </Window>
        <Window
          className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs cursor-pointer"
          onClick={handleCanFundClick}
        >
          <span className="link">View CanFund</span>
        </Window>
        <Window
          className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs cursor-pointer"
          onClick={handleManageClick}
        >
          <span className="link">Manage CanFund</span>
        </Window>
        {/* Navigation links end */}
        <Window>
        <label>Select Address:</label>
        <Select
  options={addressOptions.length === 0 ? [{ value: "", label: "No Address Found" }] : addressOptions}
  value={selectedAddress}
  onChange={handleSelectChange}
  width={200}
/>

<Button
  onClick={handleManageClick}
  disabled={!selectedAddress || addressOptions.length === 0} 
>
  Manage
</Button>
      </Window>
    </div>
    </div>
  );
};

export default Home;
