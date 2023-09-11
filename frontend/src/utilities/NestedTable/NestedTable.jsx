import React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import "./NestedTable.css"; // Import the CSS file

const NestedTable = (props) => {
  const { cell_data } = props;
  console.log(cell_data);
  const table_width = `${cell_data.length * 74}px`;

  return (
    <div className="table-container">
      <Scrollbars
        renderThumbHorizontal={({ style }) => (
          <div className="custom-scrollbar-thumb-horizontal" style={style} />
        )}
        renderTrackVertical={() => <div style={{ display: "none" }} />}
      >
        <table
          className="tablebureaunestedtablemonthwise"
          style={{ width: table_width, tableLayout: "fixed", padding: "0px" }}
        >
          <thead>
            <tr>
              {cell_data.map((item) => {
                if (item.acc_type_new1 !== null) {
                  return (
                    <td className="td1nestedtable" style={{ padding: "0px" }}>
                      {item.acc_type_new1}
                    </td>
                  );
                }
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              {cell_data.map((item) => {
                if (item.valid_emi !== "nan") {
                  return (
                    <td className="td2nestedtable" style={{ padding: "0px" }}>
                      {item.valid_emi}
                    </td>
                  );
                }
              })}
            </tr>
            <tr>
              {cell_data.map((item) => {
                if (item.DPD !== null) {
                  return (
                    <td className="td3nestedtable" style={{ padding: "0" }}>
                      {item.DPD}
                    </td>
                  );
                }
              })}
            </tr>
            <tr>
              {cell_data.map((item) => {
                if (item.asset_classification !== null) {
                  return (
                    <td className="td2nestedtable" style={{ padding: "0px" }}>
                      {item.asset_classification}
                    </td>
                  );
                }
              })}
            </tr>
          </tbody>
        </table>
      </Scrollbars>
    </div>
  );
};

export default NestedTable;
