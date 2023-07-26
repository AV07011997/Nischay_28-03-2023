import React from "react";

class DateInput extends React.Component {
  render() {
    return <input type="date" min="2022-12-31" max="2023-01-01" />;
  }
}

export default DateInput;
