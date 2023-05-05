import React from "react";
import CreateCanFund from "../components/CreateCanFund";
import { NextPage } from "next";

const CreateTSX: NextPage = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CreateCanFund />
    </div>
  );
};

export default CreateTSX;
