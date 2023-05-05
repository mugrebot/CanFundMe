import { Abi } from "abitype";
import { Button } from "react95";
import { useAccount, useBalance } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

export const Manage = ({ contractAddress }) => {
  const { address: account } = useAccount();

  const { data: deployedContractInfo } = useDeployedContractInfo("CanFundMe");

  const CanFundMeABI = deployedContractInfo?.abi as Abi;

  const {
    data: canto_balance,
    isError: balance_error,
    isLoading: balance_loading,
  } = useBalance({ address: contractAddress });
  console.log(canto_balance, balance_error, balance_loading);

  const { data: threshold } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "threshold",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: note_threshold } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "note_threshold",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: time_limit } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "time_limit",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: owner } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "owner",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: accountant } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "benificiary",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  console.log(accountant);

  const { writeAsync } = useScaffoldContractWrite({
    contractName: "CanFundMe",
    functionName: "withdraw_threshold_met",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { writeAsync: token_withdraw } = useScaffoldContractWrite({
    contractName: "CanFundMe",
    functionName: "withdraw_threshold_met_with_token",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { writeAsync: updateGitcoin } = useScaffoldContractWrite({
    contractName: "CanFundMe",
    functionName: "updateFeeStatusGitcoin",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: note_balance } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "token_balance",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  const { data: gitcoin_score } = useScaffoldContractRead({
    contractName: "CanFundMeFactory",
    functionName: "gitcoin_scores",
    address: "0x57a39121159d46326279D81b3CFA774Bd6B5ed1b",
    abi: CanFundMeABI,
    args: [`${account}`],
  });

  const { data: threshold_crossed } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "threshold_crossed",
    address: contractAddress,
    abi: CanFundMeABI,
  });

  return (
    <div>
      {account ? (
        <div>
          <h1>Manage</h1>
          <h2>Contract Address: {contractAddress}</h2>
          <h2>Owner: {owner}</h2>
          <h2>Benificiary: {accountant}</h2>
          <h2>Threshold: {Number(threshold)}</h2>
          <h2>Note Threshold: {Number(note_threshold)}</h2>
          <h2>Time Limit: {Number(time_limit)}</h2>
          <h2>Balance: {canto_balance?.formatted}</h2>
          <h2>Note Balance: {Number(note_balance)}</h2>
          {threshold_crossed ? <h2>Funded: True</h2> : <h2>Funded: False</h2>}
          {gitcoin_score ? (
            <h2>Gitcoin Score: {Number(gitcoin_score)} -- platform Fees are 0</h2>
          ) : (
            <h2>Gitcoin Score: 0, Platform fees are 5%</h2>
          )}
          <Button onClick={writeAsync}>Withdraw</Button>
          <Button style={{ justifyContent: "right" }} onClick={token_withdraw}>
            WithdrawNote
          </Button>
          <Button style={{ justifyContent: "right" }} onClick={updateGitcoin}>
            Update Gitcoin Score
          </Button>
        </div>
      ) : (
        <div>Sorry You arent the owner try another contract address</div>
      )}
    </div>
  );
};

export default Manage;
