import React, { useEffect, useState } from "react";
import NavBar from "../../../../utilities/navbar/navbar";
import { postApi } from "../../../../callapi";
import "./statement.css";
import { APIADDRESS } from "../../../../constants/constants";
import { Loader } from "rsuite";
import { useRef } from "react";
import { toast } from "react-toastify";

const AnalyzeStatement = ({ setUser }) => {
  setUser(localStorage.getItem("user"));

  const [table, setTable] = useState();
  const [table1, settable1] = useState();
  const [table2, settable2] = useState();
  const [from, setfrom] = useState();
  const [to, setto] = useState();

  const debitFromInputRef = useRef(null);
  const debitToInputRef = useRef(null);
  var txnFromInputRef = useRef("");
  var txnToInputRef = useRef("");
  const creditFromInputRef = useRef(null);
  const creditToInputRef = useRef(null);
  const balFromInputRef = useRef(null);
  const balToInputRef = useRef(null);

  const resetForm = () => {
    debitFromInputRef.current.value = ""; // Resetting the input value directly
    debitToInputRef.current.value = ""; // Resetting the input value directly
    txnFromInputRef.current.value = fromFormatted; // Resetting the input value directly
    txnToInputRef.current.value = toFormatted; // Resetting the input value directly
    creditFromInputRef.current.value = ""; // Resetting the input value directly
    creditToInputRef.current.value = ""; // Resetting the input value directly
    balFromInputRef.current.value = ""; // Resetting the input value directly
    balToInputRef.current.value = ""; // Resetting the input value directly

    settable1(table2);
  };

  useEffect(() => {
    postApi("analyze/" + APIADDRESS.ANALYZEBANKSUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      setTable(res[0]["data"][0]);
    });
  }, []);

  function replaceDateFormat(text) {
    text = String(text);
    const pattern = /\b(\d{2})\/(\d{2})\/(\d{4})\b/g;
    const updatedText = text.replace(pattern, "$1-$2-$3");
    return updatedText;
  }

  const fetchvariables = () => {
    var txn_from = from;
    var txn_to = to;

    const dataDuplicate = table2;
    const convertedData = dataDuplicate?.map((item) => {
      const [day, month, year] = item.txn_date.split("/");
      const convertedDate = `${year}-${month}-${day}`;
      return { ...item, txn_date: convertedDate };
    });
    if (document.getElementById("txn_date_from").value) {
      txn_from = document.getElementById("txn_date_from").value;
    }
    if (document.getElementById("txn_date_to").value) {
      txn_to = document.getElementById("txn_date_to").value;
    }

    var debit_from = "0.0";
    if (document?.getElementById("debit_amount_from").value) {
      debit_from = document?.getElementById("debit_amount_from").value;
    }

    var debit_to = table2.reduce((max, obj) => {
      const debitValue = parseFloat(obj.debit.replace(/,/g, ""));
      return debitValue > max ? debitValue : max;
    }, -Infinity);

    if (document?.getElementById("debit_amount_to").value) {
      debit_to = document?.getElementById("debit_amount_to").value;
    }

    var credit_from = "0.0";
    if (document?.getElementById("credit_amount_from").value) {
      credit_from = document?.getElementById("credit_amount_from").value;
    }

    var credit_to = table2.reduce((max, obj) => {
      const creditValue = parseFloat(obj.credit.replace(/,/g, ""));
      return creditValue > max ? creditValue : max;
    }, -Infinity);

    if (document?.getElementById("credit_amount_to").value) {
      credit_to = document?.getElementById("credit_amount_to").value;
    }

    var closing_bal_from = table2.reduce((min, obj) => {
      const balanceValue = parseFloat(obj.balance.replace(/,/g, ""));
      return balanceValue < min ? balanceValue : min;
    }, Infinity);
    if (document?.getElementById("closing_balance_amount_from").value) {
      closing_bal_from = document?.getElementById(
        "closing_balance_amount_from"
      ).value;
    }

    var closing_bal_to = table2.reduce((max, obj) => {
      const balanceValue = parseFloat(obj.balance.replace(/,/g, ""));
      return balanceValue > max ? balanceValue : max;
    }, -Infinity);
    if (document?.getElementById("closing_balance_amount_to").value) {
      closing_bal_to = document?.getElementById(
        "closing_balance_amount_to"
      ).value;
    }

    var parts_from;

    if (txn_from.includes("/")) {
      parts_from = txn_from.split("/");
    } else {
      const [year, month, day] = txn_from.split("-");

      parts_from = [day.toString(), month.toString(), year.toString()];
    }

    // parts_from = parts_from.toString();
    // parts_from = parts_from.replace(/-/g, "/");
    // const newDateString = `${parts_from[0]}/${parts_from[1]}/${parts_from[2]}`;

    var parts_to;
    if (txn_to.includes("/")) {
      parts_to = txn_to.split("/");
    } else {
      const [year, month, day] = txn_to.split("-");

      parts_to = [
        (parseInt(day) + 1).toString(),
        month.toString(),
        year.toString(),
      ];
    }

    const filteredData = [];

    if (
      txn_from &&
      txn_to &&
      txn_from >= fromFormatted &&
      txn_to <= toFormatted
    ) {
      for (let item of convertedData) {
        const parts = item.txn_date.split("-");
        const formattedDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const actualDate = new Date(formattedDate);

        const formattedDateFrom = `${parts_from[0]}-${parts_from[1]}-${parts_from[2]}`;
        const dateArrayFrom = formattedDateFrom.split("-");
        const actualDateFrom = new Date(
          dateArrayFrom[2],
          dateArrayFrom[1] - 1,
          dateArrayFrom[0]
        );

        // const formattedDateTo = `${parts_to[0]}/${parts_to[1]}/${parts_to[2]}`;
        const formattedDateTo = `${parts_to[0]}-${parts_to[1]}-${parts_to[2]}`;
        const dateArrayTo = formattedDateTo.split("-");
        const actualDateTo = new Date(
          dateArrayTo[2],
          dateArrayTo[1] - 1,
          dateArrayTo[0]
        );

        if (actualDate >= actualDateFrom && actualDate <= actualDateTo) {
          filteredData.push(item);
        }
      }
      var convertedDataFinal = filteredData.map((item) => {
        const [year, month, day] = item.txn_date.split("-");
        const convertedDate = `${day}/${month}/${year}`;
        return { ...item, txn_date: convertedDate };
      });
      if (
        (document?.getElementById("debit_amount_from").value ||
          document?.getElementById("debit_amount_to").value) &&
        (document?.getElementById("credit_amount_from").value ||
          document?.getElementById("credit_amount_to").value) &&
        (document?.getElementById("closing_balance_amount_from").value ||
          document?.getElementById("closing_balance_amount_to").value)
      ) {
        const convertedDataFinalCredit = filterOnALL(
          debit_from,
          debit_to,
          credit_from,
          credit_to,
          closing_bal_from,
          closing_bal_to,
          convertedDataFinal
        );
        convertedDataFinal = convertedDataFinalCredit;
      } else if (
        (document?.getElementById("debit_amount_from").value ||
          document?.getElementById("debit_amount_to").value) &&
        (document?.getElementById("credit_amount_from").value ||
          document?.getElementById("credit_amount_to").value)
      ) {
        const convertedDataFinalCredit = filterCreditDebit(
          debit_from,
          debit_to,
          credit_from,
          credit_to,
          convertedDataFinal
        );
        convertedDataFinal = convertedDataFinalCredit;
      } else if (
        (document?.getElementById("debit_amount_from").value ||
          document?.getElementById("debit_amount_to").value) &&
        (document?.getElementById("closing_balance_amount_from").value ||
          document?.getElementById("closing_balance_amount_to").value)
      ) {
        const convertedDataFinalCredit = filterDebitBalance(
          debit_from,
          debit_to,
          closing_bal_from,
          closing_bal_to,
          convertedDataFinal
        );
        convertedDataFinal = convertedDataFinalCredit;
      } else if (
        (document?.getElementById("credit_amount_from").value ||
          document?.getElementById("credit_amount_to").value) &&
        (document?.getElementById("closing_balance_amount_from").value ||
          document?.getElementById("closing_balance_amount_to").value)
      ) {
        const convertedDataFinalCredit = filterCreditBalance(
          credit_from,
          credit_to,
          closing_bal_from,
          closing_bal_to,
          convertedDataFinal
        );
        convertedDataFinal = convertedDataFinalCredit;
      } else if (
        document?.getElementById("debit_amount_from").value ||
        document?.getElementById("debit_amount_to").value
      ) {
        const convertedDataFinalDebit = filterOnDebit(
          debit_from,
          debit_to,
          convertedDataFinal
        );
        convertedDataFinal = convertedDataFinalDebit;
      } else if (
        document?.getElementById("credit_amount_from").value ||
        document?.getElementById("credit_amount_to").value
      ) {
        const convertedDataFinalCredit = filterOnCredit(
          credit_from,
          credit_to,
          convertedDataFinal
        );
        convertedDataFinal = convertedDataFinalCredit;
      } else if (
        document?.getElementById("closing_balance_amount_from").value ||
        document?.getElementById("closing_balance_amount_to").value
      ) {
        const convertedDataFinalBalance = filterOnBalance(
          closing_bal_from,
          closing_bal_to,
          convertedDataFinal
        );
        convertedDataFinal = convertedDataFinalBalance;
      }

      settable1(convertedDataFinal);
    } else {
      // toast.error("Please select date in the range of transactions");
      window.alert("Please select date in the range of transactions");
    }
  };

  // ????????????????????????????????????????????????????????????????????????????????????????????????????????

  const setdate = (from, to) => {
    setfrom(from);
    setto(to);
  };

  const filterOnCredit = (credit_from, credit_to, data) => {
    const finalData = [];
    const from = parseFloat(credit_from);
    const to = parseFloat(credit_to);
    const tempData = data;

    tempData.forEach((element) => {
      if (
        parseFloat(element.credit.replace(/,/g, "")) > from &&
        parseFloat(element.credit.replace(/,/g, "")) <= to
        // ||
        // parseFloat(element.debit.replace(/,/g, "")) > 0
      ) {
        finalData.push(element);
      }
    });

    return finalData;
  };

  const filterOnDebit = (debitFrom, debitTo, data) => {
    const finalData = [];
    const from = parseFloat(debitFrom);
    const to = parseFloat(debitTo);
    const tempData = data;

    tempData.forEach((element) => {
      if (
        parseFloat(element.debit.replace(/,/g, "")) > from &&
        parseFloat(element.debit.replace(/,/g, "")) <= to
        // ||
        // parseFloat(element.credit.replace(/,/g, "")) > 0
      ) {
        finalData.push(element);
      }
    });
    return finalData;
  };
  const filterCreditDebit = (
    debitFrom,
    debitTo,
    creditfrom,
    creditto,
    data
  ) => {
    const finalData = [];
    const from = parseFloat(debitFrom);
    const to = parseFloat(debitTo);
    const from1 = parseFloat(creditfrom);
    const to1 = parseFloat(creditto);
    const tempData = data;

    tempData.forEach((element) => {
      if (
        (parseFloat(element.debit.replace(/,/g, "")) >= from &&
          parseFloat(element.debit.replace(/,/g, "")) <= to) ||
        (parseFloat(element.credit.replace(/,/g, "")) >= from1 &&
          parseFloat(element.credit.replace(/,/g, "")) <= to1)
        // ||
        // parseFloat(element.credit.replace(/,/g, "")) > 0
      ) {
        finalData.push(element);
      }
    });
    return finalData;
  };

  const filterDebitBalance = (
    debitFrom,
    debitTo,
    balancefrom,
    balanceto,
    data
  ) => {
    const finalData = [];
    const from = parseFloat(debitFrom);
    const to = parseFloat(debitTo);
    const from1 = parseFloat(balancefrom);
    const to1 = parseFloat(balanceto);
    const tempData = data;

    tempData.forEach((element) => {
      if (
        (parseFloat(element.debit.replace(/,/g, "")) >= from &&
          parseFloat(element.debit.replace(/,/g, "")) <= to) ||
        (parseFloat(element.balance.replace(/,/g, "")) >= from1 &&
          parseFloat(element.balance.replace(/,/g, "")) <= to1)
        // ||
        // parseFloat(element.credit.replace(/,/g, "")) > 0
      ) {
        finalData.push(element);
      }
    });
    // settable1(finalData);
    return finalData;
  };
  const filterCreditBalance = (
    CreditFrom,
    CreditTo,
    balancefrom,
    balanceto,
    data
  ) => {
    const finalData = [];
    const from = parseFloat(CreditFrom);
    const to = parseFloat(CreditTo);
    const from1 = parseFloat(balancefrom);
    const to1 = parseFloat(balanceto);
    const tempData = data;

    tempData.forEach((element) => {
      if (
        (parseFloat(element.credit.replace(/,/g, "")) >= from &&
          parseFloat(element.credit.replace(/,/g, "")) <= to) ||
        (parseFloat(element.balance.replace(/,/g, "")) >= from1 &&
          parseFloat(element.balance.replace(/,/g, "")) <= to1)
        // ||
        // parseFloat(element.credit.replace(/,/g, "")) > 0
      ) {
        finalData.push(element);
      }
    });
    // settable1(finalData);
    return finalData;
  };
  const filterOnALL = (
    debitFrom,
    debitTo,
    creditfrom,
    creditto,
    balfrom,
    balto,
    data
  ) => {
    const finalData = [];
    const from = parseFloat(debitFrom);
    const to = parseFloat(debitTo);
    const from1 = parseFloat(creditfrom);
    const to1 = parseFloat(creditto);
    const from2 = parseFloat(balfrom);
    const to2 = parseFloat(balto);
    const tempData = data;

    tempData.forEach((element) => {
      if (
        (parseFloat(element.debit.replace(/,/g, "")) >= from &&
          parseFloat(element.debit.replace(/,/g, "")) <= to) ||
        (parseFloat(element.credit.replace(/,/g, "")) >= from1 &&
          parseFloat(element.credit.replace(/,/g, "")) <= to1) ||
        (parseFloat(element.balance.replace(/,/g, "")) >= from2 &&
          parseFloat(element.balance.replace(/,/g, "")) <= to2)

        // ||
        // parseFloat(element.credit.replace(/,/g, "")) > 0
      ) {
        finalData.push(element);
      }
    });
    // settable1(finalData);
    return finalData;
  };
  const filterOnBalance = (balance_from, balance_to, data) => {
    const finalData = [];
    const from = parseFloat(balance_from);
    const to = parseFloat(balance_to);
    const tempData = data;

    tempData.forEach((element) => {
      if (
        parseFloat(element.balance.replace(/,/g, "")) >= from &&
        parseFloat(element.balance.replace(/,/g, "")) <= to
      ) {
        finalData.push(element);
      }
    });
    // settable1(finalData);
    return finalData;
  };

  const getData = (accountNumber, from, to) => {
    postApi("analyze/" + APIADDRESS.ANALYZESTATEMENTS, {
      leadID: localStorage.getItem("leadID"),
      account_number: accountNumber,
    }).then((res) => {
      settable1(res[0]);
      settable2(res[0]);
    });
  };

  useEffect(() => {
    if (table) {
      window.scrollTo({
        top: 260 + 30 * (table.length - 1), // Replace with the desired pixel height - 140*2 -140/4
        behavior: "smooth", // This enables smooth scrolling
      });
    }
  }, [table1]);

  const [fromFormatted, setfromFormatted] = useState();
  const [toFormatted, settoFormatted] = useState();

  console.log(from, to);

  useEffect(() => {
    if (from) {
      console.log(from);
      const [day, month, year] = from.split("/");

      setfromFormatted(`${year}-${month}-${day}`);
      const [day2, month2, year2] = to.split("/");

      settoFormatted(`${year2}-${month2}-${day2}`);
    }
  }, [from]);
  console.log(fromFormatted, toFormatted);

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
                                  setdate(item.from_date, item.to_date);
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
            <h6 style={{ marginLeft: "50px", marginBottom: "10px" }}>
              Transaction Date
            </h6>
            <span>From&nbsp;&nbsp;&nbsp;</span>
            <input
              style={{ width: "25.5%" }}
              type="date"
              id="txn_date_from"
              // defaultValue={fromFormatted}
              key={fromFormatted} // Add a key prop based on the fromFormatted variable
              defaultValue={fromFormatted}
              min={fromFormatted}
              max={toFormatted}
              ref={txnFromInputRef}
            ></input>
            <span>&nbsp;&nbsp;&nbsp;To&nbsp;&nbsp;&nbsp;</span>
            <input
              style={{ width: "25.5%" }}
              type="date"
              id="txn_date_to"
              key={toFormatted}
              defaultValue={toFormatted}
              ref={txnToInputRef}
              min={fromFormatted}
              max={toFormatted}
            ></input>
          </div>
          <div className="filter_element">
            <h6 style={{ marginLeft: "50px", marginBottom: "10px" }}>
              {" "}
              Debited Amount
            </h6>
            <span>From&nbsp;&nbsp;&nbsp;</span>
            <input
              type="text"
              id="debit_amount_from"
              ref={debitFromInputRef}
            ></input>
            <span>&nbsp;&nbsp;&nbsp;To&nbsp;&nbsp;&nbsp;</span>
            <input
              type="text"
              id="debit_amount_to"
              ref={debitToInputRef}
            ></input>
          </div>

          <div className="filter_element">
            <h6 style={{ marginLeft: "50px", marginBottom: "10px" }}>
              Credited Amount
            </h6>
            <span>From&nbsp;&nbsp;&nbsp;</span>
            <input
              type="text"
              id="credit_amount_from"
              ref={creditFromInputRef}
            ></input>
            <span>&nbsp;&nbsp;&nbsp;To&nbsp;&nbsp;&nbsp;</span>
            <input
              type="text"
              id="credit_amount_to"
              ref={creditToInputRef}
            ></input>
          </div>

          <div className="filter_element">
            <h6 style={{ marginLeft: "50px", marginBottom: "10px" }}>
              {" "}
              Closing Balance Amount
            </h6>
            <span>From&nbsp;&nbsp;&nbsp;</span>
            <input
              type="text"
              id="closing_balance_amount_from"
              ref={balFromInputRef}
            ></input>
            <span>&nbsp;&nbsp;&nbsp;To&nbsp;&nbsp;&nbsp;</span>
            <input
              type="text"
              id="closing_balance_amount_to"
              ref={balToInputRef}
            ></input>
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
          <div>
            <button
              // className="resetButton"
              className="custom-button"
              onClick={() => {
                resetForm();
              }}
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {table1 && (
        <div className="div_table1_monthwise">
          <table
            className="table1_monthwise"
            style={{
              width: "91%",
              marginLeft: "5%",
              overflowY: "auto",
              height: "700px",
            }}
          >
            <thead className="thead_table1_monthwise">
              <tr style={{ position: "sticky", top: "0", background: "black" }}>
                <th>Transaction Date</th>
                <th>Description</th>
                <th>Cheque Number</th>
                <th>Credit{" (₹)"}</th>
                <th>Debit{" (₹)"}</th>
                <th>Balance{" (₹)"}</th>
              </tr>
            </thead>
            <tbody>
              {table1 && (
                <>
                  {table1?.map((item, i) => {
                    return (
                      <tr key={i}>
                        <td>{item.txn_date}</td>
                        <td style={{ textAlign: "left" }}>
                          {item.description}
                        </td>
                        <td>{item.cheque_number}</td>
                        <td style={{ textAlign: "right" }}>{item.credit}</td>
                        <td style={{ textAlign: "right" }}>{item.debit}</td>
                        <td style={{ textAlign: "right" }}>{item.balance}</td>
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
