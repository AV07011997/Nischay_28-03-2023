import React, { useEffect, useState } from "react";
import NavBar from "../../utilities/navbar/navbar";
import { postApi } from "../../callapi";
import { APIADDRESS } from "../../constants/constants";
import "./executiveSummar.css";
import GaugeChart from "react-gauge-chart";
import RatioPieChart from "../../constants/ratioPieChart";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  MDBCard,
  MDBCardBody,
  MDBCardFooter,
  MDBCardHeader,
} from "mdb-react-ui-kit";

const ExecutiveSummary = () => {
  const [bureau_details, setBureau_Details] = useState();
  const [total, setTotal] = useState();
  const [totalemi, setTotalemi] = useState();
  const [foirIncome, setFoirIncome] = useState();
  const [foirInflow, setFoirInflow] = useState();

  useEffect(() => {
    postApi("analyze/" + APIADDRESS.EXECUTIVESUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      setBureau_Details(res);
    });
  }, []);
  const Calculate = () => {
    const amount = document.getElementById("loanAmount")?.value;

    const roi1 = document.getElementById("roiCalculator")?.value;

    // Extracting value in the months
    // section in the variable
    const months = document.getElementById("monthCalculator").value;
    console.log(roi1, months, amount);

    parseInt(amount);
    parseInt(roi1);
    parseInt(months);
    const roi = roi1 / 100 / 12;

    const total = (
      amount *
      roi *
      (Math.pow(1 + roi, months) / (Math.pow(1 + roi, months) - 1))
    ).toFixed(2);

    setTotal(Math.ceil(total));
    FoirCalculation(total);
  };

  const FoirCalculation = (total) => {
    var existingemisum = 8900;
    var totalEMI = existingemisum + parseInt(total);
    setTotalemi(totalEMI);
    NewFoirStated(totalEMI);
  };

  const NewFoirStated = (totalemi) => {
    var salary = 50000;
    var newFoirIncome = ((totalemi / salary) * 100).toFixed(0);

    setFoirIncome(newFoirIncome);
    var averageMonthlyCredit = 10000;
    var newFoirInflow = ((totalemi / averageMonthlyCredit) * 100).toFixed(0);
    setFoirInflow(newFoirInflow);
  };

  return (
    <div>
      <NavBar></NavBar>
      <div>
        <div style={{ display: "flex", marginTop: "3em" }}>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              marginLeft: "10%",
              marginRight: "10%",
            }}
          >
            <div style={{ display: "grid" }}>
              <CircularProgressbar
                value={650}
                circleRatio={0.5}
                strokeWidth={15}
                minValue={0}
                maxValue={900}
                text={
                  bureau_details?.creditscore === "No Credit Score"
                    ? 0
                    : bureau_details?.creditscore
                }
                styles={{
                  root: {
                    width: "12em",
                    height: "12em",
                    transform: "rotate(0.75turn)",
                  },
                  path: { stroke: "green", strokeLinecap: "butt" },
                  trail: { stroke: "#C4C4C4", strokeLinecap: "butt" },
                  trailColor: "grey",
                  backgroundColor: "red",
                  text: {
                    // Rotate the text within the CircularProgressbar
                    transform: "rotate(90deg)",
                    transformOrigin: "center",
                  },
                }}
              />
              <br></br>
              <span
                style={{
                  marginTop: "-5em",
                  textAlign: "center",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {" "}
                Bureau Score{" "}
              </span>
            </div>
            <div>
              <MDBCard
                style={{
                  // width: "250px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
                className="top_cards_width"
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  {bureau_details?.activeloans}
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Active Loans
                </MDBCardBody>
              </MDBCard>
            </div>
            <div>
              <MDBCard
                style={{
                  // width: "250px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
                className="top_cards_width"
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  {bureau_details?.totalpos}
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Live POS
                </MDBCardBody>
              </MDBCard>
            </div>

            <div>
              <MDBCard
                style={{
                  // width: "250px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
                className="top_cards_width"
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  {bureau_details?.maxdpd} Days
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Max DPD
                </MDBCardBody>
              </MDBCard>
            </div>

            <div>
              <MDBCard
                style={{
                  // width: "250px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
                className="top_cards_width"
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  {bureau_details?.maxdpd} Days
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Recent DPD
                </MDBCardBody>
              </MDBCard>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "-3%",
            justifyContent: "space-between",
          }}
        >
          <div style={{ marginLeft: "2%" }}>
            {" "}
            <div>
              <MDBCard
                style={{
                  width: "200px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  15.6
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Bureau Risk Score
                </MDBCardBody>
              </MDBCard>
            </div>
            <div className="margin_top_1st_div">
              <MDBCard
                style={{
                  width: "200px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  3.9
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Banking Based Score
                </MDBCardBody>
              </MDBCard>
            </div>
            <div className="margin_top_1st_div">
              <MDBCard
                style={{
                  width: "200px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  0.6
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Application Score
                </MDBCardBody>
              </MDBCard>
            </div>
            <div className="margin_top_1st_div">
              <MDBCard
                style={{
                  width: "200px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  1.2
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Partner Based Score
                </MDBCardBody>
              </MDBCard>
            </div>
          </div>
          <div
            style={{
              border: "1px solid #C4C4C4",
              borderRadius: "10px",
              display: "flex",
              flexWrap: "wrap",
              width: "64em",
              height: "402px",
              marginTop: "10px",
              marginLeft: "0",
            }}
          >
            <div className="element_piechart">
              <RatioPieChart
                // style={{ strokeWidth: "15px" }}
                ratio={bureau_details?.dtocratio}
              ></RatioPieChart>
              <span
                style={{
                  marginLeft: "-101px",
                  fontSize: "18px",
                  fontWeight: "bolder",
                }}
              >
                Debit to Credit Ratio : {bureau_details?.dtocratio}
              </span>
            </div>
            <div className="element_piechart">
              <RatioPieChart ratio={0.6}></RatioPieChart>
              <span
                style={{
                  marginLeft: "-101px",
                  fontSize: "18px",
                  fontWeight: "bolder",
                }}
              >
                Debit to Income Ratio : 0.6
              </span>
            </div>
            <div className="element_piechart">
              <RatioPieChart ratio={2}></RatioPieChart>
              <span
                style={{
                  marginLeft: "-101px",
                  fontSize: "18px",
                  fontWeight: "bolder",
                }}
              >
                Cash Credit Ratio : 2
              </span>
            </div>

            <div className="element_2">
              <MDBCard
                style={{
                  width: "200px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  {bureau_details?.last3month}
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Avg. Monthly Balance
                </MDBCardBody>
              </MDBCard>
            </div>
            <div className="element_2">
              <MDBCard
                style={{
                  width: "200px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  {bureau_details?.chequebounce}
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Chq. Bounce (Last 6M)
                </MDBCardBody>
              </MDBCard>
            </div>
            <div className="element_2">
              <MDBCard
                style={{
                  width: "200px",
                  height: "5em", // Adjust the width of the card
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                  margin: "10px", // Margin for spacing
                  borderRadius: "8px", // Border radius for rounded corners
                }}
              >
                <MDBCardHeader
                  style={{
                    textAlign: "center", // Center-align the heading
                    fontSize: "1.5rem", // Increase font size for heading
                    fontWeight: "bold", // Make the heading bold
                  }}
                >
                  0
                </MDBCardHeader>

                <MDBCardBody
                  style={{
                    textAlign: "center", // Center-align the card body text
                    fontSize: "1.25rem", // Font size for card body text
                  }}
                >
                  {" "}
                  Fixed Outflows
                </MDBCardBody>
              </MDBCard>
            </div>
          </div>
          <div
            style={{
              background: "#f0f0f0",
              borderRadius: "3%",
              marginTop: "9px",
              marginRight: "1%",
              fontSize: "123%",
              padding: "1%",
              // textAlign: "centre",
            }}
          >
            <span
              className="highlightText"
              style={{ textAlign: "center", fontSize: "125%" }}
            >
              {bureau_details?.Name}{" "}
            </span>
            <br></br>
            <br></br>
            <span className="values"> Age :</span>
            <span className="highlightText">45 years</span> <br></br>
            <br></br>
            <span className="values">Address :</span>
            <span className="highlightText"> {bureau_details?.Location}. </span>
            <br></br>
            <br></br>
            <span className="values">Requested Loan Type :</span>
            <span className="highlightText">{bureau_details?.Purpose}</span>
            <br></br>
            <br></br>
            <span className="values">Requested Loan Amount :</span>
            <span className="highlightText">{bureau_details?.Loan_amount}</span>
            <br></br>
            <br></br>
            <span className="highlightText">
              {" "}
              Individual applicant of the loan.
            </span>
            <br></br>
            <br></br>
            <span className="values">Employment :</span>
            <span className="values">{bureau_details?.Salaried} </span>
            <br></br>
            <br></br>
            <span className="values">Salary :</span>{" "}
            <span className="highlightText"> ₹ 50,000</span>
            <span className="values">{bureau_details?.Salary} (Stated)</span>
          </div>
        </div>
      </div>

      {/* <div className="outerbox" style={{ display: "flex" }}>
        <div className="innertxtandbox">
          <div className="innertxt">
            <h6>Personal and Loan Details</h6>
          </div>

          <div className="innerbox">
            1.<span className="values">{bureau_details?.Name} </span>is{" "}
            <span className="values"> Age </span> years old and lives in
            <span className="values"> {bureau_details?.Location}. </span>
            <br />
            <br />
            2.<span className="values"> {bureau_details?.Name} </span>has
            applied for{" "}
            <span className="values">{bureau_details?.Purpose}</span> and{" "}
            <span className="values">{bureau_details?.Loan_amount}</span>
            <br />
            <br />
            3. <span className="values">{bureau_details?.Name} </span> is
            Individual/Joint applicant of the loan.
            <br />
            <br />
            4.<span className="values">{bureau_details?.Name} </span> is{" "}
            <span className="values">{bureau_details?.Salaried} </span>
            <br />
            <br />
            5.Applicant earns{" "}
            <span className="values">{bureau_details?.Salary} (Stated)</span>
          </div>
        </div>

        <div className="innertxtandbox">
          <div className="innertxt">
            <h6>Bureau Details</h6>
          </div>

          <div className="innerbox">
            1. Credit Bureau Score :
            <span className="values">{bureau_details?.creditscore}</span>
            <br />
            <br />
            2. Total number of active loans :{" "}
            <span className="values">{bureau_details?.activeloans}</span>
            <br />
            <br />
            3. Total live POS :{" "}
            <span className="values">{bureau_details?.totalpos}</span>
            <br />
            <br />
            4. Most Recent DPD :{" "}
            <span className="values">{bureau_details?.maxdpd} days. </span>
            <br />
            <br />
            5. Max dpd :{" "}
            <span className="values">{bureau_details?.maxdpd} days.</span>
            <br />
            <br />
            <br />
            <br />
          </div>
        </div>

        <div className="innertxtandbox">
          <div className="innertxt">
            <h6>Banking</h6>
          </div>

          <div className="innerbox">
            1. Latest Month Closing Balance :
            <span className="values">{bureau_details?.closingbalance}</span>
            <br />
            <br />
            2. Average Monthly Balance :
            <span className="values">{bureau_details?.last3month}</span>
            <br />
            <br />
            3. Debit to Credit Ratio(3M) :{" "}
            <span className="values">{bureau_details?.dtocratio} </span>
            <br />
            <br />
            4. Fixed Inflows =
            <br />
            <br />
            5.Fixed Outflows
            <br />
            <br />
            6. Debt to Income Ratio
            <br />
            <br />
            7. Cheque Bounce (Last 6M) :
            <span className="values">{bureau_details?.chequebounce} </span>
            <br />
            <br />
            8. Cash Credit Ratio::
            <span className="values">{bureau_details?.cashcreditratio} %</span>
            <br />
            <br />
          </div>
        </div>

        <div className="innertxtandbox">
          <div className="innertxt">
            <h6>Lending Scores</h6>
          </div>

          <div className="innerbox" style={{ width: "210px" }}>
            1. Bureau Risk Score
            <br />
            <br />
            2. Banking Based Score
            <br />
            <br />
            3. Application Score
            <br />
            <br />
            4. Alternate Partner Score
            <br />
            <br />
          </div>
        </div>
      </div> */}

      <div style={{ marginTop: "3%" }} className="loan-heading">
        <h6 className="calculator-title">Loan Calculator</h6>
      </div>

      <div className="loan-calculator">
        <div className="loan-details">
          <p>
            Loan Requested (₹)&nbsp;&nbsp;: 1,00,000&nbsp;&nbsp;&nbsp;&nbsp;
          </p>
          <p>
            Loan Considered (₹)&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="number" id="loanAmount" className="input-field" />
          </p>
          <p>
            Tenure (months) :
            <input type="number" id="monthCalculator" className="input-field" />
          </p>

          <p>
            Rate of interest(%) :
            <input type="number" id="roiCalculator" className="input-field" />
          </p>
          <br></br>
          <button
            style={{ fontWeight: "bold" }}
            className="calculate-button"
            onClick={() => Calculate()}
          >
            Calculate
          </button>
        </div>
        <div className="bureau-details">
          <table>
            <tr>
              <td className="detail-label" style={{ textAlign: "left" }}>
                Existing EMIs (₹)
              </td>
              <td className="detail-value" style={{ textAlign: "right" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;{bureau_details?.totalemi}
              </td>
            </tr>
            <tr>
              <td className="detail-label" style={{ textAlign: "left" }}>
                FOIR, basis stated Income
              </td>
              <td className="detail-value" style={{ textAlign: "right" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;{bureau_details?.foirstated}
              </td>
            </tr>
            <tr>
              <td className="detail-label" style={{ textAlign: "left" }}>
                FOIR, basis Inflows
              </td>
              <td className="detail-value" style={{ textAlign: "right" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;
                {bureau_details?.averagemonthlycreditratio}
              </td>
            </tr>
            <tr>
              <td className="summary-label" style={{ textAlign: "left" }}>
                New EMIs (₹)
              </td>
              <td className="summary-label" style={{ textAlign: "right" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;{total}
              </td>
            </tr>
            <tr>
              <td className="summary-label" style={{ textAlign: "left" }}>
                Total EMIs (₹)
              </td>
              <td className="summary-label" style={{ textAlign: "right" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;{totalemi}
              </td>
            </tr>
            <tr>
              <td className="summary-label" style={{ textAlign: "left" }}>
                New FOIR, basis stated Income
              </td>
              <td className="summary-label" style={{ textAlign: "right" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;{foirIncome}
              </td>
            </tr>
            <tr>
              <td className="summary-label" style={{ textAlign: "left" }}>
                New FOIR, basis Inflows
              </td>
              <td className="summary-label" style={{ textAlign: "right" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;{foirInflow}
              </td>
            </tr>
          </table>
        </div>
        <div className="recommendation_box">
          <table>
            <tr>
              <td className="detail-label" style={{ textAlign: "left" }}>
                Recommendation :
              </td>
              <td className="summary-value" style={{ textAlign: "right" }}>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <select>
                  <option value="">Yes</option>

                  <option value="option2">No</option>
                  <option value="option3">Refer</option>
                </select>
              </td>
            </tr>
          </table>
          <tr>
            <td className="detail-label">Notes :</td>
          </tr>
          <br></br>

          <tr>
            <td>
              <textarea
                style={{ width: "200%" }}
                placeholder="Notes"
                rows={4}
              ></textarea>
            </td>
          </tr>

          <button
            style={{ width: "30%", borderRadius: "30px" }}
            className="calculate-button"
          >
            Save
          </button>
          <br></br>
          <br></br>

          <button
            style={{ width: "30%", borderRadius: "30px" }}
            className="calculate-button"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExecutiveSummary;
