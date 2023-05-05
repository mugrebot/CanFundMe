import { useRouter } from "next/router";
import CanFund from "../../components/CanFund";
import { NextPage } from "next";

const ContractAddressPage: NextPage = () => {
  const router = useRouter();
  if (!router.isFallback) {
    return <div>ErrorPAGE404</div>;
}
  const { contractAddress } = router.query;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      {contractAddress && <CanFund contractAddress={contractAddress.toString()} />}
    </div>
  );
};

export default ContractAddressPage;
