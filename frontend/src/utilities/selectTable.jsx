import React, { useState } from "react";

const MyTable = () => {
  const [tableData, setTableData] = useState([
    { id: 1, col1: "Value 1", col2: "Value 2", col3: "Value 3" },
    { id: 2, col1: "Value 4", col2: "Value 5", col3: "Value 6" },
    { id: 3, col1: "Value 7", col2: "Value 8", col3: "Value 9" },
    { id: 4, col1: "Value 10", col2: "Value 11", col3: "Value 12" },
    { id: 5, col1: "Value 13", col2: "Value 14", col3: "Value 15" },
  ]);

  const [selectedRows, setSelectedRows] = useState([]);

  const handleRowClick = (rowId, event) => {
    if (event.ctrlKey && event.altKey) {
      const firstSelectedRowIndex = selectedRows[0];
      const lastSelectedRowIndex = rowId;
      const start = Math.min(firstSelectedRowIndex, lastSelectedRowIndex);
      const end = Math.max(firstSelectedRowIndex, lastSelectedRowIndex);

      const rowsToSelect = tableData.slice(start - 1, end);
      console.log(rowsToSelect.map((row) => row.id));

      setSelectedRows(rowsToSelect.map((row) => row.id));
    } else if (event.ctrlKey) {
      setSelectedRows((prevSelectedRows) => {
        if (prevSelectedRows.includes(rowId)) {
          return prevSelectedRows.filter((id) => id !== rowId);
        } else {
          return [...prevSelectedRows, rowId];
        }
      });
    } else {
      setSelectedRows([rowId]);
    }
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
          <th>Column 3</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row) => (
          <tr
            key={row.id}
            onClick={(event) => handleRowClick(row.id, event)}
            className={selectedRows.includes(row.id) ? "selected" : ""}
          >
            <td>{row.col1}</td>
            <td>{row.col2}</td>
            <td>{row.col3}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MyTable;
