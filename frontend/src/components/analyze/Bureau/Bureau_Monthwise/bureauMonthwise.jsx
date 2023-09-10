import React, { useEffect, useState } from "react";
import NavBar from "../../../../utilities/navbar/navbar";
import NestedTable from "../../../../utilities/NestedTable/NestedTable";
import { APIADDRESS } from "../../../../constants/constants";
import { postApi } from "../../../../callapi";
import "./bureauMinthwise.css";
import { Loader } from "rsuite";

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

  useEffect(() => {
    window.scrollTo({
      top: 300, // Replace with the desired pixel height - 140*2 -140/4
      behavior: "smooth", // This enables smooth scrolling
    });
  });

  return (
    <div>
      <NavBar></NavBar>

      {data ? (
        <div className="bureaumonthwise_maindiv">
          <div className="div1bureaumonthwise">
            <table style={{ tableLayout: "fixed" }} className="firstTable">
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
          <div className="div2bureaumonthwise">
            <table className="secondTable" style={{ height: "50px" }}>
              <thead className="thead1bureaumonthwise">
                <th>DEC</th>
                <th>NOV</th>
                <th>OCT</th>
                <th>SEP</th>
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
                      <td className="td1_1bureaumonthwise">
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
                        className="td2_bureaumonthwise"
                        style={{ padding: "0" }}
                      >
                        <NestedTable cell_data={data11[key]}></NestedTable>
                      </td>
                    ))}
                </tr>

                {/* 2nd rows starts //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}

                <tr>
                  {data22 &&
                    Object.keys(data22).map((key) => (
                      <td className="td3_bureaumonthwise">
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
                        className="td4_bureaumonthwise"
                        style={{ padding: "0" }}
                      >
                        <NestedTable cell_data={data21[key]}></NestedTable>
                      </td>
                    ))}
                </tr>
                {/* 3rd rows starts //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}
                <tr>
                  {data32 &&
                    Object.keys(data32).map((key) => (
                      <td className="td5_bureaumonthwise">
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
                        className="td6_bureaumonthwise"
                        style={{ padding: "0" }}
                      >
                        <NestedTable cell_data={data31[key]}></NestedTable>
                      </td>
                    ))}
                </tr>
                {/* 4th rows starts //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}

                <tr>
                  {data42 &&
                    Object.keys(data42).map((key) => (
                      <td className="td7_bureaumonthwise">
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
                      <td className="td8_bureaumonthwise">
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
                        className="td9_bureaumonthwise"
                        style={{ padding: "0" }}
                      >
                        <NestedTable cell_data={data41[key]}></NestedTable>
                      </td>
                    ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Loader
          className="loader_landingpage"
          center
          size="lg"
          content="loading..."
        ></Loader>
      )}
    </div>
  );
};
export default BureauMonthwise;
