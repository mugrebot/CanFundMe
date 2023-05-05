import { useState } from "react";
import { CopyIcon } from "../components/example-ui/assets/CopyIcon";
import "@rainbow-me/rainbowkit/styles.css";
import { Abi } from "abitype";
import { ethers } from "ethers";
import { Signer } from "ethers";
import { useDarkMode } from "usehooks-ts";
import { useAccount, useConnect, useSigner } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { StyledButton, StyledWindow } from "~~/components/styledcomponents";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useScaffoldContract, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { NextPage } from "next";

// these lines read the API key and scorer ID from your .env.local file doesnt work
const APIKEY = process.env.NEXT_PUBLIC_GITCOIN_API_KEY;
const SCORER_ID = process.env.NEXT_PUBLIC_SCORER_ID;

// endpoint for submitting passport
const SUBMIT_PASSPORT_URI = "https://api.scorer.gitcoin.co/registry/submit-passport";
// endpoint for getting the signing message
const SIGNING_MESSAGE_URI = "https://api.scorer.gitcoin.co/registry/signing-message";
// score needed to see hidden message
const THRESHOLD_NUMBER = 10;

const headers = APIKEY
  ? {
      "Content-Type": "application/json",
      "X-API-Key": APIKEY,
    }
  : undefined;

  const Passport: NextPage = () => {
  const { data: contractInfo } = useDeployedContractInfo("CanFundMeFactory");
  console.log("contractInfo", contractInfo);

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const { isDarkMode } = useDarkMode();

  const { address, isConnected, connector: activeConnector } = useAccount();
  console.log("address", address);

  const { data: signer } = useSigner();
  console.log(signer);

  const liar = Signer.isSigner(signer);
  console.log(liar);

  // here we deal with any local state we need to manage
  const [score, setScore] = useState<string>("");
  const [noScoreMessage, setNoScoreMessage] = useState<string>("");
  const [_signature, setSignature] = useState<string>("");
  const [toastVisible, setToastVisible] = useState(false);

  /* todo check user's connection when the app loads */
  async function _connect() {
    try {
      connect({ activeConnector });
    } catch (err) {
      console.log("error connecting...");
    }
  }

  async function getSigningMessage() {
    try {
      const response = await fetch(SIGNING_MESSAGE_URI, {
        headers,
      });
      const json = await response.json();
      return json;
    } catch (err) {
      console.log("error: ", err);
    }
  }

  /* todo connect user's wallet */

  /* todo check user's passport */
  async function checkPassport(currentAddress = address) {
    setScore("");
    setNoScoreMessage("");
    //
    console.log("Checking passport for address:", currentAddress);
    const GET_PASSPORT_SCORE_URI = `https://api.scorer.gitcoin.co/registry/score/${188}/${currentAddress}`;
    try {
      const response = await fetch(GET_PASSPORT_SCORE_URI, {
        headers,
      });
      const passportData = await response.json();
      if (passportData.score) {
        // if the user has a score, round it and set it in the local state
        console.log("rounding score");
        const roundedScore = Math.round(passportData.score);
        setScore(roundedScore.toString());
      } else {
        // if the user has no score, display a message letting them know to submit thier passporta
        console.log("No score available, please add stamps to your passport and then resubmit.");
        setNoScoreMessage("No score available, please submit your passport after you have added some stamps.");
      }
    } catch (err) {
      console.log("error: ", err);
    }
  }

  /* todo get signing message from API */

  async function GetSignedScore() {
    if (!address) {
      console.log("no address");
      return;
    }

    if (!score) {
      console.log("no score");
      return;
    }

    const domain = {
      name: "CanFundMeFactory",
      version: "1",
      chainId: 7701,
      verifyingContract: contractInfo?.address,
    };

    const types = {
      Message: [
        { name: "score", type: "uint16" },
        { name: "account", type: "address" },
        { name: "_contract", type: "address" },
      ],
    };

    const message = {
      score: score,
      account: ethers.utils.getAddress(address),
      _contract: contractInfo?.address,
    };

    console.log("Domain:", domain);
    console.log("Types:", types);
    console.log("Message:", message);

    const messageHash = ethers.utils._TypedDataEncoder.hash(domain, types, message);
    console.log(messageHash);

    const messageHash2 = await ethers.utils._TypedDataEncoder.getPayload(domain, types, message);
    console.log(messageHash2);

    try {
      const signature = await signer?._signTypedData(domain, types, message);

      console.log("TYPED SIGNED:" + signature);

      // Parse the signature and extract v, r, and s
      const parsedSignature = ethers.utils.splitSignature(signature);
      const { v, r, s } = parsedSignature;

      console.log("v:", v);
      console.log("r:", r);
      console.log("s:", s);

      const signerAddress = ethers.utils.verifyTypedData(domain, types, message, signature);

      console.log("Recovered signer: " + signerAddress);

      if (signerAddress.toLowerCase() === ethers.utils.getAddress(address).toLowerCase()) {
        alert("Successfully recovered signer as " + address);
      } else {
        alert("Failed to verify signer when comparing " + signerAddress + " to " + address);
      }

      setSignature(signature);
    } catch (error) {
      console.error("Error signing typed data:", error);
    }
  }

  async function submitPassport() {
    setNoScoreMessage("");
    try {
      // call the API to get the signing message and the nonce
      const { message, nonce } = await getSigningMessage();
      console.log(message);
      // ask the user to sign the message
      const signature = await signer?.signMessage(message);
      console.log(signature);

      // call the API, sending the signing message, the signature, and the nonce
      const response = await fetch(SUBMIT_PASSPORT_URI, {
        method: "POST",
        headers,
        body: JSON.stringify({
          address,
          scorer_id: SCORER_ID,
          signature,
          nonce,
        }),
      });

      const data = await response.json();
      console.log("data:", data);
    } catch (err) {
      console.log("error: ", err);
    }
  }

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2000);
  };

  const truncate = {
    maxWidth: "100%",
    overflow: "hidden",
    wordWrap: "break-word",
  };

  const styles = {
    main: {
      width: "375px",
      margin: "0 auto",
      paddingTop: 95,
    },
    heading: {
      fontSize: 40,
      marginTop: 40,
      textAlign: "center",
    },
    intro: {
      fontSize: 15,
      color: "rgba(0, 0, 0, .55)",
    },
    configurePassport: {
      marginTop: 20,
      textAlign: "center",
    },
    linkStyle: {
      color: "#008aff",
    },
    buttonContainer: {
      marginTop: 20,
      padding: 20,
      textAlign: "center",
    },
    buttonStyle: {
      padding: "10px 30px",
      outline: "none",
      border: "none",
      cursor: "pointer",
      marginRight: "10px",
      borderBottom: "2px solid rgba(0, 0, 0, .2)",
      borderRight: "2px solid rgba(0, 0, 0, .2)",
    },
    hiddenMessageContainer: {
      marginTop: 15,
    },
    signatureContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "transparent",
      padding: "8px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      margin: "0 auto", // Add this line
      maxWidth: "90%", // Add this line
    },
    noScoreMessage: {
      margin: 0,
    },
  };

  //call function on canFundMeFactory contract: methodname = verifyPassport
  //passes in score of user and the signature
  const factory = useScaffoldContract({
    contractName: "CanFundMeFactory",
  });
  const { data: deployedContractData } = useDeployedContractInfo("CanFundMeFactory");

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "CanFundMeFactory",
    functionName: "verifyPassport",
    address: factory.data?.address,
    abi: deployedContractData?.abi as Abi,
    args: [score, _signature],
  });

  return (
    /* this is the UI for the app */
    <div style={styles.main}>
      <StyledWindow isDarkMode={isDarkMode}>
        <h1 style={styles.heading}>Gitcoin Passport Scorer 🫶</h1>
        <p style={styles.configurePassport}>
          Configure your passport{" "}
          <a style={styles.linkStyle} target="_blank" href="https://passport.gitcoin.co/#/dashboard" rel="noreferrer">
            here
          </a>
        </p>
        <p style={styles.configurePassport}>
          Once you have added more stamps to your passport, submit your passport again to recalculate your score.
        </p>

        <div style={styles.buttonContainer}>
          {!isConnected && (
            <StyledButton isDarkMode={isDarkMode} style={styles.buttonStyle} onClick={_connect}>
              Connect Wallet
            </StyledButton>
          )}
          {score && (
            <div>
              <h1>Your passport score is {score} 🎉</h1>
              <div style={styles.hiddenMessageContainer}>
                {Number(score) >= THRESHOLD_NUMBER && (
                  <h2>
                    Congratulations, your score is high enough, sign a message and copy the signature to get a bonus
                    when adding funds!!
                  </h2>
                )}
                {Number(score) < THRESHOLD_NUMBER && (
                  <h2>Sorry, your score is not high enough to view the secret message.</h2>
                )}
              </div>
            </div>
          )}
          {isConnected && (
            <div style={styles.buttonContainer}>
              <StyledButton isDarkMode={isDarkMode} style={styles.buttonStyle} onClick={submitPassport}>
                Submit Passport
              </StyledButton>
              <StyledButton isDarkMode={isDarkMode} style={styles.buttonStyle} onClick={() => checkPassport()}>
                Check passport score
              </StyledButton>

              <StyledButton isDarkMode={isDarkMode} style={styles.buttonStyle} onClick={() => GetSignedScore()}>
                Get signed score
              </StyledButton>
              <StyledButton
                isDarkMode={isDarkMode}
                style={styles.buttonStyle}
                disabled={isLoading}
                onClick={() => writeAsync()}
              >
                Verify Passport
              </StyledButton>
            </div>
          )}
          {noScoreMessage && <p style={styles.noScoreMessage}>{noScoreMessage}</p>}
          {_signature && (
            <div style={styles.main}>
              <p style={styles.noScoreMessage}>
                Your signature is: <br />
                <p style={truncate}>{_signature}</p>
                <StyledButton
                  isDarkMode={isDarkMode}
                  onClick={() => copyToClipboard(_signature)}
                  style={{ border: "none", background: "none", cursor: "pointer" }}
                >
                  <CopyIcon className="ml-1 cursor-pointer h-4 w-4" />
                </StyledButton>
                {toastVisible && (
                  <div
                    style={{
                      position: "fixed",
                      top: "1rem",
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 1000,
                      backgroundColor: "#0a0a2a",
                      color: "white",
                      fontSize: "1rem",
                      padding: "0.5rem 1rem",
                      borderRadius: "4px",
                      tranparent: "0.5s",
                    }}
                  >
                    Copied to clipboard!
                  </div>
                )}
                <br />
                Message Contents: <br />
                Score: {score} <br />
                Your address: {address} <br />
                Contract address: {contractInfo?.address}
              </p>
            </div>
          )}
        </div>
      </StyledWindow>
    </div>
  );
}

export default Passport;
