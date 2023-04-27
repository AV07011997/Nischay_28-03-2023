import React, { useEffect, useState } from "react";
import { getApi, postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";
import NavBar from "../../../../utilities/navbar/navbar";
// import { useState } from "react"
import { objectFunction } from "../../../../constants/objectFunction";
const AnalyzeBankMonthWise = (leadID) => {
  var [table1, settable1] = useState();
  const tableheaders = [
    { value: "Account number", colSpan: "0" },
    { value: "Bank name", colSpan: "0" },
    { value: "Transactions", rowspan: "2" },
  ];

  const tablesubheaders = ["", "", "From", "To"];

  console.log(localStorage.getItem("leadID"));
  // useEffect(() => {
  //   postApi("analyze/" + APIADDRESS.ANALYZEBANKMONTHWISE, {
  //     leadID: localStorage.getItem("leadID"),
  //   }).then((response) => {
  //     console.log(response);
  //     if (response) {
  //       table1 = objectFunction(response);
  //       settable1(table1);
  //     }
  //   });
  // }, []);
  useEffect(() => {
    postApi("analyze/" + APIADDRESS.ANALYZEBANKMONTHWISE, {
      leadID: localStorage.getItem("leadID"),
      optbank: "01208020000685",
    }).then((response) => {
      console.log(response);
      if (response) {
        table1 = objectFunction(response);
        settable1(table1);
      }
    });
  }, []);
  console.log(table1);

  return (
    <div>
      <NavBar></NavBar>
      <div className="table_landingpage">
        <table className="table_fixed">
          <thead className="landingpage_table_header">
            <tr>
              <th rowSpan={2}>Account Number</th>
              <th rowSpan={2}>Bank Name number</th>
              <th colSpan="2">Transactions</th>
            </tr>
            <tr>
              <></>
              <></>
              <th>From</th>
              <th>To</th>
            </tr>
          </thead>
        </table>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th class="rm-head" colSpan="3"></th>

              <th class="header-table" width="100">
                Jul-20{" "}
              </th>

              <th class="header-table" width="100">
                Jun-20{" "}
              </th>

              <th class="header-table" width="100">
                May-20{" "}
              </th>

              <th class="header-table" width="100">
                Apr-20{" "}
              </th>

              <th class="header-table" width="100">
                Mar-20{" "}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="10" class="header-table">
                Inflows
              </td>
            </tr>
            <tr>
              <td rowSpan="3">Non Cash Credits</td>
            </tr>
            <tr>
              <td class="count-value">Count</td>

              <td class="num">128 </td>

              <td class="num">104 </td>

              <td class="num">16 </td>

              <td class="num">0 </td>

              <td class="num">108 </td>
            </tr>
            <tr>
              <td class="count-value">Value</td>

              <td class="num">₹58,57,616 </td>

              <td class="num">₹2,66,58,527 </td>

              <td class="num">₹17,10,295 </td>

              <td class="num">₹0 </td>

              <td class="num">₹3,22,24,265 </td>
            </tr>
            <tr>
              <td rowSpan="3">Cash Credits</td>
            </tr>
            <tr>
              <td class="count-value">Count</td>

              <td class="num">60 </td>

              <td class="num">4 </td>

              <td class="num">0 </td>

              <td class="num">0 </td>

              <td class="num">28 </td>
            </tr>
            <tr>
              <td>Value</td>

              <td class="num">₹1,29,72,000 </td>

              <td class="num">₹5,24,000 </td>

              <td class="num">₹0 </td>

              <td class="num">₹0 </td>

              <td class="num">₹46,26,000 </td>
            </tr>
            <tr>
              <td rowSpan="3">Total Credits</td>
            </tr>
            <tr>
              <td class="count-value">Count</td>

              <td class="num">188 </td>

              <td class="num">108 </td>

              <td class="num">16 </td>

              <td class="num">0 </td>

              <td class="num">136 </td>
            </tr>
            <tr>
              <td class="count-value">Value</td>

              <td class="num">₹1,88,29,616 </td>

              <td class="num">₹2,71,82,527 </td>

              <td class="num">₹17,10,295 </td>

              <td class="num">₹0 </td>

              <td class="num">₹3,68,50,265 </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AnalyzeBankMonthWise;
