import React, { useCallback, useRef, useState } from "react";
import {
  AppBar,
  Button,
  MenuList,
  MenuListItem,
  Separator,
  TextInput,
  Toolbar,
} from "react95";
import styled from "styled-components";
import logoIMG from "../assets/CanFundMe.png";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { Bars3Icon, BugAntIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

const Wrapper = styled.div`
  padding: 5rem;
  background: ${({ theme }) => theme.desktopBackground};
  z-index: 100;
`;

const NavLink = ({ href, children }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      passHref
      className={`${
        isActive ? "shadow-md" : ""
      } hover:hover:shadow-md focus:py-1.5 px-3 text-sm rounded-full gap-2`}
    >
      {children}
    </Link>
  );
};

export const HomePage = () => {
  const [open, setOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), [])
  );

  const navLinks = (
    <div className="beans">
      <MenuListItem>
        <NavLink href="/">
          <span role="img" aria-label="🏠">
            🏠
          </span>
          Home
        </NavLink>
      </MenuListItem>
      <MenuListItem>
        <NavLink href="/debug">
          <BugAntIcon className="h-4 w-4" />
          Debug Contracts
        </NavLink>
      </MenuListItem>
      <MenuListItem>
        <NavLink href="/example-ui">
          <SparklesIcon className="h-4 w-4" />
          Example UI
        </NavLink>
      </MenuListItem>
    </div>
  );

  return (
    <Wrapper>
      <AppBar>
        <Toolbar style={{ justifyContent: "space-between" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Button
              onClick={() => setOpen(!open)}
              active={open}
              style={{ fontWeight: "bold" }}
            >
              <Image
                src={logoIMG}
                alt="react95 logo"
                style={{ height: "24px", width: "35px", marginRight: 4, marginBottom: 4 }}
              />
              Start
            </Button>
            {open && (
              <MenuList
                style={{
                  position: "absolute",
                  left: "0",
                  top: "100%",
                }}
                onClick={() => setOpen(false)}
              >
                {navLinks}
                <Separator />
                <MenuListItem disabled>
                  <span role="img" aria-label="🔙">
                    🔙
                  </span>
                  Logout
                </MenuListItem>
              </MenuList>
            )}
          </div>
          <TextInput placeholder="Search..." width={150} />
          <div style={{ display: "flex", alignItems: "center" }}>
            <RainbowKitCustomConnectButton />
            <FaucetButton />
          </div>
        </Toolbar>
      </AppBar>
    </Wrapper>
    );
};

export default HomePage;