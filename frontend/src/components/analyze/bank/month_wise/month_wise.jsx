import React, { useEffect, useState } from "react";
import { getApi, postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";
import NavBar from "../../../../utilities/navbar/navbar";
import { Loader, Navbar } from "rsuite";
import "./month_wise.css";
import ReactDOM from "react-dom";

const AnalyzeBankMonthWise = (leadID) => {
  var [table1, settable1] = useState();
  var [optbank, setoptbank] = useState();
  const [acc_number, setacc_number] = useState();

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
    return <td style={{ color }}>{value}</td>;
  }

  const tablesubheaders = ["", "", "From", "To"];

  console.log(localStorage.getItem("leadID"));

  useEffect(() => {
    const getTable = async () => {
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZEBANKMONTHWISE,
        {
          leadID: localStorage.getItem("leadID"),
        }
      );
      console.log(response);
      settable1(response[0]);
    };

    getTable(); // run it, run it
  }, []);

  // console.log(table1);

  const table2 = (optbank) => {
    setacc_number(optbank);
    console.log("called");
    const getTable = async () => {
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZEBANKMONTHWISE,
        {
          leadID: localStorage.getItem("leadID"),
          optbank: optbank,
        }
      );
      // console.log(response[0]["data"][1]);
      setoptbank(response[0]["data"][1]);
    };

    getTable();
  };
  console.log(optbank);

  function openWindow(type, amount) {
    const getPopUpData = async () => {
      console.log("hello");
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZEBANKMONTHWISEPOPUP,
        {
          type: type,
          amount: amount,
          account_number: acc_number,
        }
      );
      console.log(response);
    };

    getPopUpData();

    const newWindow = window.open("", "_blank");
    const customElement = document.createElement("div");

    // Create and style yourtype custom element here
    customElement.style.backgroundColor = "lightblue";
    customElement.style.width = "200px";
    customElement.style.height = "200px";

    // Render your custom element into the new window's document
    newWindow.document.body.appendChild(customElement);
    // ReactDOM.render(<h1>Hello, world!</h1>, customElement);
  }

  return (
    <div>
      <NavBar></NavBar>
      <div className="div_table1_monthwise">
        {table1 ? (
          <table className="table1_monthwise">
            <thead className="thead_table1_monthwise">
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
            <tbody>
              {table1["data"][0]?.map((item, i) => {
                {
                  if (item) {
                    console.log(item);
                    return (
                      <tr key={i}>
                        <td>
                          <label>
                            <input
                              type="radio"
                              id="radio_table"
                              name="radio_table"
                              value={item.account_number}
                              onClick={() => {
                                table2(item.account_number);
                              }}
                            />
                            <span className="radiobuttongap">
                              {item.account_number}
                            </span>
                          </label>
                        </td>
                        <td>{item.bank_name}</td>
                        <td>{item.from_date}</td>
                        <td>{item.to_date}</td>
                      </tr>
                    );
                  }
                }
              })}
            </tbody>
          </table>
        ) : (
          <Loader
            className="loader_landingpage"
            center
            size="lg"
            content="loading..."
          ></Loader>
        )}
      </div>
      {optbank && (
        <div className="div_table1_monthwise">
          <table className="table1_monthwise">
            <thead className="thead_table1_monthwise">
              <tr>
                <th colSpan={3}></th>
                <th>Jul-20</th>
                <th>Jun-20</th>
                <th>May-20</th>
                <th>Apr-20</th>
                <th>Mar-20</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="highlighted_headers" rowSpan={10}>
                  Inflows
                </td>
              </tr>
              <tr>
                <td rowSpan={3}>Non Cash Credits</td>
              </tr>
              <tr>
                <td>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Non_cash_credits_Count}</td>;
                  }
                })}
              </tr>
              <tr>
                <td>Value</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Non_cash_credits_Value}</td>;
                  }
                })}
              </tr>
              <tr>
                <td rowSpan={3}> Cash Credits</td>
              </tr>
              <tr>
                <td>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Cash_credits_Count}</td>;
                  }
                })}
              </tr>
              <tr>
                <td>Value</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Cash_credits_Value}</td>;
                  }
                })}
              </tr>
              <tr>
                <td rowSpan={3}>Total Credits</td>
              </tr>
              <tr>
                <td>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Total_credits_Count}</td>;
                  }
                })}
              </tr>
              <tr>
                <td>Value</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Total_credits_Value}</td>;
                  }
                })}
              </tr>
              <tr>
                <td className="highlighted_headers" rowSpan={13}>
                  {" "}
                  Outflows
                </td>
              </tr>
              <tr>
                <td rowSpan={3}>Non Cash Debits</td>
              </tr>
              <tr>
                <td>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Non_cash_debits_Count}</td>;
                  }
                })}
              </tr>
              <tr>
                <td>Value</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Non_cash_debits_Value}</td>;
                  }
                })}
              </tr>
              <tr>
                <td rowSpan={3}>Cash Debits</td>
              </tr>
              <tr>
                <td>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Cash_debits_Count}</td>;
                  }
                })}
              </tr>
              <tr>
                <td>Value</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Cash_debits_Value}</td>;
                  }
                })}
              </tr>
              <tr>
                <td rowSpan={3}>Total Debits</td>
              </tr>
              <tr>
                <td>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Total_debits_Count}</td>;
                  }
                })}
              </tr>
              <tr>
                <td>Value</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Total_debits_Value}</td>;
                  }
                })}
              </tr>
              <tr>
                <td rowSpan={3}>Auto Debits</td>
              </tr>
              <tr>
                <td>Count</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Auto_debits_Count}</td>;
                  }
                })}
              </tr>
              <tr>
                <td>Value</td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Auto_debits_Value}</td>;
                  }
                })}
              </tr>
              <tr>
                <td className="highlighted_headers" colSpan={3}>
                  Max Credit Amount
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td>
                        <button
                          className="button_monthwise"
                          onClick={() => {
                            openWindow("credit", item.Max_credit_Amount);
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
                <td className="highlighted_headers" colSpan={3}>
                  Max Debit Amount
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td>
                        <button className="button_monthwise">
                          {item.Max_debit_Amount}
                        </button>
                      </td>
                    );
                  }
                })}
              </tr>
              <tr>
                <td className="highlighted_headers" colSpan={3}>
                  Average Balance
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Average_balance}</td>;
                  }
                })}
              </tr>
              <tr>
                <td className="highlighted_headers" colSpan={3}>
                  Month End Balance
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.Month_End_balance}</td>;
                  }
                })}
              </tr>
              <tr>
                <td className="highlighted_headers" colSpan={3}>
                  Net Inflow Amount
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return <TableCell value={item.Net_Inflow_Amount} />;
                  }
                })}
              </tr>
              <tr>
                <td className="highlighted_headers" colSpan={3}>
                  EMI
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.EMI}</td>;
                  }
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {optbank && (
        <div>
          <span>
            <img
              className="graph_monthwise"
              src="./staticfiles/bcmk_fig.png"
              alt="graph1"
            ></img>
            <img
              className="graph_monthwise"
              src="./staticfiles/bcmk_fig_1.png"
              alt="graph2"
            ></img>
          </span>
        </div>
      )}
    </div>
  );
};
export default AnalyzeBankMonthWise;