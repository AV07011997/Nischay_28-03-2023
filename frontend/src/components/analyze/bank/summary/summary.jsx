import React, { useEffect, useState } from "react";
import { getApi, postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";
import NavBar from "../../../../utilities/navbar/navbar";
import SELECTBANKCUSTOMER from "../../../../utilities/selectBankCustomer/selectBankCustomer";
import { Loader } from "rsuite";

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

const AnalyzeBankSummary = (leadID) => {
  var [table, setTable] = useState();
  var [info, setInfo] = useState();
  const [acc_number, setacc_number] = useState();
  const [popupData, setPopUpData] = useState();
  const [buttonClicked, setbuttonClicked] = useState("closed");
  const [pagestate, setpagestate] = useState();
  var Amount_pop_up = 0;

  useEffect(() => {
    var statementsArray = [];
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      console.log(res);
      // const temp = JSON.parse(res)[0].data;
      // //   console.log(temp);
      // temp.forEach((element) => {
      //   if (element[0] != null) {
      //     statementsArray.push(element[0]);
      //   }
      // });
      setTable(res[0]["data"][0]);
    });
  }, []);
  console.log(table);

  const getData = (accountNumber) => {
    setacc_number(accountNumber);
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
      optbank: accountNumber,
    }).then((res) => {
      console.log(res);
      setInfo(res);
    });
    setpagestate("0");
  };

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
  console.log(info);

  return (
    <div>
      <NavBar></NavBar>

      <div className="div_table1_monthwise">
        {table ? (
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
              {table?.map((item, i) => {
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
                                getData(item.account_number);
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
      <div
        style={{ paddingTop: "2em", paddingLeft: "12em", paddingRight: "12em" }}
      >
        <div
          style={{
            backgroundColor: "#f0f0f0",
            padding: "2px",
            display: "flex",
            justifyContent: "space-evenly",
          }}
        >
          <span>Statement Duration</span>

          <span>{info?.data[0].from_date}</span>
          <span>TO</span>
          <span>{info?.data[0].to_date}</span>
        </div>
        <div
          style={{
            backgroundColor: "#e0e0e0",
            padding: "2px",
            display: "flex",
            justifyContent: "space-evenly",
          }}
        >
          <span>Opening Balance</span>
          <span>{info?.data5.Opening_Balance}</span>
          <span>-</span>
          <span>{info?.data5.Closing_Balance}</span>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div style={{ width: "65%" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              paddingLeft: "3em",
              width: "100%",
            }}
          >
            {info && (
              <div>
                <img
                  className="graph_monthwise"
                  src="./staticfiles/closing-balance-trend.png"
                  alt="graph1"
                  style={{ width: "100%" }}
                ></img>

                <img
                  className="graph_monthwise"
                  src="./staticfiles/feq-mode-txn.png"
                  alt="graph1"
                  style={{ width: "100%" }}
                ></img>
              </div>
            )}
          </div>
        </div>
        <div style={{ color: "black" }}>
          <table style={{ marginTop: "4em", width: "100%" }}>
            {info && (
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Average Monthly Balance
                  </td>
                  <td>{info.data1.Average_Monthly_Balance}</td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Average Monthly Debit
                  </td>
                  <td>{info.data1.Average_Monthly_Debit} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Average Monthly Credit
                  </td>
                  <td>{info.data1.Average_Monthly_Credit} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Maximum Balance
                  </td>
                  <td>{info.data1.Maximum_Balance} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Minimum Balance
                  </td>
                  <td>{info.data1.Minimum_Balance} </td>
                </tr>
              </tbody>
            )}
          </table>

          <table style={{ marginTop: "4em", width: "100%" }}>
            {info && (
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Ratio Debit Credit
                  </td>
                  <td>{info.data3.Ratio_Debit_Credit}</td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Ratio Cash Total Credit
                  </td>
                  <td>{info.data3.Ratio_Cash_Total_Credit} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Lowest Debit Amount
                  </td>
                  <td>{info.data3.Lowest_Debit_Amount} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Highest Credit Amount
                  </td>
                  <td>
                    <button
                      className="button_monthwise"
                      onClick={() => {
                        setbuttonClicked("open");

                        openWindow("credit", info.data3.Highest_Credit_Amount);
                      }}
                    >
                      {info.data3.Highest_Credit_Amount}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Lowest Debit Amount
                  </td>
                  <td>
                    <button
                      className="button_monthwise"
                      onClick={() => {
                        setbuttonClicked("open");

                        openWindow("debit", info.data3.Lowest_Debit_Amount_Org);
                      }}
                    >
                      {info.data3.Lowest_Debit_Amount_Org}
                    </button>
                  </td>
                </tr>
              </tbody>
            )}
          </table>

          <table style={{ marginTop: "4em", width: "100%" }}>
            {info && (
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Number of Cheque Bounce
                  </td>
                  <td>
                    <button
                      className="button_monthwise"
                      onClick={() => {
                        setbuttonClicked("open");

                        openWindow("Bounced", info.data4.Num_Chq_Bounce);
                      }}
                    >
                      {info.data4.Num_Chq_Bounce}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Minimum Amount Cheque Bounce
                  </td>
                  <td>
                    <button
                      className="button_monthwise"
                      onClick={() => {
                        setbuttonClicked("open");

                        openWindow(
                          "min_amt_chq_bounce",
                          info.data4.Min_Amt_Chq_Bounce
                        );
                      }}
                    >
                      {info.data4.Min_Amt_Chq_Bounce
                        ? info.data4.Min_Amt_Chq_Bounce
                        : "None"}{" "}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Latest Cheque Bounce
                  </td>
                  <td>
                    <button
                      className="button_monthwise"
                      onClick={() => {
                        setbuttonClicked("open");

                        openWindow(
                          "latest_chq_bounce",
                          info.data4.Latest_Chq_Bounce
                        );
                      }}
                    >
                      {info.data4.Latest_Chq_Bounce.length > 0
                        ? info.data4.Latest_Chq_Bounce
                        : "None"}{" "}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Entries with Zero or Negative Balance
                  </td>
                  <td>
                    <button
                      className="button_monthwise"
                      onClick={() => {
                        setbuttonClicked("open");

                        openWindow(
                          "negative_balance",
                          info.data4.Entries_Zero_Neg_Bal
                        );
                      }}
                    >
                      {info.data4.Entries_Zero_Neg_Bal}
                    </button>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Days with balance 0 or negative.
                  </td>
                  <td>{info.data4.Days_with_bal_0_neg} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Number of Charges Levied
                  </td>

                  <td>
                    <button
                      className="button_monthwise"
                      onClick={() => {
                        setbuttonClicked("open");

                        openWindow("charges", info.data4.Num_Charges_Levied);
                      }}
                    >
                      {info.data4.Num_Charges_Levied
                        ? info.data4.Num_Charges_Levied
                        : "None"}{" "}
                    </button>
                  </td>
                </tr>
              </tbody>
            )}
          </table>

          {/* <table style={{ marginTop: "4em", width: "100%" }}>
            {info && (
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Num_Credit_Tnx
                  </td>
                  <td>{info.data2.Num_Credit_Tnx}</td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Num_Debit_Tnx
                  </td>
                  <td>{info.data2.Num_Debit_Tnx} </td>
                </tr>
              </tbody>
            )}
          </table> */}
        </div>
      </div>
    </div>
  );
};
export default AnalyzeBankSummary;
