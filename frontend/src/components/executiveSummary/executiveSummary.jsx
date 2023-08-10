import React, { useEffect, useState } from "react";
import NavBar from "../../utilities/navbar/navbar";
import { postApi } from "../../callapi";
import { APIADDRESS } from "../../constants/constants";
import "./executiveSummar.css";

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import {
  MDBCard,
  MDBCardBody,
  MDBCardFooter,
  MDBCardHeader,
} from "mdb-react-ui-kit";

const ExecutiveSummary = () => {
  const [bureau_details, setBureau_Details] = useState();
  useEffect(() => {
    postApi("analyze/" + APIADDRESS.EXECUTIVESUMMARY, {
      leadID: localStorage.getItem("leadID"),
    }).then((res) => {
      setBureau_Details(res);
    });
  }, []);

  return (
    <div>
      <NavBar></NavBar>
      <div>
        <div style={{ display: "flex", marginTop: "3em" }}>
          <div style={{ display: "grid", marginLeft: "2em" }}>
            <CircularProgressbar
              //   value={
              //     bureau_details?.creditscore === "No Credit Score"
              //       ? 0
              //       : bureau_details?.creditscore
              //   }
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
              }}
            />
            <span style={{ marginTop: "-5em", textAlign: "center" }}>
              {" "}
              Bureau Score{" "}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              marginLeft: "4em",
            }}
          >
            <div>
              <MDBCard
                style={{
                  width: "250px",
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
                  width: "250px",
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
                  width: "250px",
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
                  width: "250px",
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
        <div style={{ justifyContent: "space-between" }}>
          <div style={{ marginTop: "2em" }}>
            {" "}
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
          <div style={{ marginTop: "2em" }}>
            {" "}
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
          <div style={{ marginTop: "2em" }}>
            {" "}
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
          <div style={{ marginTop: "2em" }}>
            {" "}
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
      </div>

      <div className="outerbox" style={{ display: "flex" }}>
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
            {/* 6. Time since recently closed loan :
            <span className="values">
              {bureau_details?.recentlyclosedloandate} months.
            </span> */}
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
      </div>
    </div>
  );
};
export default ExecutiveSummary;
