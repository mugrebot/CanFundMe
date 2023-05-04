import React from 'react';
import { useRouter } from 'next/router';
import CanFund from '../../components/CanFund';
import EventAnimation from '~~/components/EventAnimation';

const ContractAddressPage = () => {
  const router = useRouter();
  const { contractAddress } = router.query;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      {contractAddress && <CanFund contractAddress={contractAddress.toString()} />}
    </div>
  );
};

export default ContractAddressPage;
