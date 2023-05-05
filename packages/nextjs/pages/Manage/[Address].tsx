import { useRouter } from "next/router";
import Manage from "../../components/Manage";
import { NextPage } from "next";
import { useAccount } from "wagmi";

const ManageContractPage: NextPage = () => {
  const { address: account } = useAccount();
  console.log(account);
  const router = useRouter();
  const { Address: contractAddress } = router.query;

  console.log(contractAddress);

  return (
    <div className="content-container">
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
      {contractAddress && <Manage contractAddress={contractAddress.toString()} />}
    </div>
    </div>
  );
};

export default ManageContractPage;
