import React, { useEffect, useState } from "react";
import NavBar from "../../../../utilities/navbar/navbar";
import NestedTable from "../../../../utilities/NestedTable/NestedTable";
import { APIADDRESS } from "../../../../constants/constants";
import { postApi } from "../../../../callapi";
import "./bureauMinthwise.css";

function removeCharactersFromKeys(obj) {
  const newObj = {};

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/fy|_/g, "");
      newObj[newKey] = obj[key];
    }
  }

  return newObj;
}

const blueshade = "#E9eeee";

const BureauMonthwise = () => {
  const [data, setdata] = useState();
  const [data11, setdata11] = useState();
  const [data12, setdata12] = useState();
  const [data21, setdata21] = useState();
  const [data22, setdata22] = useState();
  const [data31, setdata31] = useState();
  const [data32, setdata32] = useState();
  const [data41, setdata41] = useState();
  const [data42, setdata42] = useState();

  const mainHeaders = [
    "EMI scheduled",
    "Active TLs",
    "Products",
    "EMI by product",
    "DPD",
    "Status",
  ];
  useEffect(() => {
    postApi("analyze/" + APIADDRESS.BUREAUMONTHWISE, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      console.log(res);
      const modifiedObj = removeCharactersFromKeys(res[0]);

      setdata(modifiedObj);
      setdata11(res[1]);
      setdata12(res[2]);
      setdata21(res[3]);
      setdata22(res[4]);
      setdata31(res[5]);
      setdata32(res[6]);
      setdata41(res[7]);
      setdata42(res[8]);
    });
  }, []);
  console.log(data);
  console.log(data11);
  console.log(data12);

  return (
    <div>
      <NavBar></NavBar>

      <div
        style={{
          display: "flex",
          marginLeft: "16px",
          textAlign: "center",
          overflowX: "auto",
          marginRight: "15px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ width: "180px" }}>
          <table className="firstTable">
            <thead>
              <tr>
                <th
                  style={{
                    background: "black",
                    color: "white",
                    width: "60px",
                  }}
                >
                  Year
                </th>
                <th
                  style={{
                    background: "black",
                    color: "white",
                    width: "120px",
                  }}
                >
                  KPI
                </th>
              </tr>
            </thead>
            {data && data.years ? (
              data.years.map((item, index) => (
                <tbody key={item}>
                  <tr
                    style={{
                      backgroundColor: index % 2 === 0 ? "white" : blueshade,
                    }}
                  >
                    <th rowSpan={7}>{item}</th>
                    {mainHeaders.map((header) => (
                      <tr key={header}>
                        <td style={{ width: "120px", textAlign: "left" }}>
                          {header}
                        </td>
                      </tr>
                    ))}
                  </tr>
                </tbody>
              ))
            ) : (
              <tbody>
                <tr>
                  <td>Loading data...</td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
        <div style={{ width: "87%" }}>
          <table className="secondTable" style={{ height: "50px" }}>
            <thead
              style={{
                height: "23.8px",
                background: "black",
                color: "white",
              }}
            >
              <th>DEC</th>
              <th>NOV</th>
              <th>OCT</th>
              <th>SEPT</th>
              <th>AUG</th>
              <th>JULY</th>
              <th>JUN</th>
              <th>MAY</th>
              <th>APR</th>
              <th>MAR</th>
              <th>FEB</th>
              <th>JAN</th>
            </thead>
            <tbody>
              <tr>
                {data12 &&
                  Object.keys(data12).map((key) => (
                    <td style={{ height: "25px" }}>
                      {data12[key][0]?.sum_emi}
                    </td>
                  ))}
              </tr>
              <tr>
                {data12 &&
                  Object.keys(data12).map((key) => (
                    <td>{data12[key][0]?.cnt_active_accounts || " "}</td>
                  ))}
              </tr>
              <tr>
                {data11 &&
                  Object.keys(data11).map((key) => (
                    <td
                      style={{ padding: "0px", margin: "0px", width: "30px" }}
                    >
                      <NestedTable cell_data={data11[key]}></NestedTable>
                    </td>
                  ))}
              </tr>

              {/* 2nd rows starts //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}

              <tr>
                {data22 &&
                  Object.keys(data22).map((key) => (
                    <td style={{ height: "25px", background: blueshade }}>
                      {data22[key][0]?.sum_emi}
                    </td>
                  ))}
              </tr>
              <tr>
                {data22 &&
                  Object.keys(data22).map((key) => (
                    <td style={{ background: blueshade }}>
                      {data22[key][0]?.cnt_active_accounts || " "}
                    </td>
                  ))}
              </tr>
              <tr>
                {data21 &&
                  Object.keys(data21).map((key) => (
                    <td
                      style={{
                        padding: "0px",
                        margin: "0px",
                        width: "30px",
                        background: blueshade,
                      }}
                    >
                      <NestedTable cell_data={data21[key]}></NestedTable>
                    </td>
                  ))}
              </tr>
              {/* 3rd rows starts //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}
              <tr>
                {data32 &&
                  Object.keys(data32).map((key) => (
                    <td style={{ height: "25px" }}>
                      {/* {data32[key][0]?.sum_emi} */}
                      {data32[key][0]?.sum_emi &&
                      data32[key][0]?.sum_emi !== "₹ 0"
                        ? data32[key][0]?.sum_emi
                        : " "}
                    </td>
                  ))}
              </tr>
              <tr>
                {data32 &&
                  Object.keys(data32).map((key) => (
                    <td>{data32[key][0]?.cnt_active_accounts || " "}</td>
                  ))}
              </tr>
              <tr>
                {data31 &&
                  Object.keys(data31).map((key) => (
                    <td
                      style={{ padding: "0px", margin: "0px", width: "30px" }}
                    >
                      <NestedTable cell_data={data31[key]}></NestedTable>
                    </td>
                  ))}
              </tr>
              {/* 4th rows starts //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}

              <tr>
                {data42 &&
                  Object.keys(data42).map((key) => (
                    <td style={{ height: "25px", background: blueshade }}>
                      {/* {data42[key][0]?.sum_emi} */}
                      {data42[key][0]?.sum_emi &&
                      data42[key][0]?.sum_emi !== "₹ 0"
                        ? data42[key][0]?.sum_emi
                        : " "}
                    </td>
                  ))}
              </tr>
              <tr>
                {data42 &&
                  Object.keys(data42).map((key) => (
                    <td style={{ background: blueshade, height: "24.5px" }}>
                      {data42[key][0]?.cnt_active_accounts
                        ? data42[key][0].cnt_active_accounts
                        : " "}
                    </td>
                  ))}
              </tr>
              <tr>
                {data41 &&
                  Object.keys(data41).map((key) => (
                    <td
                      style={{
                        padding: "0px",
                        margin: "0px",
                        width: "30px",
                        background: blueshade,
                      }}
                    >
                      <NestedTable cell_data={data41[key]}></NestedTable>
                    </td>
                  ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default BureauMonthwise;
