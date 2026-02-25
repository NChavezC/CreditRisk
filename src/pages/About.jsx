import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

function About() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-stone-800 mb-4">About</h2>
        <p className="text-stone-600 max-w-3xl mx-auto text-lg">
          This project is an end-to-end credit risk modeling and decisioning
          framework: from data preparation and PD modeling to expected-value
          underwriting rules and portfolio optimization.
        </p>
      </section>

      {/* What this project is */}
      <section className="mb-10">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-2xl font-semibold text-stone-800 mb-4">
            Project Goal
          </h3>
          <p className="text-stone-600 mb-4">
            The goal is to demonstrate a complete decision pipeline that a risk
            team could use to: (i) estimate probability of default (PD), (ii)
            convert PD into economic value, and (iii) select an approval policy
            that maximizes expected portfolio value under explicit loss
            assumptions.
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <p className="text-stone-700 font-medium mb-2">Pipeline</p>
            <ol className="list-decimal list-inside text-stone-600 space-y-1">
              <li>Data cleaning and feature preparation</li>
              <li>Train PD models (Logistic Regression, XGBoost)</li>
              <li>Validate with time split (forward test)</li>
              <li>Compute Expected Net Value (ENV) per applicant</li>
              <li>Optimize PD threshold and study risk–return frontier</li>
              <li>Stress test sensitivity to LGD</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Validation */}
      <section className="mb-10">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-2xl font-semibold text-stone-800 mb-4">
            Validation Strategy
          </h3>
          <p className="text-stone-600 mb-4">
            The project uses a time-based split to approximate deployment
            conditions and reduce leakage:
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <BlockMath
              math={
                "\\text{Train: years }\\le 2016 \\quad \\big| \\quad \\text{Test: years }\\ge 2017"
              }
            />
          </div>

          <p className="text-stone-600 mt-4">
            Model performance is summarized primarily with ROC-AUC, while
            business relevance is evaluated in the decisioning layer using
            expected value rather than classification accuracy alone.
          </p>
        </div>
      </section>

      {/* Economic framing */}
      <section className="mb-10">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-2xl font-semibold text-stone-800 mb-4">
            Decisioning Framework
          </h3>
          <p className="text-stone-600 mb-4">
            Predictions become decisions via an expected value model. For an
            applicant with features <InlineMath math={"x"} /> and predicted PD{" "}
            <InlineMath math={"\\hat{p}(x)"} />, a generic net value form is:
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
            <BlockMath
              math={
                "\\mathrm{ENV}(x)=\\big(1-\\hat{p}(x)\\big)\\,\\Pi-\\hat{p}(x)\\,\\mathrm{LGD}\\,L"
              }
            />
          </div>

          <p className="text-stone-600 mt-4">
            The approval rule is typically a PD cutoff: approve if{" "}
            <InlineMath math={"\\mathrm{ENV}(x)>0"} /> or, equivalently, if{" "}
            <InlineMath math={"\\hat{p}(x)<\\tau"} /> for a chosen threshold{" "}
            <InlineMath math={"\\tau"} />.
          </p>
        </div>
      </section>

      {/* Assumptions & limitations */}
      <section className="mb-10">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-2xl font-semibold text-stone-800 mb-4">
            Assumptions & Limitations
          </h3>

          <ul className="list-disc list-inside text-stone-600 space-y-3">
            <li>
              <span className="font-medium">Default timing:</span> if the
              dataset does not provide when a loan defaulted, realized
              cashflow/profit must be approximated. Results should be
              interpreted as <span className="font-medium">expected</span> value
              under the specified assumptions.
            </li>
            <li>
              <span className="font-medium">LGD is scenario-based:</span> LGD is
              treated as a parameter and stress tested. Optimal policy is
              sensitive to LGD, especially when margins are thin.
            </li>
            <li>
              <span className="font-medium">
                Calibration matters for decisioning:
              </span>{" "}
              AUC measures ranking. Threshold policies also depend on
              probability calibration and stability over time.
            </li>
            <li>
              <span className="font-medium">Scope:</span> this is a
              demonstration data product. A production implementation would
              include governance (monitoring, drift detection, fairness checks,
              and model risk management documentation).
            </li>
          </ul>
        </div>
      </section>

      {/* Repo / data policy */}
      <section className="mb-10">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-2xl font-semibold text-stone-800 mb-4">
            Repository Data Policy
          </h3>
          <p className="text-stone-600 mb-4">
            Raw CSV files are not included in the GitHub repository due to size
            constraints (and GitHub’s file limits). The notebooks expect data to
            be present locally.
          </p>
        </div>
      </section>

      {/* Closing */}
      <section className="text-center text-sm text-stone-500">
        This page documents assumptions and design choices to make the results
        interpretable and reproducible.
      </section>
    </div>
  );
}

export default About;
