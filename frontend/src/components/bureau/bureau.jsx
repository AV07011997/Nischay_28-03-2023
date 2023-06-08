import "./bureau.css";
import React, { useEffect } from "react";
import NavBar from "../../utilities/navbar/navbar";
import MaterialTable from "@material-table/core";
import { useParams } from "react-router-dom";
import { APIADDRESS } from "../../constants/constants";
import { postApi } from "../../callapi";
import { useState } from "react";

const Bureau = ({ info }) => {
  console.log(info);
  const params = useParams();
  const [tableData, setTableData] = useState();
  var { radiovalue } = params;

  useEffect(() => {
    postApi(APIADDRESS.BUREAUDATA, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      setTableData(res);
      console.log(res);
    });
  }, []);

  const state = {
    columns: [
      { title: "Loan Selection", field: "loanSelection" },
      { title: "Date Reported", field: "dateReported" },
      { title: "Loan Type", field: "loanType" },
      { title: "Loan Status", field: "loanStatus" },
      { title: "Disbursal Date", field: "disbursalDate" },
      { title: "Disbursed amount", field: "disbursedAmount" },
      { title: "Tenure(M)", field: "tenure" },
      { title: "ROI(%)", field: "roi" },
      { title: "EMI", field: "emi" },
      { title: "Current Balance", field: "currentBalance" },
      { title: "Last DPD", field: "lastDpd" },
      { title: "Overdue Amount", field: "overdueAmount" },
      { title: "Source", field: "source" },
      { title: "Value Type", field: "valueType" },
    ],
  };

  // useEffect(() => {
  //   postApi(APIADDRESS.BUREAUDATA, info).then((response) => {
  //     console.log(response);
  //   });
  // }, []);
  console.log(state.columns);

  return (
    <div>
      <NavBar radiovalue={radiovalue}></NavBar>

      <div>
        <table className="table_bureau">
          <thead className="table_bureau_thead">
            <tr>
              {state.columns.map((items, i) => {
                return <th>{items.title}</th>;
              })}
            </tr>
          </thead>
          <tbody className="table_bureau_tbody"></tbody>
        </table>
      </div>
    </div>
  );
};

export default Bureau;
