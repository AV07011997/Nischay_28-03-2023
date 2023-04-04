import React from "react";
import "./pageinfo.css";

const Pageinfo = ({ leadId, name }) => {
  const obj = ["Lead ID", "Name"];
  return (
    <div className="pageinfo">
      <h4>
        {obj[0]}:{leadId} {obj[1]}:{name}
      </h4>
    </div>
  );
};
export default Pageinfo;
