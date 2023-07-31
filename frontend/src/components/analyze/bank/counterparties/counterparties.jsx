import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import NavBar from "../../../../utilities/navbar/navbar";
import { APIADDRESS } from "../../../../constants/constants";
import SELECTBANKCUSTOMER from "../../../../utilities/selectBankCustomer/selectBankCustomer";
import "./counterparties.css";
import { postApi } from "../../../../callapi";

import { BsFillFileMinusFill } from "react-icons/bs";

import { BsFillFilePlusFill } from "react-icons/bs";

import MyTable from "../../../../utilities/selectTable";

function PopUpComponent(props) {
  const { data } = props;
  const headers = [
    "Transaction Date",
    "Description",
    "Debit",
    "Credit",
    "Balance",
    "Cheque no",
    "Entity",
  ];

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

const ANALYZECOUNTERPARTIES = ({ setUser }) => {
  setUser(localStorage.getItem("user"));

  var [optbank, setoptbank] = useState();
  var [optbank2, setoptbank2] = useState();
  var [optbank3, setoptbank3] = useState();
  var [table1, settable1] = useState();

  const [pagestate, setpagestate] = useState(0);
  const [buttonClicked, setbuttonClicked] = useState("closed");

  const [acc_number, setacc_number] = useState();
  const [popupData, setPopUpData] = useState();
  const [selection, setSelection] = useState(0);
  const [index, setIndex] = useState();
  const [firstSelectedRowIndex, setFirstSelectedRowIndex] = useState(null);

  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowsData, setSelectedRowsData] = useState();

  const handleRowClick = (rowId, event) => {
    if (event.ctrlKey && event.altKey) {
      const selectedLength = selectedRows.length - 1;
      const firstSelectedRowIndex = parseInt(selectedRows[selectedLength]);
      const lastSelectedRowIndex = parseInt(rowId);

      if (firstSelectedRowIndex === null) {
        setFirstSelectedRowIndex(rowId);
      }

      const start = Math.min(firstSelectedRowIndex, lastSelectedRowIndex);
      const end = Math.max(firstSelectedRowIndex, lastSelectedRowIndex);

      var localAray = [];

      for (let i of optbank) {
        if (i["index"] >= start && i["index"] <= end) {
          localAray.push(i);
        }
      }

      for (let i of selectedRows) {
        let item = optbank[i];
        localAray.push(item);
      }

      setSelectedRows(localAray.map((row) => row.index));
    } else if (event.ctrlKey) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows.includes(rowId)) {
          return prevSelectedRows.filter((id) => id !== rowId);
        } else {
          return [...prevSelectedRows, rowId];
        }
        if (firstSelectedRowIndex === null) {
          setFirstSelectedRowIndex(rowId);
        }
      });
    } else {
      setSelectedRows([rowId]);
      setFirstSelectedRowIndex(rowId);
    }
    const rowWithCountPositive = optbank.find(
      (item) => item.index === rowId && item.count > 0
    );
    if (rowWithCountPositive) {
      const index = selectedRows.indexOf(rowId);
      if (index === -1) {
        setSelectedRows((prevSelectedRows) => [...prevSelectedRows, rowId]);
        setFirstSelectedRowIndex(rowId);
      } else {
        setSelectedRows((prevSelectedRows) =>
          prevSelectedRows.filter((id) => id !== rowId)
        );
        setFirstSelectedRowIndex(null);
      }
    }
  };

  function removeObjectByEntity(arr, entityValue) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].entity === entityValue) {
        arr.splice(i, 1);
        break; // Stop searching after the first match is found
      }
    }
  }

  function handledata(data, acc_number, table1) {
    settable1(table1);
    setacc_number(acc_number);
    setoptbank(data);
    setoptbank2(data);
  }
  useEffect(() => {
    setpagestate(0);
  }, [acc_number]);

  useEffect(() => {
    if (table1) {
      window.scrollTo({
        top: 260 + 30 * (table1["columns"].length - 1), // Replace with the desired pixel height - 140*2 -140/4
        behavior: "smooth", // This enables smooth scrolling
      });
    }
  }, [optbank]);
  console.log(table1);

  const mainHeader = [
    { header: "", col_span: 1 },
    { header: "Transaction", col_span: 2 },
    { header: "Number of Transactions", col_span: 2 },
    { header: "Debited Amount (₹)", col_span: 4 },
    { header: "Credited Amount (₹)", col_span: 4 },
  ];

  const sub_headers = [
    { variable: "entity", column_name: "Entity" },
    { variable: "oldest_txn", column_name: "From", width: "78px" },

    { variable: "latest_txn", column_name: "To", width: "78px" },
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
    console.log(index);
    var databackup = optbank2;
    setIndex(index);

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

    function parseDate(dateString) {
      const [day, month, year] = dateString.split("/");
      return new Date(`${year}-${month}-${day}`);
    }

    if (index === 1 || index === 2) {
      console.log(databackup);

      if (pagestate % 2 === 0) {
        databackup.sort((a, b) => {
          console.log(a[sortVariable]);
          const dateA = parseDate(a[sortVariable]);
          const dateB = parseDate(b[sortVariable]);

          return dateA - dateB;
        });
      } else if (pagestate % 2 !== 0) {
        databackup.sort((a, b) => {
          const dateA = parseDate(a[sortVariable]);
          const dateB = parseDate(b[sortVariable]);

          // Handle null/undefined date strings
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;

          return dateB - dateA;
        });
      }
      console.log(databackup);

      setoptbank(databackup);
    }

    setpagestate(pagestate + 1);
  };

  function openWindow(entity) {
    const getPopUpData = async () => {
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZECOUNTERPARTIESPOPUP,
        {
          entity: entity,
          leadID: localStorage.getItem("leadID"),
          account_number: acc_number,
        }
      );
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
      ReactDOM.render(<PopUpComponent data={popupData[0]} />, newElement);
      setbuttonClicked("closed");
    }
  }, [popupData]);

  useEffect(() => {
    var localArray = [];

    if (optbank && selectedRows) {
      for (let i of optbank) {
        for (let j of selectedRows) {
          if (i["index"] === j) {
            localArray.push(i);
          }
        }
      }
    }
    const uniqueArray = removeDuplicateObjects(localArray, "index");

    setSelectedRowsData(uniqueArray);
  }, [selectedRows]);

  const removeDuplicateObjects = (array, key) => {
    const uniqueMap = new Map();
    array.forEach((item) => {
      const value = item[key];
      if (!uniqueMap.has(value)) {
        uniqueMap.set(value, item);
      }
    });
    return Array.from(uniqueMap.values());
  };

  var [mergeRowsList, setMergeRowsList] = useState();

  const mergeRows = async (group_no) => {
    console.log(selectedRows);
    if (group_no) {
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZECOUNTERPARTIESMERGE,
        {
          leadID: localStorage.getItem("leadID"),
          optbank: acc_number,
          group_no: group_no,
        }
      );
      setoptbank(response[0]["data"][1]);
      const newArrayWithMinimum = keepOnlyMinimum(selectedRows);
      setSelectedRows(newArrayWithMinimum);
      setFirstSelectedRowIndex(newArrayWithMinimum);
    } else {
      const response = await postApi(
        "analyze/" + APIADDRESS.ANALYZECOUNTERPARTIESMERGE,
        {
          leadID: localStorage.getItem("leadID"),
          optbank: acc_number,
          RowsData: { selectedRowsData },
        }
      );
      setoptbank(response[0]["data"][1]);
      const newArrayWithMinimum = keepOnlyMinimum(selectedRows);
      setSelectedRows(newArrayWithMinimum);
      setFirstSelectedRowIndex(newArrayWithMinimum);
    }
  };

  function keepOnlyMinimum(arr) {
    if (arr.length === 0) {
      return []; // Return an empty array if the input array is empty
    }

    const minValue = Math.min(...arr); // Find the minimum value in the array
    return [minValue]; // Create a new array containing only the minimum value
  }

  var entityWidth = "26em";
  console.log(optbank);

  return (
    <div>
      <NavBar></NavBar>
      <SELECTBANKCUSTOMER
        onData={handledata}
        apiaddress={APIADDRESS.ANALYZECOUNTERPARTIESMERGE}
        headers={"Counterparties"}
      ></SELECTBANKCUSTOMER>
      <br></br>

      {optbank && optbank.length > 0 && (
        <div className="div_table1_counterparties">
          <h4
            className="headingCounterPartiesTable"
            style={{ fontSize: "18px" }}
          >
            Summary of transactions by Payer-Payee{" "}
          </h4>

          <table className="table1_counterparties">
            <thead
              className="table2_headers_counterparties"
              style={{ fontSize: "15px" }}
            >
              <tr>
                <th
                  style={{
                    // width: "10px",
                    // border: "0px solid white",
                    background: "white",
                  }}
                ></th>
                {mainHeader.map((item, i) => {
                  var headerWidth = "auto";
                  if (item.header === "") {
                    headerWidth = "26em";
                  } else if (item.header === "Number of Transactions") {
                    headerWidth = "30em";
                  } else {
                    headerWidth = "40em";
                  }
                  return (
                    <th
                      className="sticky-main_header"
                      colSpan={item.col_span}
                      style={{
                        // width: headerWidth,
                        textAlign: "center",
                        border: "1px solid #575757",
                        padding: "5px",
                      }}
                    >
                      {item.header}
                    </th>
                  );
                })}
              </tr>

              <tr>
                <th
                  style={{
                    // width: "10px",
                    border: "0px solid white",
                    background: "white",
                  }}
                ></th>
                {sub_headers.map((item, i) => {
                  var columnWidth = "";
                  if (item.column_name === "Monthly Average") {
                    columnWidth = "6em";
                  } else if (item.column_name === "From") {
                    columnWidth = "80px";
                  } else if (item.column_name === "To") {
                    columnWidth = "78px";
                  } else if (item.column_name === "Dr") {
                    columnWidth = "40px";
                  } else if (item.column_name === "Cr") {
                    columnWidth = "40px";
                  } else {
                    columnWidth = "auto";
                  }
                  return (
                    <th
                      className="sticky-sub_header"
                      style={{
                        width: columnWidth,
                        border: "1px solid #575757",
                      }}
                    >
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
                          i !== 3 &&
                          i !== 4 &&
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
                        {(i === 3 || i === 4) &&
                          pagestate !== 0 &&
                          (i === index ? (
                            pagestate % 2 !== 0 ? (
                              <span>🔽</span>
                            ) : (
                              <span>🔼</span>
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
            {optbank && (
              <tbody style={{ fontSize: "14px" }}>
                {optbank?.map((item, i) => {
                  const isCountPositive = item.count > 0;
                  const isSelected = selectedRows.includes(item.index);
                  var rowClassName = "";

                  if (isCountPositive && isSelected) {
                    rowClassName = "blue";
                  } else if (isCountPositive) {
                    rowClassName = "selected";
                  } else if (isSelected) {
                    rowClassName = "blue";
                  }

                  return (
                    <tr
                      key={item.index}
                      onClick={(event) => handleRowClick(item.index, event)}
                      // className={
                      //   selectedRows.includes(item.index) ? "selected" : ""
                      // }
                      className={rowClassName}
                    >
                      <td
                        style={{
                          // width: "auto",
                          border: "0px solid white",
                          background: "white",
                          color: "white",
                          padding: "1px",
                          margin: "0",
                        }}
                      >
                        {firstSelectedRowIndex === item.index ? (
                          <button
                            style={{
                              width: "14px",
                              color: "black",
                              background: "transparent",
                              padding: "0",
                              border: "0",
                              margin: "0",
                            }}
                            onClick={() => {
                              if (selectedRows.length > 1) {
                                mergeRows();
                              }
                            }}
                          >
                            <BsFillFileMinusFill
                              size={"20"}
                            ></BsFillFileMinusFill>
                            {/* {"(-)"} */}
                          </button>
                        ) : (
                          ""
                        )}
                      </td>

                      <td
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          border: "1px solid #575757",
                          borderTop: "0px solid white",
                          padding: "3px",
                          height: "35px",
                          width: "auto",
                        }}
                      >
                        <button
                          className="button_monthwise"
                          onClick={() => {
                            setbuttonClicked("open");
                            openWindow(item.entity);
                          }}
                        >
                          <span>{item?.entity}</span>
                          {item.count > 0 && (
                            <span
                              style={{
                                color: "black",
                                // fontWeight: "bold",
                                fontStyle: "italic",
                              }}
                            >
                              {" ("}
                            </span>
                          )}
                          {item.count > 0 && (
                            <span
                              style={{
                                color: "black",
                                fontWeight: "bold",
                                fontStyle: "italic",
                              }}
                            >
                              {item.count}{" "}
                            </span>
                          )}
                          {item.count > 0 && (
                            <span
                              style={{
                                color: "black",
                                // fontWeight: "bold",
                                fontStyle: "italic",
                              }}
                            >
                              {" entities merged)"}
                            </span>
                          )}
                        </button>

                        {item?.count > 0 && (
                          <button
                            style={{
                              color: "black",
                              background: "transparent",
                              padding: "0",
                              border: "0",
                              margin: "0",
                              textAlign: "right",
                              fontWeight: "bold",
                            }}
                            onClick={() => {
                              mergeRows(item.group_no);
                            }}
                          >
                            {"(+)"}
                          </button>
                        )}
                      </td>
                      <td
                        style={{
                          height: "auto",

                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.oldest_txn}
                      </td>

                      <td
                        style={{
                          height: "auto",

                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.latest_txn}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.debits}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.credits}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.debited_amt_total}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.debited_amt_mthly}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.min_debit}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.max_debit}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.credited_amt_total}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.credited_amt_mthly}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "auto",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.min_credit}
                      </td>
                      <td
                        style={{
                          textAlign: "right",
                          height: "30px",
                          border: "1px solid #575757",
                          padding: "3px",
                        }}
                      >
                        {item?.max_credit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      )}
    </div>
  );
};
export default ANALYZECOUNTERPARTIES;
