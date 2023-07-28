import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/homepage/homepage";
import LandingPage from "./components/landingpage/landingpage";
import Upload from "./components/upload/upload";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Downloadpage from "./components/download/download";
import Bureau from "./components/bureau/bureau";
import { createBrowserHistory } from "history";
import { useState } from "react";
import AnalyzeBankSummary from "./components/analyze/bank/summary/summary";
import AnalyzeBankMonthWise from "./components/analyze/bank/month_wise/month_wise";
import AnalyzeStatement from "./components/analyze/bank/statement/statement";
import ANALYZECOUNTERPARTIES from "./components/analyze/bank/counterParties/counterparties";
// import ANALYZECOUNTERPARTIES from "./components/analyze/bank/counterParties/counterparties";
import { useEffect } from "react";
import BureauMonthwise from "./components/analyze/Bureau/Bureau_Monthwise/bureauMonthwise";

function App() {
  const history = createBrowserHistory();

  const [user, setUser] = useState();
  useEffect(() => {
    setUser(localStorage.getItem("user"));
    console.log(user);
  }, [user]);
  console.log(user);

  return (
    <div className="App">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      ></ToastContainer>
      <Router history={history}>
        <Routes>
          <Route path="/" exact element={<HomePage setUser={setUser} />} />
          <Route
            path="/home"
            element={
              user ? (
                <LandingPage setUser={setUser} />
              ) : (
                <HomePage setUser={setUser} />
              )
            }
          />
          <Route
            path="/upload/:radiovalue/:name/:uploadcount/"
            element={
              user ? (
                <Upload setUser={setUser} />
              ) : (
                <HomePage setUser={setUser} />
              )
            }
          />
          <Route
            path="/bank_customer_kpi/"
            // element={<AnalyzeBankSummary></AnalyzeBankSummary>}
            element={
              user ? (
                <AnalyzeBankSummary setUser={setUser} />
              ) : (
                <HomePage setUser={setUser} />
              )
            }
          ></Route>
          {/* <Route path="/download/:radiovalue" element={<Downloadpage />} /> */}
          <Route
            path="/bureau/:radiovalue"
            // element={<Bureau />}
            element={
              user ? (
                <Bureau setUser={setUser} />
              ) : (
                <HomePage setUser={setUser} />
              )
            }
          />
          <Route
            path="/analyzeMonthWise"
            //  element={<AnalyzeBankMonthWise />}
            element={
              user ? (
                <AnalyzeBankMonthWise setUser={setUser} />
              ) : (
                <HomePage setUser={setUser} />
              )
            }
          />
          <Route
            exact
            path="/analyzeCounterparties"
            // element={<ANALYZECOUNTERPARTIES />}
            element={
              user ? (
                <ANALYZECOUNTERPARTIES setUser={setUser} />
              ) : (
                <HomePage setUser={setUser} />
              )
            }
          />
          <Route
            path="/analyzestatement"
            // element={<AnalyzeStatement />}
            element={
              user ? (
                <AnalyzeStatement setUser={setUser} />
              ) : (
                <HomePage setUser={setUser} />
              )
            }
          ></Route>
          <Route
            path="/bureaumonthwise"
            // element={<AnalyzeStatement />}
            element={
              user ? (
                <BureauMonthwise setUser={setUser} />
              ) : (
                <HomePage setUser={setUser} />
              )
            }
          ></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
