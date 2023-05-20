import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import NavBar from "../../../../utilities/navbar/navbar";
import { APIADDRESS } from "../../../../constants/constants";
import SELECTBANKCUSTOMER from "../../../../utilities/selectBankCustomer/selectBankCustomer";
import "./counterparties.css";
import { postApi } from "../../../../callapi";

function PopUpComponent(props) {
  const { data } = props;
  console.log(data);
  const headers = [
    "Transaction Date",
    "Description",
    "Debit",
    "Credit",
    "Balance",
    "Cheque no",
    "Entity",
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
                  <td style={{ padding: "10px" }}>{item.cheque_number}</td>
                  <td style={{ padding: "10px" }}>{item.entity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ANALYZECOUNTERPARTIES = (props) => {
  var [optbank, setoptbank] = useState();
  var [optbank2, setoptbank2] = useState();
  const [pagestate, setpagestate] = useState(0);
  const [buttonClicked, setbuttonClicked] = useState("closed");

  const [acc_number, setacc_number] = useState();
  const [popupData, setPopUpData] = useState();
  const [sortKey, setSortKey] = useState();

  function handledata(data, acc_number) {
    setacc_number(acc_number);
    setoptbank(data);
    setoptbank2(data);
  }

  const mainHeader = [
    { header: "", col_span: 1 },
    { header: "Transaction", col_span: 2 },
    { header: "Number of transactions", col_span: 2 },
    { header: "Debited amount", col_span: 4 },
    { header: "Credited amount", col_span: 4 },
  ];

  const sub_headers = [
    { variable: "entity", column_name: "Entity" },
    { variable: "latest_txn", column_name: "From" },
    { variable: "oldest_txn", column_name: "To" },
    { variable: "debits", column_name: "Dr" },
    { variable: "credits", column_name: "Cr" },
    { variable: "debited_amt_total", column_name: "Total" },
    { variable: "debited_amt_mthly", column_name: "Average" },
    { variable: "min_debit", column_name: "Min" },
    { variable: "max_debit", column_name: "Max" },
    { variable: "credited_amt_total", column_name: "Total" },
    { variable: "credited_amt_mthly", column_name: "Average" },
    { variable: "min_credit", column_name: "Min" },
    { variable: "max_credit", column_name: "Max" },
  ];

  function convertDateStringToDate(dateString) {
    const dateParts = dateString.split("/");
    const formattedDate = new Date(
      dateParts[2],
      dateParts[0] - 1,
      dateParts[1]
    );
    return formattedDate;
  }

  const filterData = (sortVariable, index) => {
    const databackup = optbank2;
    // Comparator function for sorting in ascending order

    console.log(databackup);
    if (index >= 5) {
      if (pagestate % 2 == 0) {
        databackup.sort((a, b) => {
          let valueA = parseInt(a[sortVariable].replace(/[^0-9]/g, ""));
          let valueB = parseInt(b[sortVariable].replace(/[^0-9]/g, ""));
          return valueA - valueB;
        });
        setoptbank(databackup);
      } else if (pagestate % 2 != 0) {
        databackup.sort((a, b) => {
          let valueA = parseInt(a[sortVariable].replace(/[^0-9]/g, ""));
          let valueB = parseInt(b[sortVariable].replace(/[^0-9]/g, ""));
          return valueB - valueA;
        });
        setoptbank(databackup);
      }

      // databackup.sort((a, b) => {
      //   let valueA = parseInt(a[sortVariable].replace(/[^0-9]/g, ""));
      //   let valueB = parseInt(b[sortVariable].replace(/[^0-9]/g, ""));
      //   return valueA - valueB;
      // });
      // setoptbank(databackup);
    }

    if (index === 3 || index === 4) {
      console.log("1");
      if (pagestate % 2 == 0) {
        setoptbank(
          databackup?.sort((a, b) => b[sortVariable] - a[sortVariable])
        );
      } else if (pagestate % 2 != 0) {
        setoptbank(
          databackup?.sort((a, b) => a[sortVariable] - b[sortVariable])
        );
      }
    }

    if (index === 0) {
      // console.log("2");

      if (pagestate % 2 === 0) {
        setoptbank(
          databackup.sort((a, b) =>
            b[sortVariable].localeCompare(a[sortVariable])
          )
        );
      } else if (pagestate % 2 != 0) {
        setoptbank(
          databackup.sort((a, b) =>
            a[sortVariable].localeCompare(b[sortVariable])
          )
        );
      }
    }

    if (index === 1 || index === 2) {
      if (pagestate % 2 == 0) {
        databackup.sort((a, b) => {
          if (!a[sortVariable]) return 1; // Move null, undefined, and empty string to the end
          if (!b[sortVariable]) return -1; // Move null, undefined, and empty string to the end

          const [dayA, monthA, yearA] = a[sortVariable].split("/");
          const [dayB, monthB, yearB] = b[sortVariable].split("/");

          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);

          if (isNaN(dateA)) return 1; // Move invalid date strings to the end
          if (isNaN(dateB)) return -1; // Move invalid date strings to the end

          return dateA - dateB;
        });
        setoptbank(databackup);
      } else if (pagestate % 2 != 0) {
        databackup.sort((a, b) => {
          if (!a[sortVariable]) return 1; // Move null, undefined, and empty string to the end
          if (!b[sortVariable]) return -1; // Move null, undefined, and empty string to the end

          const [dayA, monthA, yearA] = a[sortVariable].split("/");
          const [dayB, monthB, yearB] = b[sortVariable].split("/");

          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);

          if (isNaN(dateA)) return 1; // Move invalid date strings to the end
          if (isNaN(dateB)) return -1; // Move invalid date strings to the end

          return dateB - dateA;
        });
        setoptbank(databackup);
      }
    }

    setpagestate(pagestate + 1);
  };

  function openWindow(entity) {
    const getPopUpData = async () => {
      console.log("hello");
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZECOUNTERPARTIESPOPUP,
        {
          entity: entity,
          leadID: localStorage.getItem("leadID"),
          account_number: acc_number,
        }
      );
      console.log(response);
      setPopUpData(response);
    };

    getPopUpData();
  }

  useEffect(() => {
    console.log("called");
    console.log(popupData);
    console.log(buttonClicked);

    if (popupData && buttonClicked === "open") {
      const newWindow = window.open("", "_blank");
      newWindow.document.title = "New Window";

      // Create a new element to render the NewComponent in
      const newElement = document.createElement("div");
      newWindow.document.body.appendChild(newElement);

      // Render the NewComponent with the data in the new element
      ReactDOM.render(<PopUpComponent data={popupData[0]} />, newElement);
      setbuttonClicked("closed");
    }
  }, [popupData]);

  return (
    <div>
      <NavBar></NavBar>
      <SELECTBANKCUSTOMER
        onData={handledata}
        apiaddress={APIADDRESS.ANALYZECOUNTERPARTIES}
        headers={"Counterparties"}
      ></SELECTBANKCUSTOMER>
      <br></br>

      {optbank && (
        <div className="div_table1_counterparties">
          <h4 className="headingCounterPartiesTable">
            Summary of transactions by Payer-Payee{" "}
          </h4>
          <table className="table1_counterparties">
            <thead className="table2_headers_counterparties">
              {/* <tr>
                <th colSpan={1}></th>
                <th colSpan={2}>Transaction</th>
                <th colSpan={2}>Number of transactions</th>
                <th colSpan={4}>Debited amount</th>
                <th colSpan={4}>Credit amount</th>
              </tr> */}
              <tr>
                {mainHeader.map((item, i) => {
                  return (
                    <th className="sticky-main_header" colSpan={item.col_span}>
                      {item.header}
                    </th>
                  );
                })}
              </tr>
              {/* <tr>
                <th className="entityClass">
                  Entity{" "}
                  <button
                    className="filterButton_counterparties"
                    onClick={() => filterData("debits")}
                  >
                    ⇅
                  </button>
                </th>
                <th>From</th>
                <th>To</th>
                <th>Dr</th>
                <th>Cr</th>
                <th>Total</th>
                <th>Average</th>
                <th>Min</th>
                <th>Max</th>
                <th>Total</th>
                <th>Average</th>
                <th>Min</th>
                <th>Max</th>
              </tr> */}
              <tr>
                {sub_headers.map((item, i) => {
                  return (
                    <th className="sticky-sub_header">
                      {item.column_name}{" "}
                      <button
                        className="filterButton_counterparties"
                        onClick={() => filterData(item.variable, i)}
                      >
                        ⇅
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {optbank?.map((item, i) => {
                return (
                  <tr key={i}>
                    <td>
                      <button
                        className="button_monthwise"
                        onClick={() => {
                          setbuttonClicked("open");

                          openWindow(item.entity);
                        }}
                      >
                        {item?.entity}
                      </button>
                    </td>
                    <td>{item?.latest_txn}</td>
                    <td>{item?.oldest_txn}</td>
                    <td>{item?.debits}</td>
                    <td>{item?.credits}</td>
                    <td>{item?.debited_amt_total}</td>
                    <td>{item?.debited_amt_mthly}</td>
                    <td>{item?.min_debit}</td>
                    <td>{item?.max_debit}</td>
                    <td>{item?.credited_amt_total}</td>
                    <td>{item?.credited_amt_mthly}</td>
                    <td>{item?.min_credit}</td>
                    <td>{item?.max_credit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default ANALYZECOUNTERPARTIES;
