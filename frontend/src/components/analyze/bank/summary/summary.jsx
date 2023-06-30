import React, { useEffect, useState } from "react";
import { getApi, postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";
import NavBar from "../../../../utilities/navbar/navbar";
import SELECTBANKCUSTOMER from "../../../../utilities/selectBankCustomer/selectBankCustomer";
import { Loader } from "rsuite";

const NumberWithRupees = ({ value }) => {
  // Convert the value to a numeric format
  const numericValue = parseFloat(value);

  // Check if the value is valid and not NaN
  if (!isNaN(numericValue)) {
    // Format the value with rupees sign and thousands separator
    const formattedValue = numericValue.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
    });

    return <span>{formattedValue}</span>;
  }

  // Return the original value if it's not a valid number
  return <span>{value}</span>;
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
          <tbody style={{ border: "2px solid black" }}>
            {data.map((item, i) => {
              return (
                <tr key={i}>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.txn_date}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.description}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
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

const AnalyzeBankSummary = ({ setUser }) => {
  setUser(localStorage.getItem("user"));

  var [table, setTable] = useState();
  var [info, setInfo] = useState();
  const [acc_number, setacc_number] = useState();
  const [popupData, setPopUpData] = useState();
  const [buttonClicked, setbuttonClicked] = useState("closed");
  const [pagestate, setpagestate] = useState();
  const [src, setSrc] = useState();
  const [src2, setSrc2] = useState();
  var Amount_pop_up = 0;

  useEffect(() => {
    var statementsArray = [];
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      console.log(res);
      setTable(res[0]["data"][0]);
    });
  }, []);

  const getData = (accountNumber) => {
    setacc_number(accountNumber);
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
      optbank: accountNumber,
    }).then((res) => {
      console.log(res);
      setInfo(res);
      setSrc(
        "./staticfiles/" + String(accountNumber) + "closing-balance-trend.png"
      );
      setSrc2("./staticfiles/" + String(accountNumber) + "feq-mode-txn.png");
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
  console.log(info);
  console.log(table);

  //function to put space after rupee symbol

  return (
    <div>
      <NavBar></NavBar>

      <div className="div_table1_monthwise">
        {table ? (
          <table className="table1_monthwise">
            <thead className="thead_table1_monthwise">
              <tr>
                <th rowSpan={2}>Account Number</th>
                <th rowSpan={2}>Bank Name </th>
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
        style={{ marginTop: "2%", marginBottom: "2%" }}
        className="smallTableUpload"
      >
        <table
          style={{
            width: "45%",
            textAlign: "center",
            marginLeft: "27%",
            borderCollapse: "collapse",
            border: "none",
          }}
          className="tableSmallTableUpload"
        >
          <thead>
            <tr>
              <th
                style={{
                  width: "150px",
                  background: "#e0e0e0",
                  borderCollapse: "collapse",
                  border: "none",
                }}
                className="width_customised"
              >
                Statement Duration
              </th>
              <th
                style={{
                  width: "150px",
                  background: "#e0e0e0",
                  borderCollapse: "collapse",
                  border: "none",
                }}
                className="width_customised"
              >
                {info?.data[0].from_date}
              </th>
              <th
                style={{
                  width: "150px",
                  background: "#e0e0e0",
                  borderCollapse: "collapse",
                  border: "none",
                }}
                className="width_customised"
              >
                To
              </th>
              <th
                style={{
                  width: "150px",
                  background: "#e0e0e0",
                  borderCollapse: "collapse",
                  border: "none",
                }}
                className="width_customised"
              >
                {info?.data[0].to_date}
              </th>
            </tr>
          </thead>
          <tbody style={{ fontWeight: "bold" }}>
            <tr>
              <td
                style={{
                  width: "150px",
                  background: "#f0f0f0",
                  borderCollapse: "collapse",
                  border: "none",
                }}
                className="width_customised"
              >
                Balance
              </td>
              <td
                style={{
                  width: "150px",
                  background: "#f0f0f0",
                  borderCollapse: "collapse",
                  border: "none",
                }}
                className="width_customised"
              >
                {info?.data5.Opening_Balance}
              </td>
              <td
                style={{
                  width: "150px",
                  background: "#f0f0f0",
                  borderCollapse: "collapse",
                  border: "none",
                }}
                className="width_customised"
              >
                -
              </td>
              <td
                style={{
                  width: "150px",
                  background: "#f0f0f0",
                  borderCollapse: "collapse",
                  border: "none",
                }}
                className="width_customised"
              >
                {info?.data5.Closing_Balance}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* <div
        style={{ paddingTop: "2em", paddingLeft: "12em", paddingRight: "12em" }}
      >
        <div
          style={{
            marginLeft: "8%",
            width: "80%",
            backgroundColor: "#f0f0f0",
            padding: "2px",
            display: "flex",
            color: "black",
            justifyContent: "space-between",
          }}
        >
          <span style={{ marginLeft: "10px" }}>Statement Duration</span>

          <span>{info?.data[0].from_date}</span>
          <span>To</span>
          <span style={{ marginRight: "10px" }}>{info?.data[0].to_date}</span>
        </div>
        <div
          style={{
            marginLeft: "8%",
            width: "80%",
            backgroundColor: "#e0e0e0",
            padding: "1px",
            display: "flex",
            color: "black",
            justifyContent: "space-between",
          }}
        >
          <span style={{ marginLeft: "10px" }}>Balance</span>
          <span style={{ marginLeft: "63px" }}>
            {info?.data5.Opening_Balance}
          </span>
          <span style={{ marginLeft: "18px" }}>-</span>
          <span style={{ marginRight: "10px" }}>
            {info?.data5.Closing_Balance}
          </span>
        </div>
      </div> */}
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
                  src={src}
                  alt="graph1"
                  style={{ width: "100%" }}
                ></img>

                <img
                  className="graph_monthwise"
                  src={src2}
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
                  <td style={{ textAlign: "right" }}>
                    {info.data1.Average_Monthly_Balance}
                  </td>
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
                  <td style={{ textAlign: "right" }}>
                    {info.data1.Average_Monthly_Debit}{" "}
                  </td>
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
                  <td style={{ textAlign: "right" }}>
                    {info.data1.Average_Monthly_Credit}{" "}
                  </td>
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
                  <td style={{ textAlign: "right" }}>
                    {info.data1.Maximum_Balance}{" "}
                  </td>
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
                  <td style={{ textAlign: "right" }}>
                    {info.data1.Minimum_Balance}{" "}
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
                    Ratio Debit Credit
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {info.data3.Ratio_Debit_Credit}
                  </td>
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
                  <td style={{ textAlign: "right" }}>
                    {info.data3.Ratio_Cash_Total_Credit}{" "}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Lowest Credit Amount
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {info.data3.Lowest_Debit_Amount}{" "}
                  </td>
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
                  <td style={{ textAlign: "right" }}>
                    <button
                      style={{
                        color: "blue",
                        background: "transparent",
                        border: "none",
                        padding: "0",
                        margin: "0",
                      }}
                      onClick={() => {
                        setbuttonClicked("open");

                        openWindow("debit", info.data3.Lowest_Debit_Amount_Org);
                      }}
                    >
                      {"₹ "} {info.data3.Lowest_Debit_Amount_Org}
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

                        openWindow(
                          "min_amt_chq_bounce",
                          info.data4.Min_Amt_Chq_Bounce
                        );
                      }}
                    >
                      {info.data4.Min_Amt_Chq_Bounce
                        ? info.data4.Min_Amt_Chq_Bounce
                        : "N/A"}{" "}
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

                        openWindow(
                          "latest_chq_bounce",
                          info.data4.Latest_Chq_Bounce
                        );
                      }}
                    >
                      {info.data4.Latest_Chq_Bounce.length > 0 ? (
                        // ? "₹ " + info.data4.Latest_Chq_Bounce
                        <NumberWithRupees
                          value={info.data4.Latest_Chq_Bounce}
                        />
                      ) : (
                        "N/A"
                      )}{" "}
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
                  <td style={{ textAlign: "right" }}>
                    {info.data4.Days_with_bal_0_neg}{" "}
                  </td>
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

                        openWindow("charges", info.data4.Num_Charges_Levied);
                      }}
                    >
                      {info.data4.Num_Charges_Levied
                        ? info.data4.Num_Charges_Levied
                        : "N/A"}{" "}
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
