import React, { useEffect } from "react";
import { postApi } from "../../../../callapi";
import { APIADDRESS } from "../../../../constants/constants";
import NavBar from "../../../../utilities/navbar/navbar";
import { useState } from "react";
import { Loader } from "rsuite";

import "./bureauAnalyze.css";
const BureauAnalyze = () => {
  const [item, setItems] = useState();
  const [graph1, setGraph1] = useState();
  const [graph2, setGraph2] = useState();

  useEffect(() => {
    console.log("hello");
    postApi("analyze/" + APIADDRESS.BUREAUANALYZE, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      console.log(res);
      setItems(res.specifics[0]);
      setGraph1("./staticfiles/plotly_chart.png");
      setGraph2("./staticfiles/plotly_chart2.png");
    });
  }, []);
  function formatDate(inputString) {
    const [dpdDays, monthYear] = inputString.split(",");

    // Remove any leading/trailing spaces and convert dpdDays to a number
    const formattedDpdDays = parseFloat(dpdDays.trim());

    // Trim the month-year part
    const formattedMonthYear = monthYear.trim();

    // Combine the formattedDpdDays and formattedMonthYear using template literals
    const result = `${formattedDpdDays} DPD, ${formattedMonthYear}`;

    return result;
  }
  // function convertToDpdFormat(inputString) {
  //   // Split the inputString into days and month-year parts
  //   const [dpdDays, monthYear] = inputString.split(",");

  //   // Remove any leading/trailing spaces and convert dpdDays to a number
  //   const formattedDpdDays = parseFloat(dpdDays.trim());

  //   // Combine the formattedDpdDays and "DPD" on the first line
  //   let result = `${formattedDpdDays} DPD`;

  //   // Add the month-year part on the next line
  //   result += `\n${monthYear.trim()}`;
  //   console.log(result);

  //   return result;
  // }
  var dpd;
  var monthYear;

  if (item) {
    const [dpdDays1, monthYear1] = item.secured_max_dpd_status.split(",");
    const formattedDpdDays = parseFloat(dpdDays1.trim());

    dpd = formattedDpdDays;
    monthYear = monthYear1.trim();
  }

  function convertToDpdFormat(inputString) {
    // Split the inputString into days and month-year parts
    const [dpdDays] = inputString.split(",");

    // Remove any leading/trailing spaces and convert dpdDays to a number
    const formattedDpdDays = parseFloat(dpdDays.trim());

    // Combine the formattedDpdDays and "DPD"
    const result = `${formattedDpdDays} DPD`;

    return result;
  }

  return (
    <div>
      <NavBar></NavBar>

      {item ? (
        <div>
          <div className="bureau-analyze-circle-div">
            <div className="circlesubtext">
              <div class="circles">{item?.score}</div>
              <div style={{ textAlign: "center", color: "black" }}>
                <b>Bureau score</b>
              </div>
            </div>
            <div className="circlesubtext">
              <div className="circles" style={{ background: "#575757" }}>
                {item?.number_of_active_tradelines}
              </div>
              <div style={{ color: "black" }}>
                <b>Active tradelines</b>
                <div>Unsecured: 2</div>
                <div>Secured: 2</div>
              </div>
            </div>
            <div className="circlesubtext">
              <div className="circles">{item?.current_balance_active}</div>
              <div style={{ color: "black" }}>
                <b>Current balance</b>
                <div>
                  Unsecured:{" "}
                  {item?.sum_of_current_balance_of_unsecured_active_loans}
                </div>
                <div>
                  Secured:{" "}
                  {item?.sum_of_current_balance_of_secured_active_loans}
                </div>
              </div>
            </div>
            <div className="circlesubtext">
              <div className="circles" style={{ background: "#575757" }}>
                {item?.sum_of_emi_of_active_loans}
              </div>
              <div style={{ color: "black" }}>
                <b>EMI</b>
                <div>Largest EMI: {item?.max_emi_of_active_loans}</div>
                <div>Smallest EMI: {item?.min_emi_of_active_loans}</div>
              </div>
            </div>

            <div className="circlesubtext">
              <div className="circles">
                <div>
                  <span style={{ display: "block" }}>
                    {item?.secured_max_dpd_status ? (
                      <React.Fragment>
                        <p>{dpd} DPD</p>
                        <p>{monthYear}</p>
                      </React.Fragment>
                    ) : (
                      0
                    )}
                  </span>
                  <span style={{ display: "block" }}>
                    {" "}
                    {item?.secured_max_dpd_status
                      ? convertToDpdFormat(item?.secured_max_dpd_status)
                      : 0}{" "}
                  </span>
                </div>
                {}
              </div>
              <div style={{ color: "black" }}>
                <b>Latest Overdue (DPD)</b>
                <div>
                  Unsecured:{" "}
                  {item?.unsecured_last_dpd_status
                    ? formatDate(item?.unsecured_last_dpd_status)
                    : 0}
                </div>
                <div>
                  Secured:{" "}
                  {item?.secured_last_dpd_status
                    ? formatDate(item?.secured_last_dpd_status)
                    : 0}
                </div>
              </div>
            </div>
            <div className="circlesubtext">
              <div className="circles" style={{ background: "#575757" }}>
                {item?.secured_max_dpd_status
                  ? convertToDpdFormat(item?.secured_max_dpd_status)
                  : 0}{" "}
              </div>
              <div style={{ color: "black" }}>
                <b>Max Overdue (DPD)</b>
                <div>Unsecured: {item?.unsecured_max_dpd_status}</div>
                <div>
                  Secured:{" "}
                  {item?.secured_max_dpd_status
                    ? formatDate(item?.secured_max_dpd_status)
                    : 0}{" "}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              columnGap: "50px",
              justifyContent: "space-evenly",
              marginTop: "2em",
            }}
          >
            <div>
              <table
                style={{
                  display: "inline-table",
                  borderCollapse: "collapse",
                  marginRight: "1%",
                  marginBottom: "10px",
                }}
                className="BureayAnalyzeCell"
              >
                <tr>
                  <th
                    style={{ width: "285px" }}
                    className="header-table-bureau-analayze"
                  >
                    Age (in years)
                  </th>
                  <td className="num-bureau-analyze">{item?.age}</td>
                </tr>
                <tr>
                  <th class="header-table-bureau-analayze">Marital status</th>
                  <td>{item?.marital_status}</td>
                </tr>
                <tr>
                  <th class="header-table-bureau-analayze" rowspan="3">
                    Last Reported Address{" "}
                  </th>
                </tr>
                <tr>
                  <td>{item?.last_reported_address_date}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "center" }}>
                    {item?.last_reported_address}
                  </td>
                </tr>

                <tr>
                  <th
                    style={{ width: "13em" }}
                    class="header-table-bureau-analayze"
                  >
                    Last Reported Phone no
                  </th>
                  <td className="num">{item?.last_reported_phone_no}</td>
                </tr>
              </table>
              <table
                style={{ marginBottom: "10px" }}
                className="BureayAnalyzeCell"
              >
                <tr>
                  <th class="header-table-bureau-analayze">
                    # of enquiries in last 6 months
                  </th>
                  <td className="num">
                    {item?.number_of_inquiries_in_last_6_month}
                  </td>
                </tr>
                <tr>
                  <th rowspan="4" class="header-table-bureau-analayze">
                    Last Enquiry Reported
                  </th>
                </tr>
                <tr>
                  <td>{item?.last_inquiry_type}</td>
                </tr>
                <tr>
                  <td class="num">{item?.last_inquiry_amount}</td>
                </tr>
                <tr>
                  <td>{item?.last_inquiry_year}</td>
                </tr>
              </table>
              <table className="BureayAnalyzeCell">
                <tr>
                  <th rowspan="4" className="header-table-bureau-analayze">
                    Oldest Loan Reported
                  </th>
                </tr>
                <tr>
                  <td>{item?.oldest_loan_disbursed_type}</td>
                </tr>
                <tr>
                  <td class="num">{item?.oldest_loan_disbursed_amount}</td>
                </tr>
                <tr>
                  <td>{item?.oldest_loan_disbursed_year}</td>
                </tr>
                <tr>
                  <th className="header-table-bureau-analayze">
                    # of closed Loans till date
                  </th>
                  <td class="num">{item?.number_of_closed_accounts}</td>
                </tr>
                <tr>
                  <th rowspan="4" className="header-table-bureau-analayze">
                    Last Closed Loan
                  </th>
                </tr>
                <tr>
                  <td>{item?.last_closed_loan_type}</td>
                </tr>
                <tr>
                  <td class="num">{item?.last_closed_loan_amount}</td>
                </tr>
                <tr>
                  <td>{item?.last_closed_loan_year}</td>
                </tr>
                <tr>
                  <th rowspan="4" className="header-table-bureau-analayze">
                    Last Disbursed Loan
                  </th>
                </tr>
                <tr>
                  <td>{item?.last_disbursed_loan_type}</td>
                </tr>
                <tr>
                  <td class="num">{item?.last_disbursed_loan_amount}</td>
                </tr>
                <tr>
                  <td>{item?.last_disbursed_loan_year}</td>
                </tr>
              </table>
            </div>
            <div>
              <table className="BureayAnalyzeCell">
                <tr>
                  <th rowspan="3" className="header-table-bureau-analayze">
                    Largest Active Loan
                  </th>
                </tr>
                <tr>
                  <td>{item?.largest_loan_type}</td>
                </tr>
                <tr>
                  <td class="num">{item?.largest_loan_amount}</td>
                </tr>

                <tr>
                  <th rowspan="3" className="header-table-bureau-analayze">
                    Smallest Active Loan
                  </th>
                </tr>
                <tr>
                  <td>{item?.smallest_loan_type}</td>
                </tr>
                <tr>
                  <td class="num">{item?.smallest_loan_amount}</td>
                </tr>

                <tr>
                  <th rowspan="3" className="header-table-bureau-analayze">
                    Largest Closed Loan
                  </th>
                </tr>
                <tr>
                  <td>{item?.largest_closed_loan_type}</td>
                </tr>
                <tr>
                  <td class="num">{item?.largest_closed_loan_amount}</td>
                </tr>

                <tr>
                  <th className="header-table-bureau-analayze">
                    Max Credit limit of active CC/OD
                  </th>
                  <td class="num">{item?.max_credit_limit_of_active_cc_od}</td>
                </tr>

                <tr>
                  <th className="header-table-bureau-analayze">
                    Total Credit limit of active CC/OD
                  </th>
                  <td class="num">
                    {item?.total_credit_limit_of_active_cc_od}
                  </td>
                </tr>

                <tr>
                  <th className="header-table-bureau-analayze">
                    Current balance of active CC/OD
                  </th>
                  <td class="num">
                    {item?.total_current_balance_of_active_cc_od}
                  </td>
                </tr>

                <tr>
                  <th className="header-table-bureau-analayze">
                    Credit card & Overdraft utilization
                  </th>
                  <td class="num">{item?.cc_od_utilization_ratio}%</td>
                </tr>

                <tr>
                  <th className="header-table-bureau-analayze">
                    Credit utilization (loans)
                  </th>
                  <td class="num">{item?.credit_utilization_ratio}%</td>
                </tr>
              </table>
              <table
                style={{ marginTop: "10px" }}
                className="BureayAnalyzeCell"
              >
                <tr>
                  <th className="header-table-bureau-analayze">
                    Total overdue
                  </th>
                  <td class="num">{item?.total_overdue_amount}</td>
                </tr>
                <tr>
                  <th className="header-table-bureau-analayze">
                    # of write-offs
                  </th>
                  <td class="num">{item?.number_of_written_off_accounts}</td>
                </tr>
                <tr>
                  <th className="header-table-bureau-analayze">
                    # of suits-filed
                  </th>
                  <td class="num">{item?.number_of_suit_filed_accounts}</td>
                </tr>
                <tr>
                  <th className="header-table-bureau-analayze">
                    Total written-off amount
                  </th>
                  <td class="num">{item?.total_written_off_amount}</td>
                </tr>
              </table>
            </div>
          </div>
          <div>
            <div>
              <img
                className="graph_monthwise"
                src={graph1}
                style={{ width: "49%", marginLeft: "10px" }}
              ></img>

              <img
                className="graph_monthwise"
                src={graph2}
                alt="graph1"
                style={{ width: "49%" }}
              ></img>
            </div>
          </div>
        </div>
      ) : (
        <Loader
          className="loader_landingpage"
          center
          size="lg"
          content="loading..."
        ></Loader>
      )}
    </div>
  );
};

export default BureauAnalyze;
