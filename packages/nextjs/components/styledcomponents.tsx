import styled from "styled-components";
import { Button, Select, Window, WindowHeader, TextInput } from "react95";

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
`;

export const StyledTextInput = styled(TextInput)<DarkModeProps>`
  background-color: ${({ isDarkMode }) => (isDarkMode ? "#00190f" : "#06fc99")};
  color: ${({ isDarkMode }) => (isDarkMode ? "#06fc99" : "#00190f")};
`;
