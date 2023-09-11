import React, { useEffect, useState } from "react";
import NavBar from "../../utilities/navbar/navbar";
import { postApi } from "../../callapi";
import { APIADDRESS } from "../../constants/constants";
import "./executiveSummar.css";
import GaugeChart from "react-gauge-chart";
import RatioPieChart from "../../constants/ratioPieChart";
import { Loader } from "rsuite";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  MDBCard,
  MDBCardBody,
  MDBCardFooter,
  MDBCardHeader,
} from "mdb-react-ui-kit";
import BureauScoreSpeedometer from "../../constants/speedomter";
import NavBar1 from "../../utilities/navbar/navbar1";

const ExecutiveSummary = () => {
  const [bureau_details, setBureau_Details] = useState();
  const [bureau_details_calculator, setBureau_Details_calculator] = useState();

  const [total, setTotal] = useState();
  const [totalemi, setTotalemi] = useState();
  const [foirIncome, setFoirIncome] = useState();
  const [foirInflow, setFoirInflow] = useState();
  const [saveState, setSaveState] = useState(true);
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange1 = (event) => {
    setSelectedValue(event.target.value);
    handleChange();
  };

  useEffect(() => {
    postApi("analyze/" + APIADDRESS.EXECUTIVESUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      // console.log(res);
      setBureau_Details(res[0]);
      setBureau_Details_calculator(res[1][0]);
    });
  }, []);
  const Calculate = () => {
    const amount = document.getElementById("loanAmount")?.value;

    const roi1 = document.getElementById("roiCalculator")?.value;

    // Extracting value in the months
    // section in the variable
    const months = document.getElementById("monthCalculator").value;

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

  useEffect(() => {
    window.scrollTo({
      top: 150, // Replace with the desired pixel height
      behavior: "smooth", // This enables smooth scrolling
    });
  }, [bureau_details]);

  const handleChange = () => {
    setSaveState(false);
  };
  const saveCompleted = () => {
    setSaveState(true);
  };
  // console.log(saveState);

  useEffect(() => {
    localStorage.setItem("SummarySaveState", saveState);
  }, [saveState]);

  const saveExceutiveSummaryData = () => {
    const loanAmount = document.getElementById("loanAmount")?.value;
    const tenure = document.getElementById("monthCalculator")?.value;
    const roi = document.getElementById("roiCalculator")?.value;
    const newEmi = total;
    const totalEmi = totalemi;
    const foirStated = foirIncome;
    const foirInfloww = foirInflow;
    const recommendation = selectedValue;
    const notes = document.getElementById("notes")?.value;
    const dealid = bureau_details?.Deal_id;
    // console.log(notes);
    // console.log(dealid);
    const data = {
      deal_id: dealid,
      loanAmount: loanAmount,
      tenure: tenure,
      roi: roi,
      newEmi: newEmi,
      totalEmi: totalEmi,
      foirStated: foirStated,
      foirInflow: foirInfloww,
      recommendation: recommendation,
      notes: notes,
    };

    postApi("analyze/" + APIADDRESS.EXECUTIVESUMMARYSAVEFETCH, {
      data,
    });
  };
  // console.log(bureau_details);
  // console.log(bureau_details_calculator);

  useEffect(() => {
    if (bureau_details_calculator) {
      setTotal(bureau_details_calculator?.new_emi);
      setTotalemi(bureau_details_calculator?.total_emi);
      setFoirIncome(bureau_details_calculator?.foir_stated);
      setFoirInflow(bureau_details_calculator?.foir_inflow);
    }
  }, [bureau_details_calculator]);

  const formatCurrency = (value) => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return "Invalid value";
    }

    const formattedValue = numericValue.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    // Manually add a space after the rupee symbol
    const valueWithSpace = formattedValue.replace("₹", "₹ ");

    return valueWithSpace;
  };

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Function to update window size
  const handleResize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  useEffect(() => {
    // Add a resize event listener
    window.addEventListener("resize", handleResize);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  console.log(window.innerWidth);

  return (
    <div>
      <NavBar1></NavBar1>
      {bureau_details ? (
        <div className="executive-summary-container">
          <div>
            <div className="div1">
              <div
                style={{
                  display: "flex",
                  // justifyContent: "space-around",
                }}
              >
                <div className="div2">
                  {bureau_details?.creditscore >= 300 &&
                  bureau_details?.creditscore <= 900 ? (
                    <BureauScoreSpeedometer
                      score={bureau_details?.creditscore}
                    ></BureauScoreSpeedometer>
                  ) : (
                    <MDBCard className="top_cards_width">
                      <MDBCardHeader className="mbdcardHeader">
                        {bureau_details?.creditscore}
                      </MDBCardHeader>

                      <MDBCardBody className="mbdcardBody">
                        {" "}
                        Bureau Score
                      </MDBCardBody>
                    </MDBCard>
                  )}

                  <br></br>
                </div>
                <div>
                  <MDBCard className="top_cards_width">
                    <MDBCardHeader className="mbdcardHeader">
                      {bureau_details?.activeloans}
                    </MDBCardHeader>

                    <MDBCardBody className="mbdcardBody">
                      {" "}
                      Active Loans
                    </MDBCardBody>
                  </MDBCard>
                </div>
                <div>
                  <MDBCard
                    // style={{
                    //   // width: "250px",
                    //   height: "5em", // Adjust the width of the card
                    //   backgroundColor: "#f0f0f0",
                    //   boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Box shadow for uplifted effect
                    //   margin: "10px", // Margin for spacing
                    //   borderRadius: "8px", // Border radius for rounded corners
                    // }}
                    className="top_cards_width"
                  >
                    <MDBCardHeader className="mbdcardHeader">
                      {bureau_details?.totalpos}
                    </MDBCardHeader>

                    <MDBCardBody className="mbdcardBody"> Live POS</MDBCardBody>
                  </MDBCard>
                </div>

                <div>
                  <MDBCard className="top_cards_width">
                    <MDBCardHeader className="mbdcardHeader">
                      {bureau_details?.maxdpd} Days
                    </MDBCardHeader>

                    <MDBCardBody className="mbdcardBody"> Max DPD</MDBCardBody>
                  </MDBCard>
                </div>

                <div>
                  <MDBCard className="top_cards_width">
                    <MDBCardHeader className="mbdcardHeader">
                      {bureau_details?.maxdpd} Days
                    </MDBCardHeader>

                    <MDBCardBody className="mbdcardBody">
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
                // justifyContent: "space-between",
              }}
              className="div_adjusted"
            >
              <div style={{ marginLeft: "2%" }}>
                {" "}
                <div>
                  <MDBCard className="mbdcard">
                    <MDBCardHeader className="mbdcardHeader">
                      15.6
                    </MDBCardHeader>

                    <MDBCardBody className="mbdcardBody">
                      {" "}
                      Bureau Risk Score
                    </MDBCardBody>
                  </MDBCard>
                </div>
                <div className="margin_top_1st_div">
                  <MDBCard className="mbdcard">
                    <MDBCardHeader className="mbdcardHeader">3.9</MDBCardHeader>

                    <MDBCardBody className="mbdcardBody">
                      {" "}
                      Banking Based Score
                    </MDBCardBody>
                  </MDBCard>
                </div>
                <div className="margin_top_1st_div">
                  <MDBCard className="mbdcard">
                    <MDBCardHeader className="mbdcardHeader">0.6</MDBCardHeader>

                    <MDBCardBody className="mbdcardBody">
                      {" "}
                      Application Score
                    </MDBCardBody>
                  </MDBCard>
                </div>
                <div className="margin_top_1st_div">
                  <MDBCard className="mbdcard">
                    <MDBCardHeader className="mbdcardHeader">1.2</MDBCardHeader>

                    <MDBCardBody className="mbdcardBody">
                      {" "}
                      Partner Based Score
                    </MDBCardBody>
                  </MDBCard>
                </div>
              </div>
              <div className="div3">
                <div>
                  <img className="image_summary_1" src="/debit_to_credit.png" />

                  <p className="kpi_headings_11">
                    Debit to Credit Ratio : {bureau_details?.dtocratio}
                  </p>
                </div>
                <div>
                  <img className="image_summary_2" src="/debit_to_income.png" />

                  <p className="kpi_headings_2">Debit to Income Ratio : 0.6</p>
                </div>
                <div>
                  <img className="image_summary_3" src="/cash_credit.png" />

                  <p className="kpi_headings_3">
                    Cash Credit Ratio : {bureau_details?.cashcreditratio}
                  </p>
                </div>

                <div>
                  <img className="image_summary_4" src="/monthly_balance.png" />

                  <p className="kpi_headings_1">
                    Avg. Monthly Balance : {bureau_details?.last3month}
                  </p>
                </div>
                <div>
                  <img className="image_summary_5" src="/cheque_bounce.png" />

                  <p className="kpi_headings_2">
                    Chq. Bounce (Last 6M) : {bureau_details?.chequebounce}
                  </p>
                </div>
                <div>
                  <img className="image_summary_6" src="/fixed_inflow.png" />

                  <p className="kpi_headings_3">Fixed Inflows : ₹ 0</p>
                </div>
              </div>
              <div className="div4">
                <span
                  className="highlightText"
                  style={{ textAlign: "center", fontSize: "125%" }}
                >
                  {bureau_details?.Name}{" "}
                </span>
                <br></br>
                <br></br>
                <span className="values"> Age : </span>
                <span className="highlightText">45 years</span> <br></br>
                <br></br>
                <span className="values">Address :</span>
                <span className="highlightText">
                  {" "}
                  {bureau_details?.Location}.{" "}
                </span>
                <br></br>
                <br></br>
                <span className="values">Requested Loan Type : </span>
                <span className="highlightText">{bureau_details?.Purpose}</span>
                <br></br>
                <br></br>
                <span className="values">Requested Loan Amount : </span>
                <span className="highlightText">
                  {bureau_details?.Loan_amount}
                </span>
                <br></br>
                <br></br>
                <span className="values">Applicant Type : </span>
                <span className="highlightText"> Individual</span>
                <br></br>
                <br></br>
                <span className="values">Employment : </span>
                <span className="highlightText">
                  {bureau_details?.Employment}{" "}
                </span>
                <br></br>
                <br></br>
                <span className="values">Salary :</span>{" "}
                <span className="highlightText">{bureau_details?.Salary}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "3%" }} className="loan-heading">
            <h4 className="calculator-title">Loan Calculator</h4>
          </div>

          <div className="loan-calculator" style={{ fontSize: "15px" }}>
            <div className="loan-details">
              <p>
                Loan Requested &nbsp;&nbsp;:&nbsp;{bureau_details?.Loan_amount}
                &nbsp;&nbsp;&nbsp;&nbsp;
              </p>
              <p>
                Loan Considered (₹)&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;
                <input
                  type="number"
                  defaultValue={bureau_details_calculator?.loan_considered}
                  id="loanAmount"
                  className="input-field"
                />
              </p>
              <p>
                Tenure (months) :
                <input
                  type="number"
                  id="monthCalculator"
                  defaultValue={bureau_details_calculator?.tenure}
                  className="input-field"
                />
              </p>

              <p>
                Rate of interest (%) :
                <input
                  type="number"
                  id="roiCalculator"
                  defaultValue={bureau_details_calculator?.roi}
                  className="input-field"
                />
              </p>
              <br></br>
              <button
                style={{ fontWeight: "bold" }}
                className="calculate-button"
                onClick={() => {
                  handleChange();

                  Calculate();
                }}
              >
                Calculate
              </button>
            </div>
            <div className="bureau-details">
              <table>
                <tr>
                  <td className="detail-label" style={{ textAlign: "left" }}>
                    Existing EMIs
                  </td>
                  <td className="detail-value" style={{ textAlign: "right" }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;{" "}
                    {formatCurrency(bureau_details?.EMI_Sum)}
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
                    New EMIs
                  </td>
                  <td className="summary-label" style={{ textAlign: "right" }}>
                    &nbsp;&nbsp;&nbsp;&nbsp; {formatCurrency(total)}
                  </td>
                </tr>
                <tr>
                  <td className="summary-label" style={{ textAlign: "left" }}>
                    Total EMIs
                  </td>
                  <td className="summary-label" style={{ textAlign: "right" }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {formatCurrency(totalemi)}
                  </td>
                </tr>
                <tr>
                  <td className="summary-label" style={{ textAlign: "left" }}>
                    New FOIR, basis stated Income
                  </td>
                  <td className="summary-label" style={{ textAlign: "right" }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {formatCurrency(foirIncome)}
                  </td>
                </tr>
                <tr>
                  <td className="summary-label" style={{ textAlign: "left" }}>
                    New FOIR, basis Inflows
                  </td>
                  <td className="summary-label" style={{ textAlign: "right" }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {formatCurrency(foirInflow)}
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
                    <select
                      onChange={handleChange1}
                      id="recommendation"
                      value={selectedValue}
                    >
                      <option
                        style={{ color: "red" }}
                        value={bureau_details_calculator?.recommendation}
                      >
                        {bureau_details_calculator?.recommendation}
                      </option>

                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Refer">Refer</option>
                    </select>
                  </td>
                </tr>
              </table>
              <tr>
                <td
                  className="detail-label"
                  onChange={() => {
                    handleChange();
                  }}
                >
                  Notes :
                </td>
              </tr>

              <tr>
                <td>
                  <textarea
                    style={{ width: "224%", resize: "none" }}
                    placeholder="Notes"
                    id="notes"
                    rows={4}
                    defaultValue={bureau_details_calculator?.notes}
                    onChange={() => {
                      handleChange();
                    }}
                  ></textarea>
                </td>
              </tr>
              <br></br>
              <br></br>
              <br></br>
              <br></br>

              <button
                style={{ width: "30%", borderRadius: "30px" }}
                className="calculate-button"
                onClick={() => {
                  saveCompleted();
                  saveExceutiveSummaryData();
                }}
              >
                Save
              </button>
              <br></br>
              <br></br>
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
export default ExecutiveSummary;
