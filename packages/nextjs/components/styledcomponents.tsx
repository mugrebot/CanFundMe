import styled from "styled-components";
import { Button, Select, Window, WindowHeader } from "react95";

interface DarkModeProps {
  isDarkMode: boolean;
}

export const StyledWindow = styled(Window)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#000000" : "#06fc99")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#000000")};
`;

export const StyledWindowHeader = styled(WindowHeader)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#000000")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#000000" : "#06fc99")};
  
`;

export const StyledButton = styled(Button)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#000000" : "#06fc99")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#000000")};
  variant: 'flat';
  
`;

export const StyledSelect = styled(Select)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#000000" : "#06fc99")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#000000")};
`;
