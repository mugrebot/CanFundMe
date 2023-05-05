import React from "react";
import CreateCanFund from "../components/CreateCanFund";
import { NextPage } from "next";

const CreateTSX: NextPage = () => {
  return (
    <div className="content-container">
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
      <CreateCanFund />
      </div>
    </div>
  );
};

export default CreateTSX;
