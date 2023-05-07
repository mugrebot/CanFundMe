import { useState } from "react";
import { CopyIcon } from "../components/example-ui/assets/CopyIcon";
import "@rainbow-me/rainbowkit/styles.css";
import { Abi } from "abitype";
import { ethers } from "ethers";
import { Signer } from "ethers";
import { useDarkMode } from "usehooks-ts";
import { useAccount, useConnect, useSigner } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { StyledButton, StyledWindow, StyledTab, StyledTabs, StyledWindowHeader} from "~~/components/styledcomponents";
import { useDeployedContractInfo, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useScaffoldContract, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { create } from "ipfs-http-client";
import { WindowContent, GroupBox, TabBody, TextInput } from "react95";
import { useRef } from "react";
import Draggable from "react-draggable";




  const IPFS = ({onMinimize}) => {

    const APIKEY = process.env.NEXT_PUBLIC_INFURA_PROJECT_ID;
const SECRET = process.env.NEXT_PUBLIC_INFURA_SECRET;
const inputFileRef = useRef<HTMLInputElement | null>(null); 


const auth = "Basic " + btoa(`${APIKEY}:${SECRET}`);
const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

  // Add the necessary hooks and state variables from UploadIPFS
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [cid, setCid] = useState("");

  // Add the necessary functions from UploadIPFS
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select an image.");
      return;
    }

    const imageDataUrl = await readFileAsDataURL(file);
    const resizedDataUrl = await resizeImage(imageDataUrl, 400, 400);

    const json = JSON.stringify({ image: resizedDataUrl, text });

    const { path } = await client.add(json);

    setCid(path);
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const resizeImage = (
    dataUrl: string,
    maxWidth: number,
    maxHeight: number
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL());
      };
    });
  };


  const { data: contractInfo } = useDeployedContractInfo("Profile");
  console.log("contractInfo", contractInfo);

  //get address from url userouter
    const router = useRouter();
    const { contractAddress } = router.query;
    const _address = (router.query?.contractAddress);
    


  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const { isDarkMode } = useDarkMode();

  const { address, isConnected, connector: activeConnector } = useAccount();
  console.log("address", address);

  const { data: signer } = useSigner();

  const liar = Signer.isSigner(signer);

  // here we deal with any local state we need to manage
const [textMessage, setTextMessage] = useState<string>("");
  const [_signature, setSignature] = useState<string>("");
  const [toastVisible, setToastVisible] = useState(false);
  const [state, setState] = useState({
        activeTab: 0
      });

      const handleChange = (
            value: number,
            event: React.MouseEvent<HTMLButtonElement>
          ) => {
            console.log({ value, event });
            setState({ activeTab: value });
          };
        
          const { activeTab } = state;

  /* todo check user's connection when the app loads */
  async function _connect() {
    try {
      connect({ activeConnector });
    } catch (err) {
      console.log("error connecting...");
    }
  }

  async function GetSignedScore() {
    if (!address) {
      console.log("no address");
      return;
    }

    console.log(contractInfo?.address);


    const domain = {
      name: "CanFundProfile",
      version: "1",
      chainId: 7701,
      verifyingContract: contractInfo?.address,
    };

    const types = {
      Message: [
        { name: "_ipfsHash", type: "string" },
        { name: "_contract", type: "address" },
      ],
    };

    const message = {
      _ipfsHash: cid,
      _contract: _address,
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

  const { data: deployedContractData } = useDeployedContractInfo("Profile");
  const { data: CanFundContractData } = useDeployedContractInfo("CanFundMe");

  const CanFundMeABI = deployedContractData?.abi as Abi;
  const CanFundMeContractABI = deployedContractData?.contract as Abi;

  const { writeAsync: SetProfile, isLoading: fundMeIsLoading } = useScaffoldContractWrite({
    contractName: "Profile",
    functionName: "setIpfsHash",
    address: deployedContractData?.address,
    abi: CanFundMeABI,
    args: [cid, deployedContractData?.address, _signature, _address]
  });

  const { data: isOwner } = useScaffoldContractRead({
    contractName: "CanFundMe",
    functionName: "owner",
    address: _address,
    abi: CanFundMeContractABI,
  });

  const beans = isOwner == address;
  console.log(beans);


  return (
    <div>
      {beans && <Draggable bounds='body' handle='.yeet'>
      <StyledWindow style={{width:400}} isDarkMode={isDarkMode}>
      <StyledWindowHeader className='yeet' style={{display: 'flex', justifyContent: 'space-between'}}isDarkMode={isDarkMode}>profile.exe
      <StyledButton variant='flat' isDarkMode={isDarkMode} onClick={onMinimize}>_</StyledButton>
      </StyledWindowHeader>
      <WindowContent>
        <StyledTabs value={activeTab} onChange={handleChange} isDarkMode={isDarkMode} >
          <StyledTab value={0} isDarkMode={isDarkMode}>Upload To IPFS
          </StyledTab>
          <StyledTab value={1} isDarkMode={isDarkMode}>Sign CID
          </StyledTab>
          <StyledTab value={2} isDarkMode={isDarkMode} >Set Profile
          </StyledTab>
        </StyledTabs>
        <TabBody style={{height: 300 }}>
            {activeTab === 1 && isConnected && (
                                <StyledButton
                                  isDarkMode={isDarkMode}
                                  style={styles.buttonStyle}
                                  onClick={() => GetSignedScore()}
                                >
                                  Sign CID
                                </StyledButton>
                              )}
            {activeTab === 0 && isConnected && (
            <div>
            <form onSubmit={handleSubmit}>
            <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }} 
                />
                                <StyledButton
                                variant="flat"
                  isDarkMode={isDarkMode}
                  onClick={() => inputFileRef.current?.click()}
                >
                  Choose File
                </StyledButton>
      <textarea
        className="notepad-textarea"
        value={text}
        onChange={handleTextChange}
      />
              <StyledButton variant='flat' isDarkMode={useDarkMode} type="submit">Upload</StyledButton>
            </form>
            {cid && <p style={truncate}>Uploaded to IPFS with CID: {cid}</p>}
          </div>)}
            {activeTab === 2 && isConnected && (
                            cid && _address && _signature && (
                                <StyledButton
                                  isDarkMode={isDarkMode}
                                  style={styles.buttonStyle}
                                  onClick={() => SetProfile()}
                                >
                                  Set Profile
                                </StyledButton>
                              ))}

        </TabBody>
        </WindowContent>
      </StyledWindow>
      </Draggable>}
    </div>
  );
};

export default IPFS;