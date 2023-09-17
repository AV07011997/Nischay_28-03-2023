import React, { useEffect, useState } from "react";
import { getApi, postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";
import NavBar from "../../../../utilities/navbar/navbar";
import { Loader, Navbar } from "rsuite";
import "./month_wise.css";
// import ReactDOM from "react-dom";
import SELECTBANKCUSTOMER from "../../../../utilities/selectBankCustomer/selectBankCustomer";

const addSpaceAfterRupee = (data) => {
  const modifiedData = {};

  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      let modifiedValue = value;

      if (typeof value === "string" && value.includes("₹")) {
        modifiedValue = value.replace(/₹(\d+)/g, "₹ $1");
        if (modifiedValue === "₹ 0") {
          modifiedValue = "0";
        }
      }

      modifiedData[key] = modifiedValue;
    }
  }

  return modifiedData;
};

function NewComponent(props) {
  const { data } = props;
  const headers = [
    "Transaction Date",
    "Description",
    "Debit",
    "Credit",
    "Balance",
  ];
  // console.log(data);

  return (
    <div>
      <div>
        <table>
          <thead>
            <tr>
              {headers.map((item, i) => {
                return (
                  <th
                    style={{
                      border: "2px solid black",
                      background: "black",
                      color: "white",
                    }}
                  >
                    {item}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => {
              return (
                <tr key={i}>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.txn_date}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.description}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      border: "1px solid #5a5a5a",
                    }}
                  >
                    {item.debit}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.credit}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.balance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AnalyzeBankMonthWise = ({ setUser }) => {
  setUser(localStorage.getItem("user"));

  var [table1, settable1] = useState();
  var [optbank, setoptbank] = useState();
  const [acc_number, setacc_number] = useState();
  const [popupData, setPopUpData] = useState();
  const [buttonClicked, setbuttonClicked] = useState("closed");
  const [src, setSrc] = useState();
  const [src2, setSrc2] = useState();
  const [len, setlen] = useState();
  var Amount_pop_up = 0;

  const tableheaders = [
    { value: "Account number", colSpan: "0" },
    { value: "Bank name", colSpan: "0" },
    { value: "Transactions", rowspan: "2" },
  ];

  function checkNegativeString(str) {
    return str.startsWith("-");
  }

  function TableCell({ value }) {
    const color = checkNegativeString(value) ? "red" : "#575757";
    return <td style={{ color, textAlign: "right" }}>{value}</td>;
  }

  const tablesubheaders = ["", "", "From", "To"];

  const lightGrey = "#f0f0f0";

  console.log(localStorage.getItem("leadID"));

  function handledata(data, acc_number, table1) {
    console.log(acc_number);
    setacc_number(acc_number);
    setoptbank(data);
    settable1(table1);
  }
  useEffect(() => {
    setSrc("./staticfiles/" + String(acc_number) + "bcmk_fig.png");
    setSrc2("./staticfiles/" + String(acc_number) + "bcmk_fig_1.png");
  }, [optbank]);

  useEffect(() => {
    window.scrollTo({
      top: 500, // Replace with the desired pixel height
      behavior: "smooth", // This enables smooth scrolling
    });
  }, [optbank]);

  function openWindow(type, amount) {
    Amount_pop_up = amount;
    const getPopUpData = async () => {
      console.log("hello");
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZEBANKMONTHWISEPOPUP,
        {
          type: type,
          amount: amount,
          account_number: acc_number,
          leadID: localStorage.getItem("leadID"),
        }
      );
      console.log(response);
      setPopUpData(response);
    };

    getPopUpData();
  }
  useEffect(() => {
    if (popupData && buttonClicked === "open") {
      const newWindow = window.open("", "_blank");
      newWindow.document.title = "New Window";

      // Create a new element to render the NewComponent in
      const newElement = document.createElement("div");
      newWindow.document.body.appendChild(newElement);

      // Render the NewComponent with the data in the new element
      ReactDOM.render(<NewComponent data={popupData[0]} />, newElement);
      setbuttonClicked("closed");
    }
  }, [popupData]);

  const removeRupeeSign = (array) => {
    return array.map((item) => {
      return {
        ...item,
        amount: item.amount.replace("₹", ""),
      };
    });
  };
  const maxColumns = 12;

  console.log(optbank);

  useEffect(() => {
    if (table1) {
      window.scrollTo({
        top: 260 + 30 * (table1["columns"].length - 1), // Replace with the desired pixel height - 140*2 -140/4
        behavior: "smooth", // This enables smooth scrolling
      });
    }
  }, [optbank]);

  console.log(table1);

  return (
    <div>
      <NavBar></NavBar>

      <SELECTBANKCUSTOMER
        onData={handledata}
        apiaddress={APIADDRESS.ANALYZEBANKMONTHWISE}
      ></SELECTBANKCUSTOMER>

      {optbank && (
        <div className="div_table1_monthwise">
          <table
            style={{
              width: "auto",
              marginLeft: "74px",
              marginRight: "0",
              padding: "0",
            }}
            className="table1_monthwise"
          >
            <thead
              className="thead_table1_monthwise"
              style={{ fontSize: "15px" }}
            >
              <tr>
                <th colSpan={3}></th>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ width: "88.5px" }}>{item.month_year}</td>
                    );
                  }
                })}
                {/* {optbank.slice(0, maxColumns).map((column, index) => (
                  <th key={index}>Column {index + 1}</th>
                ))} */}
              </tr>
            </thead>
            <tbody style={{ fontSize: "14px" }}>
              <tr>
                <td
                  style={{ width: "80px", fontSize: "15px" }}
                  className="highlighted_headers"
                  rowSpan={10}
                >
                  Credits
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left", width: "90px" }} rowSpan={3}>
                  Non Cash{" "}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left", width: "90px" }}>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Non_cash_credits_Count}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>Value {" (₹)"}</td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Non_cash_credits_Value}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td style={{ textAlign: "left" }} rowSpan={3}>
                  {" "}
                  Cash{" "}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left", width: "137px" }}>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Cash_credits_Count}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>Value{" (₹)"}</td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Cash_credits_Value}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td style={{ textAlign: "left" }} rowSpan={3}>
                  Total{" "}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Total_credits_Count}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>Value{" (₹)"}</td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Total_credits_Value}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td
                  className="highlighted_headers"
                  rowSpan={13}
                  style={{ fontSize: "15px" }}
                >
                  {" "}
                  Debits
                </td>
              </tr>
              {/* <tr>
                <td style={{ textAlign: "left" }} rowSpan={3}>
                  Other{" "}
                </td>
              </tr> */}
              <tr>
                <td
                  rowSpan={3}
                  style={{ textAlign: "left", background: lightGrey }}
                >
                  Auto{" "}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left", background: lightGrey }}>
                  Count
                </td>
                {/* {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Non_cash_debits_Count}
                      </td>
                    );
                  }
                })} */}
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right", background: lightGrey }}>
                        {item.Auto_debits_Count}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td style={{ textAlign: "left", background: lightGrey }}>
                  Value{" (₹)"}
                </td>
                {/* {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Non_cash_debits_Value}
                      </td>
                    );
                  }
                })} */}
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right", background: lightGrey }}>
                        {item.Auto_debits_Value}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td
                  style={{ textAlign: "left", background: lightGrey }}
                  rowSpan={3}
                >
                  Cash{" "}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left", background: lightGrey }}>
                  Count
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right", background: lightGrey }}>
                        {item.Cash_debits_Count}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td style={{ textAlign: "left", background: lightGrey }}>
                  Value{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right", background: lightGrey }}>
                        {item.Cash_debits_Value}
                      </td>
                    );
                  }
                })}
              </tr>
              {/* <tr>
                <td rowSpan={3} style={{ textAlign: "left" }}>
                  Total
                </td>
              </tr> */}
              <tr>
                <td
                  style={{ textAlign: "left", background: lightGrey }}
                  rowSpan={3}
                >
                  Other{" "}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left", background: lightGrey }}>
                  Count
                </td>
                {/* {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Total_debits_Count}
                      </td>
                    );
                  }
                })} */}
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right", background: lightGrey }}>
                        {item.Non_cash_debits_Count}
                      </td>
                    );
                  }
                })}
                {/* {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Auto_debits_Count}
                      </td>
                    );
                  }
                })} */}
              </tr>
              <tr>
                <td style={{ textAlign: "left", background: lightGrey }}>
                  Value{" (₹)"}
                </td>
                {/* {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Total_debits_Value}
                      </td>
                    );
                  }
                })} */}
                {/* {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Auto_debits_Value}
                      </td>
                    );
                  }
                })} */}
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right", background: lightGrey }}>
                        {item.Non_cash_debits_Value}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td
                  rowSpan={3}
                  style={{ textAlign: "left", background: lightGrey }}
                >
                  Total{" "}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left", background: lightGrey }}>
                  Count
                </td>
                {/* {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Auto_debits_Count}
                      </td>
                    );
                  }
                })} */}
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right", background: lightGrey }}>
                        {item.Total_debits_Count}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td style={{ textAlign: "left", background: lightGrey }}>
                  Value{" (₹)"}
                </td>
                {/* {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Auto_debits_Value}
                      </td>
                    );
                  }
                })} */}
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right", background: lightGrey }}>
                        {item.Total_debits_Value}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td
                  className="highlighted_headers"
                  colSpan={3}
                  style={{ fontSize: "15px" }}
                >
                  Minimum Balance{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>{item.Min_Balance}</td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td
                  className="highlighted_headers"
                  colSpan={3}
                  style={{ fontSize: "15px" }}
                >
                  Maximum Balance{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>{item.Max_Balance}</td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td
                  className="highlighted_headers"
                  colSpan={3}
                  style={{ fontSize: "15px" }}
                >
                  Average Balance{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Average_balance}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td
                  className="highlighted_headers"
                  colSpan={3}
                  style={{ fontSize: "15px" }}
                >
                  Month End Balance{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        {item.Month_End_balance}
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td
                  className="highlighted_headers"
                  colSpan={3}
                  style={{ fontSize: "15px" }}
                >
                  Max Credit Amount{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        <button
                          style={{
                            color: "blue",
                            background: "transparent",
                            border: "none",
                            padding: "0",
                            margin: "0",
                          }}
                          className="button_monthwise"
                          onClick={() => {
                            setbuttonClicked("open");
                            openWindow("credit", item.Max_credit_Amount);
                            // handleButtonClick();
                          }}
                        >
                          {item.Max_credit_Amount}
                        </button>
                      </td>
                    );
                  }
                })}
              </tr>

              <tr>
                <td
                  className="highlighted_headers"
                  colSpan={3}
                  style={{ fontSize: "15px" }}
                >
                  Max Debit Amount{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td style={{ textAlign: "right" }}>
                        <button
                          style={{
                            color: "blue",
                            background: "transparent",
                            border: "none",
                            padding: "0",
                            margin: "0",
                          }}
                          className="button_monthwise"
                          onClick={() => {
                            setbuttonClicked("open");

                            openWindow("debit", item.Max_debit_Amount);
                            // handleButtonClick();
                          }}
                        >
                          {item.Max_debit_Amount}
                        </button>
                      </td>
                    );
                  }
                })}
              </tr>

              <tr>
                <td
                  className="highlighted_headers"
                  colSpan={3}
                  style={{ fontSize: "15px" }}
                >
                  Net Inflow Amount{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return <TableCell value={item.Net_Inflow_Amount} />;
                  }
                })}
              </tr>
              <tr>
                <td
                  className="highlighted_headers"
                  colSpan={3}
                  style={{ fontSize: "15px" }}
                >
                  EMI{" (₹)"}
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return <td style={{ textAlign: "right" }}>{item.EMI}</td>;
                  }
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* {optbank && (
        <div>
          <span>
            <img className="graph_monthwise" src={src} alt="graph1"></img>
            <img className="graph_monthwise" src={src2} alt="graph2"></img>
          </span>
        </div>
      )} */}

      {/* <div>
          <table>
            <thead>
              <tr>
                <th>Transaction Date</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {popupData[0].map((item, i) => {
                <tr key={i}>
                  <td>{item.txn_date}</td>
                  <td>{item.description}</td>
                  <td>{item.debit}</td>
                  <td>{item.credit}</td>
                  <td>{item.balance}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div> */}
    </div>
  );
};
export default AnalyzeBankMonthWise;
