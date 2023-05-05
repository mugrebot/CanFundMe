import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import logoIMG from "../assets/CanFundMe.png";
import { AppBar, Button, MenuList, MenuListItem, Separator, TextInput, Toolbar } from "react95";
import styled from "styled-components";
import { BugAntIcon } from "@heroicons/react/24/outline";
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
      className={`${isActive ? "shadow-md" : ""} hover:hover:shadow-md focus:py-1.5 px-3 text-sm rounded-full gap-2`}
    >
      {children}
    </Link>
  );
};

export const HomePage = () => {
  const [open, setOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);

  console.log(isDrawerOpen);

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
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
    </div>
  );

  return (
    <Wrapper>
      <AppBar className="yeet">
        <Toolbar style={{ justifyContent: "space-between" }}>
          <Button onClick={() => setOpen(!open)} active={open} style={{ fontWeight: "bold" }}>
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
          <TextInput placeholder="Search..." width={150} />
          <div className="yeet" style={{ display: "flex", alignItems: "center" }}>
            <RainbowKitCustomConnectButton />
            <FaucetButton />
          </div>
        </Toolbar>
      </AppBar>
    </Wrapper>
  );
};

export default HomePage;
