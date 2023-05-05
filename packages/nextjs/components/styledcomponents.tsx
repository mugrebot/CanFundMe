import styled, {css} from "styled-components";
import { Button, Select, Window, WindowHeader, TextInput, ProgressBar } from "react95";

interface DarkModeProps {
  isDarkMode: boolean;
}

export const StyledWindow = styled(Window)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f")};
`;

export const StyledWindowHeader = styled(WindowHeader)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  
`;

export const StyledButton = styled(Button)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f")};
  variant: 'flat';
  textAlign: "center";
  
`;

export const StyledSelect = styled(Select)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f")};
  margin-top: 5px;
  margin-right: 5px;
  position: relative;

  &:hover {
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#002a1b" : "#29ffab")};
  }

  // Dropdown button
  & > div:last-child {
  }

  // Dropdown menu
  & > ul {
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f")};
    border: 1px solid ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  }

  // Dropdown menu items
  & > ul > li {
    color: ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  }

  // Dropdown menu item hover
  & > ul > li:hover {
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#29ffab" : "#002a1b")};
  }
`;


export const StyledTextInput = styled(TextInput)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f")};
`;

export const StyledScrollView = styled.div<DarkModeProps>`
  overflow-y: scroll;
  overflow-x: scroll;
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;

  // For Firefox
  scrollbar-color: #00190f "#06fc99";

  // For Webkit-based browsers
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f" )};
    border-radius: 6px;
  }

  &::-webkit-scrollbar-corner {
    background-color: ${({ isDarkMode }) => (isDarkMode ? "#00190f": "#06fc99")};
  }
`;


export const StyledProgressBar = styled(ProgressBar)<DarkModeProps>`
  ${({ isDarkMode }) => css`
    & > div > div:first-child {
      background: ${isDarkMode ? "#00190f" : "#06fc99"};
      color: ${isDarkMode ? "#06fc99" : "#00190f"};
    }

    & > div > div:last-child {
      background: ${isDarkMode ? "#06fc99" : "#00190f"};
      color: ${isDarkMode ? "#00190f" : "#06fc99"};
      clip-path: polygon(
        0 0,
        ${({ value = 0 }) => value}% 0,
        ${({ value = 0 }) => value}% 100%,
        0 100%
      );
    }
  `}
`;

