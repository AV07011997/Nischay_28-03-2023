import "./bureau.css";
import React, { useEffect, useRef } from "react";
import NavBar from "../../utilities/navbar/navbar";
import MaterialTable from "@material-table/core";
import { useParams } from "react-router-dom";
import { APIADDRESS, BUREAUPAGECOLUMNS } from "../../constants/constants";
import { postApi } from "../../callapi";
import { useState } from "react";
import numeral from "numeral";
import NavBar1 from "../../utilities/navbar/navbar1";

const Bureau = ({ info }) => {
  const params = useParams();
  const [tableData, setTableData] = useState();
  const inputValueROI = useRef();
  const [creditCardData, setCreditCardData] = useState();
  const inputValueTenure = useRef();
  const [emiDataArray, setEmiDataArray] = useState();
  const [selectedValueType, setSelectedValueType] = useState();
  const [emiValues, setEMIValues] = useState();
  const [isButtonDisabled, setButtonDisabled] = useState(true);
  function formatIndianCurrency(num) {
    // Use the toLocaleString() method with appropriate options
    return num.toLocaleString("en-IN");
  }
  var { radiovalue } = params;
  const state = BUREAUPAGECOLUMNS;
  useEffect(() => {
    var selectedvalueArray = [];

    localStorage.setItem("bureauSave", "true");
    postApi(APIADDRESS.BUREAUDATA, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      var table1 = [];
      var table2 = [];
      for (var j = 0; j < res[0].length; j++) {
        if (res[0][j]["Loan_type"] != "Credit Card") {
          table1.push(res[0][j]);
          selectedvalueArray.push(
            res[0][j]["selectedValue"] != null
              ? res[0][j]["selectedValue"]
              : "bureau"
          );
        } else {
          table2.push(res[0][j]);
        }
      }
      // console.log(selectedvalueArray);
      setSelectedValueType(selectedvalueArray);
      setTableData([table1]);
      console.log(table2);
      setCreditCardData([table2]);

      var tempArray = [];
      var EMIarray = [];
      for (var i = 0; i < res[0].length; i++) {
        if (res[0][i]["Loan_type"] != "Credit Card") {
          var tempObject = {
            ROI: res[0][i]["ROI"],
            ROI_edited: res[0][i]["ROI_edited"],
            ROI_user_edited: res[0][i]["ROI_user_edited"],
            Tenure: res[0][i]["Tenure"],
            Tenure_edited: res[0][i]["Tenure_edited"],
            Tenure_user_edited: res[0][i]["Tenure_user_edited"],
          };

          tempArray.push(tempObject);
        }
      }

      setEmiDataArray(tempArray);
    });
  }, []);
  const updateEMI = () => {
    const emiCalculation = (p, r, t) => {
      // console.log(t)
      r = r / 1200;
      if (isNaN(p)) {
        p = 0;
      }
      if (isNaN(t)) {
        t = 0;
      }

      const e = p * r * (Math.pow(1 + r, t) / (Math.pow(1 + r, t) - 1));
      var ans = Math.ceil(e, 2);
      if (isNaN(ans)) {
        ans = 0;
      }
      return ans;
    };
    var emiArray = [];
    if (tableData == undefined) {
      return 0;
    }
    for (let j = 0; j < tableData[0].length; j++) {
      const roi = document.getElementById("roi_input" + j.toString());

      const tenure = document.getElementById("tenure_input" + j.toString());
      const currentEMI = emiCalculation(
        parseInt(tableData[0][j]["Disbursed_amount"]),
        roi.value,
        tenure.value
      );
      emiArray.push(formatIndianCurrency(currentEMI));
    }
    setEMIValues(emiArray);
  };

  const handleChange = (i) => {
    // console.log(i)

    var temp = [...selectedValueType];
    temp[i] = "edited";
    localStorage.setItem("bureauSave", "false");
    setButtonDisabled(false);
    // console.log(temp)
    setSelectedValueType(temp);

    const roi = document.getElementById("roi_input" + i.toString());
    const tenure = document.getElementById("tenure_input" + i.toString());
    var temp = [...emiDataArray];
    console.log(tableData);
    var x = tableData[0];
    var temp1 = [...x];
    temp[i]["ROI_user_edited"] = roi.value;
    temp[i]["Tenure_user_edited"] = tenure.value;
    temp1[i]["ROI_user_edited"] = roi.value;
    temp1[i]["Tenure_user_edited"] = tenure.value;
    setEmiDataArray(temp);
    setTableData([temp1]);
  };

  const handleValueTypeChange = ([index, value]) => {
    localStorage.setItem("bureauSave", "false");
    setButtonDisabled(false);
    var temp = [...selectedValueType];
    temp[index] = value;
    setSelectedValueType(temp);

    if (value == "recommended") {
      document.getElementById("roi_input" + index.toString()).value =
        emiDataArray[index]["ROI_edited"];

      document.getElementById("tenure_input" + index.toString()).value =
        emiDataArray[index]["Tenure_edited"];
    }

    if (value == "bureau") {
      document.getElementById("roi_input" + index.toString()).value =
        emiDataArray[index]["ROI"];

      document.getElementById("tenure_input" + index.toString()).value =
        emiDataArray[index]["Tenure"];
    }

    if (value == "edited") {
      document.getElementById("roi_input" + index.toString()).value =
        emiDataArray[index]["ROI_user_edited"];

      document.getElementById("tenure_input" + index.toString()).value =
        emiDataArray[index]["Tenure_user_edited"];
    }
  };

  const saveButtonClickHandler = () => {
    const payload = tableData[0];
    localStorage.setItem("bureauSave", "true");
    for (let i = 0; i < tableData[0].length; i++) {
      payload[i]["selectedValue"] = selectedValueType[i];
    }

    console.log(payload);
    postApi(APIADDRESS.SAVEBUREAUDATA, { payload: JSON.stringify(payload) });
  };
  useEffect(() => {
    updateEMI();
  }, [selectedValueType]);

  return (
    <div>
      <NavBar1 radiovalue={radiovalue}></NavBar1>
      <div>
        <div>
          <button
            onClick={() => window.location.reload(false)}
            className="button_bureau"
          >
            Reset
          </button>
        </div>
        <table className="table_bureau">
          <thead className="table_bureau_thead">
            <tr>
              {state.columns.map((items, j) => {
                return (
                  <th className="table_bureau_text" key={"bureau_coloumn" + j}>
                    {items.title}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="table_bureau_tbody">
            {tableData &&
              selectedValueType &&
              tableData[0].map((item, i) => {
                // console.log(selectedValueType);

                return (
                  <tr key={"row" + i.toString()}>
                    {state.columns.map((coloumn, j) => {
                      if (coloumn.field == "Tenure") {
                        if (selectedValueType[i] == "edited") {
                          console.log("Hello");
                          return (
                            <th
                              key={"bureau_tenure_input" + i.toString()}
                              id={"bureau_tenure_input" + i.toString()}
                              className="bureau_border"
                            >
                              <input
                                ref={inputValueTenure}
                                onChange={() => handleChange(i)}
                                className=" bureau_input_design"
                                key={"tenure_input" + i.toString()}
                                id={"tenure_input" + i.toString()}
                                type="number"
                                defaultValue={parseInt(
                                  emiDataArray[i]["Tenure_user_edited"]
                                )}
                              ></input>
                            </th>
                          );
                        }
                        if (selectedValueType[i] == "recommended") {
                          return (
                            <th
                              key={"bureau_tenure_input" + i.toString()}
                              id={"bureau_tenure_input" + i.toString()}
                              className="bureau_border"
                            >
                              <input
                                ref={inputValueTenure}
                                onChange={() => handleChange(i)}
                                className=" bureau_input_design"
                                key={"tenure_input" + i.toString()}
                                id={"tenure_input" + i.toString()}
                                type="number"
                                defaultValue={parseInt(
                                  emiDataArray[i]["Tenure_edited"]
                                )}
                              ></input>
                            </th>
                          );
                        }

                        return (
                          <th
                            key={"bureau_tenure_input" + i.toString()}
                            id={"bureau_tenure_input" + i.toString()}
                            className="bureau_border"
                          >
                            <input
                              ref={inputValueTenure}
                              onChange={() => handleChange(i)}
                              className=" bureau_input_design"
                              key={"tenure_input" + i.toString()}
                              id={"tenure_input" + i.toString()}
                              type="number"
                              defaultValue={parseInt(emiDataArray[i]["Tenure"])}
                            ></input>
                          </th>
                        );
                      } else if (coloumn.field == "ROI") {
                        if (selectedValueType[i] == "edited") {
                          return (
                            <th
                              key={"bureau_ROI_input" + i.toString()}
                              id={"bureau_ROI_input" + i.toString()}
                              className="bureau_border"
                            >
                              <input
                                ref={inputValueTenure}
                                onChange={() => handleChange(i)}
                                className=" bureau_input_design"
                                key={"roi_input" + i.toString()}
                                id={"roi_input" + i.toString()}
                                type="number"
                                defaultValue={parseInt(
                                  emiDataArray[i]["ROI_user_edited"]
                                )}
                              ></input>
                            </th>
                          );
                        }

                        if (selectedValueType[i] == "recommended") {
                          return (
                            <th
                              key={"bureau_ROI_input" + i.toString()}
                              id={"bureau_ROI_input" + i.toString()}
                              className="bureau_border"
                            >
                              <input
                                ref={inputValueTenure}
                                onChange={() => handleChange(i)}
                                className=" bureau_input_design"
                                key={"roi_input" + i.toString()}
                                id={"roi_input" + i.toString()}
                                type="number"
                                defaultValue={parseInt(
                                  emiDataArray[i]["ROI_edited"]
                                )}
                              ></input>
                            </th>
                          );
                        }

                        return (
                          <th
                            key={"bureau_ROI_input" + i.toString()}
                            id={"bureau_ROI_input" + i.toString()}
                            className="bureau_border"
                          >
                            <input
                              ref={inputValueROI}
                              onChange={() => handleChange(i)}
                              className=" bureau_input_design"
                              key={"roi_input" + i.toString()}
                              id={"roi_input" + i.toString()}
                              type="number"
                              defaultValue={parseInt(emiDataArray[i]["ROI"])}
                            ></input>
                          </th>
                        );
                      } else if (coloumn.field == "valueType") {
                        return (
                          <th
                            key={"dropdown" + i.toString()}
                            className="bureau_border"
                          >
                            <select
                              name="Value Type"
                              id="valuetype"
                              className=" bureau_dropdown"
                              value={selectedValueType[i]}
                              onChange={(e) =>
                                handleValueTypeChange([i, e.target.value])
                              }
                            >
                              <option value="recommended">Recommended</option>
                              <option value="edited">Edited</option>
                              <option value="bureau">Bureau</option>
                            </select>
                          </th>
                        );
                      } else if (coloumn.field == "EMI") {
                        return (
                          <th
                            className="table_bureau_text"
                            id={[coloumn.field] + i.toString()}
                            key={[coloumn.field] + i.toString()}
                          >
                            {emiValues?.[i]}
                          </th>
                        );
                      } else if (coloumn.field == "Disbursed_amount") {
                        return (
                          <th
                            className="table_bureau_text"
                            id={[coloumn.field] + i.toString()}
                            key={[coloumn.field] + i.toString()}
                          >
                            {item[coloumn.field] != null
                              ? formatIndianCurrency(item[coloumn.field])
                              : 0}
                          </th>
                        );
                      } else if (coloumn.field == "Current Balance") {
                        return (
                          <th
                            className="table_bureau_text"
                            id={[coloumn.field] + i.toString()}
                            key={[coloumn.field] + i.toString()}
                          >
                            {item[coloumn.field] != null
                              ? formatIndianCurrency(item[coloumn.field])
                              : 0}
                          </th>
                        );
                      }
                      return (
                        <th
                          className="table_bureau_text"
                          id={[coloumn.field] + i.toString()}
                          key={[coloumn.field] + i.toString()}
                        >
                          {item[coloumn.field] != null
                            ? item[coloumn.field]
                            : 0}
                        </th>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>

        <div style={{ width: "100%", marginTop: "1.3em" }}>
          <button
            onClick={saveButtonClickHandler}
            disabled={isButtonDisabled}
            style={{
              marginLeft: "50em",
              marginRight: "auto",
              padding: "8px",
              width: "90px",
              backgroundColor: "black",
              color: "white",
            }}
          >
            <span style={{ fontWeight: "1000" }}>Save</span>
          </button>
        </div>

        <table className="table_bureau" style={{ marginTop: "2em" }}>
          <thead className="table_bureau_thead">
            <tr>
              <th> Date Reported</th>
              <th> Loan Type</th>
              <th> Loan Status</th>
              <th> Issue Date</th>
              <th>High Credit Amount (₹)</th>
              <th> Current Balance (₹)</th>
              <th>Last DPD </th>
              <th> Overdue Amount (₹) </th>
              <th> Source </th>
              <th>Value Type</th>
            </tr>
          </thead>

          <tbody className="table_bureau_tbody">
            {creditCardData?.[0].map((item, index) => {
              return (
                <tr>
                  <th className="table_bureau_text">
                    {item["date_reported_som"]}
                  </th>
                  <th className="table_bureau_text">{item["Loan_type"]}</th>
                  <th className="table_bureau_text">{item["Loan_status"]}</th>
                  <th className="table_bureau_text">
                    {item["Disbursal_date"]}
                  </th>
                  <th className="table_bureau_text">
                    {formatIndianCurrency(150000 * (index + 1))}
                  </th>
                  <th className="table_bureau_text">
                    {formatIndianCurrency(item["Current Balance"])}
                  </th>
                  <th className="table_bureau_text">
                    {item["DPD"] === 0 ? item["DPD"] : "NR"}
                  </th>
                  <th className="table_bureau_text">{item["DPD"]}</th>
                  <th className="table_bureau_text">
                    {item["Overdue amount"]}
                  </th>
                  <th className="table_bureau_text">{item["Source"]}</th>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bureau;
