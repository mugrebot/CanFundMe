import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import NextNProgress from "nextjs-progressbar";
import { MenuList, MenuListItem, Separator, styleReset } from "react95";
// original Windows95 font (optionally)
import ms_sans_serif from "react95/dist/fonts/ms_sans_serif.woff2";
import ms_sans_serif_bold from "react95/dist/fonts/ms_sans_serif_bold.woff2";
// pick a theme of your choice
import original from "react95/dist/themes/original";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, createGlobalStyle } from "styled-components";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { HomePage } from "~~/components/HomePage";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useEthPrice } from "~~/hooks/scaffold-eth";
import { useAppStore } from "~~/services/store/store";
import { wagmiClient } from "~~/services/web3/wagmiClient";
import { appChains } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";


const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const price = useEthPrice();
  const setEthPrice = useAppStore(state => state.setEthPrice);
  // This variable is required for initial client side rendering of correct theme for RainbowKit
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { isDarkMode } = useDarkMode();

  const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif}') format('woff2');
    font-weight: 400;
    font-style: normal
  }
  @font-face {
    font-family: 'ms_sans_serif';
    src: url('${ms_sans_serif_bold}') format('woff2');
    font-weight: bold;
    font-style: normal
  }
  body {
    font-family: 'ms_sans_serif';
  }
`;

  useEffect(() => {
    if (price > 0) {
      setEthPrice(price);
    }
  }, [setEthPrice, price]);

  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  return (
    <div>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <WagmiConfig client={wagmiClient}>
          <NextNProgress />
          <RainbowKitProvider
            chains={appChains.chains}
            avatar={BlockieAvatar}
            theme={isDarkTheme ? darkTheme() : lightTheme()}
          >
              <HomePage />
              <main className="flex flex-col flex-1 ">
                <Component {...pageProps} />
              </main>
              <Footer />
            <Toaster />
          </RainbowKitProvider>
        </WagmiConfig>
      </ThemeProvider>
    </div>
  );
};

export default ScaffoldEthApp;
