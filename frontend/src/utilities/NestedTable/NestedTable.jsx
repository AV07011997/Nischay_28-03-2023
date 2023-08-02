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
      >
        <table style={{ width: table_width }}>
          <thead>
            <tr>
              {cell_data.map((item) => {
                if (item.acc_type_new1 !== null) {
                  return (
                    <td style={{ height: "24px", padding: "0px" }}>
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
                    <td style={{ padding: "0px", height: "25px" }}>
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
                    <td style={{ padding: "0px", height: "24.5px" }}>
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
                    <td
                      style={{
                        padding: "0px",
                        height: "25px",
                      }}
                    >
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
