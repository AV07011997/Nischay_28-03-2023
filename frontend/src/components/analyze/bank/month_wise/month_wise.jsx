import React, { useEffect, useState } from "react";
import { getApi, postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";
import NavBar from "../../../../utilities/navbar/navbar";
import { Loader, Navbar } from "rsuite";
import "./month_wise.css";
// import ReactDOM from "react-dom";
import SELECTBANKCUSTOMER from "../../../../utilities/selectBankCustomer/selectBankCustomer";

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
        <table style={{ border: "2px solid black" }}>
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
          <tbody style={{ border: "2px solid black" }}>
            {data.map((item, i) => {
              return (
                <tr key={i}>
                  <td style={{ padding: "10px" }}>{item.txn_date}</td>
                  <td style={{ padding: "10px" }}>{item.description}</td>
                  <td style={{ padding: "10px" }}>{item.debit}</td>
                  <td style={{ padding: "10px" }}>{item.credit}</td>
                  <td style={{ padding: "10px" }}>{item.balance}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const AnalyzeBankMonthWise = (props) => {
  var [table1, settable1] = useState();
  var [optbank, setoptbank] = useState();
  const [acc_number, setacc_number] = useState();
  const [popupData, setPopUpData] = useState();
  const [buttonClicked, setbuttonClicked] = useState("closed");
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
    return <td style={{ color }}>{value}</td>;
  }

  const tablesubheaders = ["", "", "From", "To"];

  console.log(localStorage.getItem("leadID"));

  function handledata(data, acc_number) {
    console.log(acc_number);
    setacc_number(acc_number);
    setoptbank(data);
  }

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

  return (
    <div>
      <NavBar></NavBar>

      <SELECTBANKCUSTOMER
        onData={handledata}
        apiaddress={APIADDRESS.ANALYZEBANKMONTHWISE}
      ></SELECTBANKCUSTOMER>

      {optbank && (
        <div className="div_table1_monthwise">
          <table className="table1_monthwise">
            <thead className="thead_table1_monthwise">
              <tr>
                <th colSpan={3}></th>
                {optbank.map((item) => {
                  if (item) {
                    return <td>{item.month_year}</td>;
                  }
                })}
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
                <td className="highlighted_headers" colSpan={3}>
                  Max Debit Amount
                </td>
                {optbank.map((item) => {
                  if (item) {
                    return (
                      <td>
                        <button
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
