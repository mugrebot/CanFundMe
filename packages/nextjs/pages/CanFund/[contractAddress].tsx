import { useRouter } from "next/router";
import CanFund from "../../components/CanFund";
import { NextPage } from "next";
import { useAccount } from "wagmi";

const ContractAddressPage: NextPage = () => {
  const { address: account } = useAccount();
  console.log(account);

  const router = useRouter();
  const { contractAddress } = router.query;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {contractAddress && <CanFund contractAddress={contractAddress.toString()} />}
    </div>
  );
};

export default ContractAddressPage;
