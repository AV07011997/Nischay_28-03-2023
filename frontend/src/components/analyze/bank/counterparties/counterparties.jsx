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
  // console.log(data);
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
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.debit}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.credit}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.balance}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.cheque_number}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #5a5a5a" }}>
                    {item.entity}
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

const ANALYZECOUNTERPARTIES = (props) => {
  var [optbank, setoptbank] = useState();
  var [optbank2, setoptbank2] = useState();
  const [pagestate, setpagestate] = useState(0);
  const [buttonClicked, setbuttonClicked] = useState("closed");

  const [acc_number, setacc_number] = useState();
  const [popupData, setPopUpData] = useState();
  const [selection, setSelection] = useState(0);
  const [index, setIndex] = useState();

  function handledata(data, acc_number) {
    setacc_number(acc_number);
    setoptbank(data);
    setoptbank2(data);
    // setpagestate(0);
  }
  useEffect(() => {
    setpagestate(0);
  }, [acc_number]);

  const mainHeader = [
    { header: "", col_span: 1 },
    { header: "Transaction", col_span: 2 },
    { header: "Number of Transactions", col_span: 2 },
    { header: "Debited Amount (₹)", col_span: 4 },
    { header: "Credited Amount (₹)", col_span: 4 },
  ];

  const sub_headers = [
    { variable: "entity", column_name: "Entity" },
    { variable: "latest_txn", column_name: "From" },
    { variable: "oldest_txn", column_name: "To" },
    { variable: "debits", column_name: "Dr" },
    { variable: "credits", column_name: "Cr" },
    { variable: "debited_amt_total", column_name: "Total" },
    { variable: "debited_amt_mthly", column_name: "Monthly Average" },
    { variable: "min_debit", column_name: "Min" },
    { variable: "max_debit", column_name: "Max" },
    { variable: "credited_amt_total", column_name: "Total" },
    { variable: "credited_amt_mthly", column_name: "Monthly Average" },
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
    setIndex(index);
    // Comparator function for sorting in ascending order
    // console.log(index, sortVariable);
    // console.log(databackup);
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
      // console.log("1");
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
      // console.log("hello");
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZECOUNTERPARTIESPOPUP,
        {
          entity: entity,
          leadID: localStorage.getItem("leadID"),
          account_number: acc_number,
        }
      );
      // console.log(response);
      setPopUpData(response);
    };

    getPopUpData();
  }

  useEffect(() => {
    // console.log("called");
    // console.log(popupData);
    // console.log(buttonClicked);

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
  // console.log(pagestate);
  console.log(optbank);

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
              <tr>
                {mainHeader.map((item, i) => {
                  return (
                    <th className="sticky-main_header" colSpan={item.col_span}>
                      {item.header}
                    </th>
                  );
                })}
              </tr>

              <tr>
                {sub_headers.map((item, i) => {
                  return (
                    <th className="sticky-sub_header">
                      {item.column_name}{" "}
                      <button
                        className="filterButton_counterparties"
                        onClick={() => filterData(item.variable, i)}
                      >
                        {pagestate === 0 && <span className="gray">⇅</span>}
                        {i === 0 &&
                          pagestate !== 0 &&
                          (i === index ? (
                            pagestate % 2 === 0 ? (
                              <span>🔼</span>
                            ) : (
                              <span>🔽</span>
                            )
                          ) : (
                            <span className="gray">⇅</span>
                          ))}
                        {i !== 0 &&
                          pagestate !== 0 &&
                          (i === index ? (
                            pagestate % 2 !== 0 ? (
                              <span>🔼</span>
                            ) : (
                              <span>🔽</span>
                            )
                          ) : (
                            <span className="gray">⇅</span>
                          ))}
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
                    <td style={{ textAlign: "left" }}>
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
                    <td>{item?.oldest_txn}</td>
                    <td>{item?.latest_txn}</td>
                    <td style={{ textAlign: "right" }}>{item?.debits}</td>
                    <td style={{ textAlign: "right" }}>{item?.credits}</td>
                    <td style={{ textAlign: "right" }}>
                      {item?.debited_amt_total}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item?.debited_amt_mthly}
                    </td>
                    <td style={{ textAlign: "right" }}>{item?.min_debit}</td>
                    <td style={{ textAlign: "right" }}>{item?.max_debit}</td>
                    <td style={{ textAlign: "right" }}>
                      {item?.credited_amt_total}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {item?.credited_amt_mthly}
                    </td>
                    <td style={{ textAlign: "right" }}>{item?.min_credit}</td>
                    <td style={{ textAlign: "right" }}>{item?.max_credit}</td>
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
