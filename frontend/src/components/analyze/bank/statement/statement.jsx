import React, { useEffect, useState } from "react";
import NavBar from "../../../../utilities/navbar/navbar";
import { postApi } from "../../../../callapi";
import "./statement.css";
import { APIADDRESS } from "../../../../constants/constants";
import { Loader } from "rsuite";
const AnalyzeStatement = (leadID) => {
  const [table, setTable] = useState();
  useEffect(() => {
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      setTable(res[0]["data"][0]);
    });
  }, []);

  const fetchvariables = () => {
    console.log("called");
    const txn_from = document?.getElementById("txn_date_from").value;
    const txn_to = document?.getElementById("txn_date_to").value;
    const debit_from = document?.getElementById("debit_amount_from").value;
    const debit_to = document?.getElementById("debit_amount_to").value;
    const credit_from = document?.getElementById("credit_amount_from").value;
    const credit_to = document?.getElementById("credit_amount_to").value;
    const closing_bal_from = document?.getElementById(
      "closing_balance_amount_from"
    ).value;
    const closing_bal_to = document?.getElementById(
      "closing_balance_amount_to"
    ).value;
    console.log(debit_from);
    console.log(txn_from);
  };

  const getData = (accountNumber) => {};

  return (
    <div>
      <NavBar></NavBar>

      <div>
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
      </div>
      <div className="filter_element_div_block">
        <div className="filter_element">
          <h6>Transaction Date</h6>
          <span>From</span>
          <input type="date" id="txn_date_from"></input>
          <span>To</span>
          <input type="date" id="txn_date_to"></input>
        </div>
        <div className="filter_element">
          <h6>Debited Amount</h6>
          <span>From</span>
          <input type="text" id="debit_amount_from"></input>
          <span>To</span>
          <input type="text" id="debit_amount_to"></input>
        </div>

        <div className="filter_element">
          <h6>Credited Amount</h6>
          <span>From</span>
          <input type="text" id="credit_amount_from"></input>
          <span>To</span>
          <input type="text" id="credit_amount_to"></input>
        </div>

        <div className="filter_element">
          <h6>Closing Balance Amount</h6>
          <span>From</span>
          <input type="text" id="closing_balance_amount_from"></input>
          <span>To</span>
          <input type="text" id="closing_balance_amount_to"></input>
        </div>
        <br></br>
        <div className="submit_statement">
          <button
            className="button_statement"
            onClick={() => {
              fetchvariables();
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
export default AnalyzeStatement;
