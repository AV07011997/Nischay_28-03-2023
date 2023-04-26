import React, { useEffect } from "react";
import { getApi, postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";

const AnalyzeBankSummary = (leadID) => {
  useEffect(() => {
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: "Hello",
    });
  }, []);
  return <div>Hello</div>;
};
export default AnalyzeBankSummary;
