import { useRouter } from "next/router";
import Manage from "../../components/Manage";
import { NextPage } from "next";

const ManageContractPage: NextPage = () => {
  const router = useRouter();
  const { Address: contractAddress } = router.query;

  console.log(contractAddress);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {contractAddress && <Manage contractAddress={contractAddress.toString()} />}
    </div>
  );
};

export default ManageContractPage;
