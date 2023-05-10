import React, { useEffect, useState } from "react";
import { getApi, postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";
import NavBar from "../../../../utilities/navbar/navbar";
import SELECTBANKCUSTOMER from "../../../../utilities/selectBankCustomer/selectBankCustomer";
import { Loader } from "rsuite";

const AnalyzeBankSummary = (leadID) => {
  var [table, setTable] = useState();
  var [info, setInfo] = useState();

  const keyArrays = (object) => {
    return Object.keys(object);
  };
  useEffect(() => {
    var statementsArray = [];
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      const temp = JSON.parse(res)[0].data;
      //   console.log(temp);
      temp.forEach((element) => {
        if (element[0] != null) {
          statementsArray.push(element[0]);
        }
      });
      setTable(statementsArray);
    });
  }, []);

  const getData = (accountNumber) => {
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
      optbank: accountNumber,
    }).then((res) => {
      console.log(res);
    });
  };

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
        </div>
        <div>
          <table style={{ marginTop: "4em" }}>
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

          <table style={{ marginTop: "4em" }}>
            {info && (
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Ratio_Debit_Credit
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
                    Ratio_Cash_Total_Credit
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
                    ALowest_Debit_Amount
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
                    Highest_Credit_Amount
                  </td>
                  <td>{info.data3.Highest_Credit_Amount} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Lowest_Debit_Amount_Org
                  </td>
                  <td>{info.data3.Lowest_Debit_Amount_Org} </td>
                </tr>
              </tbody>
            )}
          </table>

          <table style={{ marginTop: "4em" }}>
            {info && (
              <tbody>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Num_Chq_Bounce
                  </td>
                  <td>{info.data4.Num_Chq_Bounce}</td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Min_Amt_Chq_Bounce
                  </td>
                  <td>{info.data4.Min_Amt_Chq_Bounce} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Latest_Chq_Bounce
                  </td>
                  <td>{info.data4.Latest_Chq_Bounce} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Entries_Zero_Neg_Bal
                  </td>
                  <td>{info.data4.Entries_Zero_Neg_Bal} </td>
                </tr>
                <tr>
                  <td
                    style={{
                      width: "16em",
                      height: "3em",
                    }}
                  >
                    Days_with_bal_0_neg
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
                    Num_Charges_Levied
                  </td>
                  <td>
                    {info.data4.Num_Charges_Levied
                      ? info.data4.Num_Charges_Levied
                      : "None"}{" "}
                  </td>
                </tr>
              </tbody>
            )}
          </table>

          <table style={{ marginTop: "4em" }}>
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
          </table>
        </div>
      </div>
    </div>
  );
};
export default AnalyzeBankSummary;
