import React, { useEffect, useState } from "react";
import { EventAnimation } from "./EventAnimation";
import IERC20_ABI from "./IERC20.json";
import { IntegerInput } from "./scaffold-eth";
import { Abi } from "abitype";
import { ethers, utils } from "ethers";
import { Checkbox, Counter, ProgressBar } from "react95";
import Draggable from "react-draggable";
import styled from "styled-components";
import { useContract, useSigner, useProvider } from "wagmi";
import { StyledButton, StyledWindow, StyledWindowHeader, StyledProgressBar } from "~~/components/styledcomponents";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import QRCode from "qrcode";
import { useRouter } from "next/router";
import Image from "next/image";
import { useDarkMode } from "usehooks-ts";


//darkmodelightmode

const Notepad = styled.div<{ isDarkMode: boolean }>`
  border: ${({ isDarkMode }) => (isDarkMode ? "1px solid #00190f" : "1px solid #06fc99")};
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f")};
  color: ${({ isDarkMode }) => (isDarkMode ?  "#00190f": "#06fc99")};
  padding: 8px;
  width: 250px;
  height: 250px;
  margin-top: 16px;
  box-shadow: 0 0 0 1px #000 inset;
  overflow: "hidden",
  wordWrap: "break-word",
`;
const StyledSvg = styled.div`
  svg {
    ${({ isDarkMode }) => isDarkMode && `
      filter: invert(1);
    `}
  }
  
`;



export const Profile = () => {
    const [_qrCode, setQRCode] = useState("");
    const [showQRCode, setShowQRCode] = useState(false);
    const [minimizeNotepad, setMinimizeNotepad] = useState(false);  

    const { data: deployedContractData } = useDeployedContractInfo("Profile");

    const CanFundMeABI = deployedContractData?.abi as Abi;

    const { isDarkMode } = useDarkMode();

    const router = useRouter();
    const { contractAddress } = router.query;
    const _address =  contractAddress?.toString();

    const { data: profile_cid } = useScaffoldContractRead({
        contractName: "Profile",
        functionName: "ipfsHash",
        address: deployedContractData?.address,
        abi: CanFundMeABI,
        args: [_address],
      });

      console.log(profile_cid);

      const ipfsGatewayUrl = "https://ipfs.io/ipfs/";

      const [profileData, setProfileData] = useState<{ image: string; text: string } | null>(null);
      const [error, setError] = useState<string | null>(null);

      const handleMinimizeNotepad = () => {
        setMinimizeNotepad(!minimizeNotepad);
      };
    

      useEffect(() => {
        if (profile_cid) {
          fetch(`${ipfsGatewayUrl}${profile_cid}`)
            .then((res) => res.json())
            .then((data) => setProfileData(data))
            .catch((error) => {
              console.error("Error fetching profile data:", error);
              setError("Failed to load profile data");
            });
        }
      }, [profile_cid]);

      useEffect(() => {
        async function fetchQr() {
            if (_address) {
          const qr_string = await QRCode.toString(_address, { type: "svg", color: { dark: "#06fc99", light:"#000000" } });
          setQRCode(qr_string);
            }
        }
    
        fetchQr();
      }, [_address, contractAddress]);



      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            minHeight: "100vh", // Added this line
          }}
        >
          {profileData ? (
            <>
              {!showQRCode ? (
                <Image
                  src={profileData.image}
                  alt="No Profile Image :("
                  width={300}
                  height={300}
                  objectFit="contain"
                  onClick={() => setShowQRCode(!showQRCode)}
                />
              ) : (
                <>
                  <svg
                    width="200"
                    height="200"
                    dangerouslySetInnerHTML={{ __html: _qrCode }}
                    onClick={() => setShowQRCode(!showQRCode)}
                  />
                  <div onClick={() => setShowQRCode(!showQRCode)}>Send canto only</div>
                </>
              )}
              <Draggable bounds={{left: -700, top: -390, right: 660, bottom: 225}}>
                <Notepad isDarkMode={isDarkMode}>
                  <p>{profileData.text}</p>
                </Notepad>
              </Draggable>
            </>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <p className="loading-text">Loading profile data...</p>
          )}
        </div>
      );
    };
    
    export default Profile;