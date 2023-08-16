import React from "react";
import { PieChart } from "react-minimal-pie-chart";

const RatioPieChart = ({ ratio }) => {
  const percentage = (ratio / (1 + ratio)) * 100;

  const data = [
    { title: "D", value: percentage, color: "green" }, // Gray color

    { title: "C", value: 100 - percentage, color: "#C4C4C4" },
  ];

  return (
    <div style={{ width: "100px", height: "130px", marginLeft: "-17px" }}>
      <PieChart
        data={data}
        lineWidth={20}
        labelPosition={0}
        labelStyle={{
          fontSize: "20px",

          fontWeight: "bold",

          fill: "#333", // Text color
        }}
      />
    </div>
  );
};

export default RatioPieChart;
