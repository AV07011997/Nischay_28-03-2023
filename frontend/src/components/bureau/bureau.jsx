import "./bureau.css";
import React, { useEffect, useRef } from "react";
import NavBar from "../../utilities/navbar/navbar";
import MaterialTable from "@material-table/core";
import { useParams } from "react-router-dom";
import { APIADDRESS, BUREAUPAGECOLUMNS } from "../../constants/constants";
import { postApi } from "../../callapi";
import { useState } from "react";

const Bureau = ({ info }) => {
  const params = useParams();
  const [tableData, setTableData] = useState();
  const inputValueROI = useRef();
  const inputValueTenure = useRef();
  const [emiDataArray, setEmiDataArray] = useState();
  const [selectedValueType, setSelectedValueType] = useState();

  var { radiovalue } = params;
  const state = BUREAUPAGECOLUMNS;
  useEffect(() => {
    var selectedvalueArray = [];

    postApi(APIADDRESS.BUREAUDATA, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      for (var j = 0; j < res[0].length; j++) {
        selectedvalueArray.push("bureau");
      }
      console.log(selectedvalueArray);
      setSelectedValueType(selectedvalueArray);
      setTableData(res);

      var tempArray = [];

      for (var i = 0; i < res[0].length; i++) {
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

      setEmiDataArray(tempArray);
    });
  }, []);

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

  const handleChange = (i) => {
    // console.log(i)

    var temp = selectedValueType;
    temp[i] = "edited";
    // console.log(temp)
    setSelectedValueType[temp];

    const roi = document.getElementById("roi_input" + i.toString());
    const tenure = document.getElementById("tenure_input" + i.toString());
    const currentEMI = emiCalculation(
      parseInt(tableData[0][i]["Current Balance"]),
      roi.value,
      tenure.value
    );
    // console.log(currentEMI);
    var temp = emiDataArray;
    temp[i]["ROI_user_edited"] = roi.value;
    temp[i]["Tenure_user_edited"] = tenure.value;
    setEmiDataArray(temp);
  };

  const handleValueTypeChange = ([index, value]) => {
    var temp = selectedValueType;
    temp[index] = value;

    setSelectedValueType[temp];
  };
  return (
    <div>
      <NavBar radiovalue={radiovalue}></NavBar>
      <div>
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
              tableData[0].map((item, i) => {
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
                            >
                              <input
                                ref={inputValueTenure}
                                onChange={() => handleChange(i)}
                                className=" bureau_input_design"
                                key={"tenure_input" + i.toString()}
                                id={"tenure_input" + i.toString()}
                                type="number"
                                defaultValue={parseInt(
                                  emiDataArray["Tenure_user_edited"]
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
                            >
                              <input
                                ref={inputValueTenure}
                                onChange={() => handleChange(i)}
                                className=" bureau_input_design"
                                key={"tenure_input" + i.toString()}
                                id={"tenure_input" + i.toString()}
                                type="number"
                                defaultValue={parseInt(
                                  emiDataArray["Tenure_edited"]
                                )}
                              ></input>
                            </th>
                          );
                        }

                        return (
                          <th
                            key={"bureau_tenure_input" + i.toString()}
                            id={"bureau_tenure_input" + i.toString()}
                          >
                            <input
                              ref={inputValueTenure}
                              onChange={() => handleChange(i)}
                              className=" bureau_input_design"
                              key={"tenure_input" + i.toString()}
                              id={"tenure_input" + i.toString()}
                              type="number"
                              defaultValue={parseInt(emiDataArray["Tenure"])}
                            ></input>
                          </th>
                        );
                      } else if (coloumn.field == "ROI") {
                        if (selectedValueType[i] == "edited") {
                          return (
                            <th
                              key={"bureau_ROI_input" + i.toString()}
                              id={"bureau_ROI_input" + i.toString()}
                            >
                              <input
                                ref={inputValueTenure}
                                onChange={() => handleChange(i)}
                                className=" bureau_input_design"
                                key={"roi_input" + i.toString()}
                                id={"roi_input" + i.toString()}
                                type="number"
                                defaultValue={parseInt(
                                  emiDataArray["ROI_user_edited"]
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
                            >
                              <input
                                ref={inputValueTenure}
                                onChange={() => handleChange(i)}
                                className=" bureau_input_design"
                                key={"roi_input" + i.toString()}
                                id={"roi_input" + i.toString()}
                                type="number"
                                defaultValue={parseInt(
                                  emiDataArray["ROI_edited"]
                                )}
                              ></input>
                            </th>
                          );
                        }

                        return (
                          <th
                            key={"bureau_ROI_input" + i.toString()}
                            id={"bureau_ROI_input" + i.toString()}
                          >
                            <input
                              ref={inputValueROI}
                              onChange={() => handleChange(i)}
                              className=" bureau_input_design"
                              key={"roi_input" + i.toString()}
                              id={"roi_input" + i.toString()}
                              type="number"
                              defaultValue={parseInt(emiDataArray["ROI"])}
                            ></input>
                          </th>
                        );
                      } else if (coloumn.field == "valueType") {
                        return (
                          <th key={"dropdown" + i.toString()}>
                            <select
                              name="Value Type"
                              id="valuetype"
                              className=" bureau_dropdown"
                              defaultValue={selectedValueType[i]}
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
                            {item[coloumn.field]}
                          </th>
                        );
                      }
                      return (
                        <th
                          className="table_bureau_text"
                          id={[coloumn.field] + i.toString()}
                          key={[coloumn.field] + i.toString()}
                        >
                          {item[coloumn.field]}
                        </th>
                      );
                    })}
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
