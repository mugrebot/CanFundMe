import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import { useDarkMode } from "usehooks-ts";
import { useAccount } from "wagmi";
import { StyledButton, StyledSelect, StyledWindow, StyledWindowHeader } from "~~/components/styledcomponents";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [selectedAddress, setSelectedAddress] = useState();

  const router = useRouter();

  const { isDarkMode } = useDarkMode();

  //use the connected wallet address as address
  const { address: account } = useAccount();


  const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

  console.log("deployedContractData", deployedContractData);

  const { data: CanFundAddresses } = useScaffoldContractRead({
    contractName: "CanFundMeFactory",
    functionName: "getCanFundMeAddresses",
    args: [account],
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addressOptions = CanFundAddresses?.map((address: string) => ({ value: address, label: address })) || [];

  useEffect(() => {
    if (!selectedAddress) {
      setSelectedAddress(addressOptions[0]?.value);
    }
  }, [selectedAddress, addressOptions]);

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

  const handleSelectChange = selectedOption => {
    setSelectedAddress(selectedOption.value);
  };

  const handleGitcoinClick = () => {
    router.push("gitcoin");
  };

  const handleRoundsClick = () => {
    router.push("rounds");
  };


  return (
    <div className="absolute bg-teal w-screen h-screen top-16 flex items-center justify-center">
      <StyledWindow isDarkMode={isDarkMode}>
        <StyledWindowHeader isDarkMode={isDarkMode}>
          <span>CanFundMe.exe</span>
        </StyledWindowHeader>
        <div className="flex flex-wrap gap-6 justify-center">
          <StyledButton
            isDarkMode={isDarkMode}
            style={{ margin: 15, padding: 10 }}
            className="window-item flex flex-col items-center cursor-pointer"
            onClick={navigateToCreate}
          >
            <span>Create CanFund</span>
          </StyledButton>
          <StyledButton
            isDarkMode={isDarkMode}
            style={{ margin: 15, padding: 10 }}
            className="window-item flex flex-col items-center cursor-pointer"
            onClick={handleCanFundClick}
          >
            <span>View CanFund</span>
          </StyledButton>
          <StyledButton
            isDarkMode={isDarkMode}
            style={{ margin: 15, padding: 10 }}
            className="window-item flex flex-col items-center cursor-pointer"
            onClick={handleManageClick}
          >
            <span>Manage CanFund</span>
          </StyledButton>
          <StyledButton
            isDarkMode={isDarkMode}
            style={{ margin: 15, padding: 10 }}
            className="window-item flex flex-col items-center cursor-pointer"
            onClick={handleGitcoinClick}
          >
            <span>Submit Gitcoin Passport</span>
          </StyledButton>
          <StyledButton
            isDarkMode={isDarkMode}
            style={{ margin: 15, padding: 10 }}
            className="window-item flex flex-col items-center cursor-pointer"
            onClick={handleRoundsClick}
          >
            <span>View Rounds</span>
          </StyledButton>
        </div>
        <div className="text-center" style={{ margin: 5, padding: 10 }}>
          <label>Select Address:</label>
          <StyledSelect
            isDarkMode={isDarkMode}
            options={addressOptions.length === 0 ? [{ value: "", label: "No Address Found" }] : addressOptions}
            value={selectedAddress}
            onChange={handleSelectChange}
            width={450}
          />
        </div>
      </StyledWindow>
    </div>
  );
};

export default Home;
