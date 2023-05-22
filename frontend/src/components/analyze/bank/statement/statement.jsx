import React, { useEffect, useState } from "react";
import NavBar from "../../../../utilities/navbar/navbar";
import { postApi } from "../../../../callapi";
import "./statement.css";
import { APIADDRESS } from "../../../../constants/constants";
import { Loader } from "rsuite";
const AnalyzeStatement = (leadID) => {
  const [table, setTable] = useState();
  const [table1, settable1] = useState();
  const [table2, settable2] = useState();

  useEffect(() => {
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      setTable(res[0]["data"][0]);
    });
  }, []);

  const fetchvariables = () => {
    // console.log("called_submit");
    const dataDuplicate = table2;
    const convertedData = dataDuplicate.map((item) => {
      const [day, month, year] = item.txn_date.split("/");
      const convertedDate = `${year}-${month}-${day}`;
      return { ...item, txn_date: convertedDate };
    });
    // console.log(convertedData);
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

    const parts_from = txn_from.split("/");

    const parts_to = txn_to.split("/");
    console.log(parts_to[0]);
    console.log(parts_from[0]);

    const filteredData = [];

    if (txn_from && txn_to) {
      for (let item of convertedData) {
        // console.log(item);
        if (item.txn_date >= parts_from[0] && item.txn_date <= parts_to[0]) {
          console.log("ok");
          filteredData.push(item);
        }
      }
      console.log(filteredData);
      const convertedDataFinal = filteredData.map((item) => {
        const [year, month, day] = item.txn_date.split("-");
        const convertedDate = `${day}/${month}/${year}`;
        return { ...item, txn_date: convertedDate };
      });
      console.log(convertedDataFinal);
      settable1(convertedDataFinal);
    }
  };

  const getData = (accountNumber) => {
    console.log("called");
    postApi("analyze/" + APIADDRESS.ANALYZESTATEMENTS, {
      leadID: localStorage.getItem("leadID"),
      account_number: accountNumber,
    }).then((res) => {
      console.log(res);
      settable1(res[0]);
      settable2(res[0]);
    });
  };

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

      {table1 && (
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
      )}
      {table1 && (
        <div className="div_table1_monthwise">
          <table className="table1_monthwise">
            <thead className="thead_table1_monthwise">
              <tr>
                <th>Transaction Date</th>
                <th>Description</th>
                <th>Cheque number</th>
                <th>Credit</th>
                <th>Debit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {table1 && (
                <>
                  {table1?.map((item, i) => {
                    return (
                      <tr key={i}>
                        <td>{item.txn_date}</td>
                        <td>{item.description}</td>
                        <td>{item.cheque_number}</td>
                        <td>{item.credit}</td>
                        <td>{item.debit}</td>
                        <td>{item.balance}</td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AnalyzeStatement;
