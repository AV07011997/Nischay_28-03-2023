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
  const [total, setTotal] = useState();
  const [totalemi, setTotalemi] = useState();
  const [foirIncome, setFoirIncome] = useState();
  const [foirInflow, setFoirInflow] = useState();
  const [saveState, setSaveState] = useState(true);
  const [selectedValue, setSelectedValue] = useState("");

  const handleChange1 = (event) => {
    setSelectedValue(event.target.value);
  };

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
  console.log(saveState);

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
    console.log(notes);
    console.log(dealid);
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
  console.log(bureau_details);

  return (
    <div>
      <NavBar1></NavBar1>
      {bureau_details ? (
        <div>
          <div>
            <div style={{ display: "flex", marginTop: "3em" }}>
              <div
                style={{
                  display: "flex",
                  // justifyContent: "space-around",
                }}
              >
                <div
                  style={{
                    marginLeft: "12%",
                    marginRight: "-9%",
                    marginBottom: "4%",
                  }}
                >
                  {/* <CircularProgressbar
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
                    }} */}
                  <BureauScoreSpeedometer score={650}></BureauScoreSpeedometer>

                  <br></br>
                </div>
                <div>
                  <MDBCard className="top_cards_width">
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
                  <MDBCard className="top_cards_width">
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
                  <MDBCard className="top_cards_width">
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
                  height: "446px",
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
                  <RatioPieChart
                    ratio={bureau_details?.cashcreditratio}
                  ></RatioPieChart>
                  <span
                    style={{
                      marginLeft: "-101px",
                      fontSize: "18px",
                      fontWeight: "bolder",
                    }}
                  >
                    Cash Credit Ratio : {bureau_details?.cashcreditratio}
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
                      ₹ 0
                    </MDBCardHeader>

                    <MDBCardBody
                      style={{
                        textAlign: "center", // Center-align the card body text
                        fontSize: "1.25rem", // Font size for card body text
                      }}
                    >
                      {" "}
                      Fixed Inflows
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
            <h6 className="calculator-title">Loan Calculator</h6>
          </div>

          <div className="loan-calculator">
            <div className="loan-details">
              <p>
                Loan Requested (₹)&nbsp;&nbsp;:{bureau_details?.Loan_amount}
                &nbsp;&nbsp;&nbsp;&nbsp;
              </p>
              <p>
                Loan Considered (₹)&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;
                <input type="number" id="loanAmount" className="input-field" />
              </p>
              <p>
                Tenure (months) :
                <input
                  type="number"
                  id="monthCalculator"
                  className="input-field"
                />
              </p>

              <p>
                Rate of interest(%) :
                <input
                  type="number"
                  id="roiCalculator"
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
                    Existing EMIs (₹)
                  </td>
                  <td className="detail-value" style={{ textAlign: "right" }}>
                    &nbsp;&nbsp;&nbsp;&nbsp;{bureau_details?.EMI_Sum}
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
                    <select
                      onChange={handleChange1}
                      id="recommendation"
                      value={selectedValue}
                    >
                      <option value="">Select</option>

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
                    onChange={() => {
                      handleChange();
                    }}
                  ></textarea>
                </td>
              </tr>

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

              <button
                style={{ width: "30%", borderRadius: "30px" }}
                className="calculate-button"
                onClick={() => {
                  window.print();
                }}
              >
                Print
              </button>
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
