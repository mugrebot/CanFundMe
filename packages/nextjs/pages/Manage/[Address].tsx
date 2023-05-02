import React from 'react';
import { useRouter } from 'next/router';
import Manage from "../../components/Manage";

const ManageContractPage = () => {
  const router = useRouter();
  const { Address: contractAddress } = router.query;

  console.log(contractAddress);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {contractAddress && <Manage contractAddress={contractAddress.toString()} />}
    </div>
  );
};

export default ManageContractPage;
