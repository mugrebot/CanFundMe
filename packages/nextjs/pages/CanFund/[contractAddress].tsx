import { useRouter } from "next/router";
import CanFund from "../../components/CanFund";
import { NextPage } from "next";
import { useAccount } from "wagmi";
import IPFS from "~~/components/IPFSSign";
import Draggable  from "react-draggable";
import { useState } from "react";
import Profile from "~~/components/Profile";

const ContractAddressPage: NextPage = () => {
  const { address: account } = useAccount();
  console.log(account);

  const router = useRouter();
  const { contractAddress } = router.query;

  const [isMinimized, setIsMinimized] = useState(true);

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div>
    <div className="profile-container">
            <Profile/>
            </div>
    <div className="content-container">
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          
        {contractAddress && <CanFund contractAddress={contractAddress.toString()} />}
        {!isMinimized && (
            <div>
              <IPFS onMinimize={handleMinimize} />
            </div>
        )}
        {isMinimized && (
          <div style={{ position: "fixed", bottom: 100, left: 10 }}>
            <button onClick={handleMinimize}>[EDIT PROFILE]</button>
          </div>
        )}

      </div>
    </div>
    </div>
  );
};

export default ContractAddressPage;
