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
import ANALYZECOUNTERPARTIES from "./components/analyze/bank/counterparties/counterparties";
import AnalyzeStatement from "./components/analyze/bank/statement/statement";

function App() {
  const history = createBrowserHistory();

  const [info, setinfo] = useState([]);
  // console.log(info);

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
          <Route path="/" exact element={<HomePage />} />
          <Route path="/home" element={<LandingPage setinfo={setinfo} />} />
          <Route
            path="/upload/:radiovalue/:name/:uploadcount/"
            element={<Upload />}
          />
          <Route
            path="/bank_customer_kpi/"
            element={<AnalyzeBankSummary></AnalyzeBankSummary>}
          ></Route>
          {/* <Route path="/download/:radiovalue" element={<Downloadpage />} /> */}
          <Route path="/bureau/:radiovalue" element={<Bureau info={info} />} />
          <Route path="/analyzeMonthWise" element={<AnalyzeBankMonthWise />} />
          <Route
            exact
            path="/analyzeCounterparties"
            element={<ANALYZECOUNTERPARTIES />}
          />
          <Route
            path="/analyzestatement"
            element={<AnalyzeStatement />}
          ></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
