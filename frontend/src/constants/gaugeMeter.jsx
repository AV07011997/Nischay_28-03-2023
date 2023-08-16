import React from "react";
import GaugeChart from "react-gauge-chart";

const GaugeMeter = ({ value, maxValue }) => {
  const normalizedValue = value / maxValue;

  return (
    <div>
      <GaugeChart
        id="gauge-chart"
        nrOfLevels={20}
        arcsLength={[0.2, 0.5, 0.3]}
        colors={["#FF5F6D", "#FFC371", "#45B649"]}
        percent={normalizedValue}
        arcPadding={0.02}
        textColor="#333"
      />
      <div>{value}</div>
    </div>
  );
};

export default GaugeMeter;
