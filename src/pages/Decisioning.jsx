import { useEffect, useMemo, useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

import MetricCard from "../ui/MetricCard";

function Decisioning() {
  const [logistic, setLogistic] = useState(null);
  const [xgboost, setXgboost] = useState(null);

  // Optional (if you export these later)
  const [decisioning, setDecisioning] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function safeFetchJson(path) {
      try {
        const res = await fetch(path);
        if (!res.ok) return null; // optional file
        return await res.json();
      } catch {
        return null;
      }
    }

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [lr, xgb, dec] = await Promise.all([
          safeFetchJson("/logistic_metrics.json"),
          safeFetchJson("/xgboost_metrics.json"),
          safeFetchJson("/decisioning_metrics.json"), // optional
        ]);

        if (!lr) throw new Error("Could not load logistic_metrics.json");
        if (!xgb) throw new Error("Could not load xgboost_metrics.json");

        if (!alive) return;
        setLogistic(lr);
        setXgboost(xgb);
        setDecisioning(dec);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Failed to load decisioning inputs.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const champion = useMemo(() => {
    if (!logistic || !xgboost) return null;
    return xgboost.test_auc >= logistic.test_auc ? xgboost : logistic;
  }, [logistic, xgboost]);

  const splitLabel =
    logistic?.validation_split || xgboost?.validation_split || "—";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-stone-800 mb-4">Decisioning</h2>
        <p className="text-stone-600 max-w-3xl mx-auto text-lg">
          Convert predicted probability of default (PD) into an approval rule
          using an <span className="font-medium">Expected Net Value</span> (ENV)
          framework and a PD threshold.
        </p>
        <div className="mt-4 text-sm text-stone-500">
          Validation Split:{" "}
          <span className="font-medium text-stone-700">{splitLabel}</span>
        </div>
      </section>

      {/* Loading / Error */}
      {loading && (
        <p className="text-center text-stone-500 mb-10">Loading...</p>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mb-10 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && logistic && xgboost && (
        <>
          {/* KPI Row */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6 text-center">
              Decision Inputs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Champion PD Model"
                value={champion?.model}
                subtitle="Selected by forward test AUC"
                highlight
              />

              <MetricCard
                title="PD Threshold (Optimal)"
                value={
                  decisioning?.pd_threshold_opt != null
                    ? decisioning.pd_threshold_opt
                    : "—"
                }
                subtitle="Maximizes expected value (if exported)"
              />

              <MetricCard
                title="Approval Rate (at Optimal)"
                value={
                  decisioning?.approval_rate_opt != null
                    ? decisioning.approval_rate_opt
                    : "—"
                }
                subtitle="Share of applicants approved"
              />
            </div>
          </section>

          {/* ENV Definition */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Expected Net Value (ENV)
            </h3>

            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <p className="text-stone-600 mb-4">
                For an applicant with features <InlineMath math={"x"} /> and
                predicted <InlineMath math={"\\hat{p}(x)"} />, define a per-loan
                expected net value:
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
                <BlockMath
                  math={
                    "\\mathrm{ENV}(x)=\\big(1-\\hat{p}(x)\\big)\\,\\Pi - \\hat{p}(x)\\,\\mathrm{LGD}\\,L"
                  }
                />
              </div>

              <ul className="space-y-2 text-stone-600 list-disc list-inside">
                <li>
                  <InlineMath math={"\\Pi"} />: expected profit if the loan does{" "}
                  <span className="font-medium">not</span> default (interest
                  margin, fees, etc.).
                </li>
                <li>
                  <InlineMath math={"L"} />: exposure (e.g., loan amount).
                </li>
                <li>
                  <InlineMath math={"\\mathrm{LGD}\\in[0,1]"} />: loss given
                  default (fraction of exposure lost).
                </li>
              </ul>

              <p className="text-stone-600 mt-6">
                The simplest approval rule is a PD cutoff:
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mt-3">
                <BlockMath
                  math={
                    "\\text{Approve if } \\mathrm{ENV}(x) > 0 \\quad \\Leftrightarrow \\quad \\hat{p}(x) < \\tau"
                  }
                />
              </div>

              <p className="text-sm text-stone-500 mt-4">
                In practice, <InlineMath math={"\\tau"} /> can be tuned to
                maximize portfolio expected value (next section).
              </p>
            </div>
          </section>

          {/* Threshold Optimization */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Threshold Optimization
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="font-semibold text-stone-800 mb-2">Objective</h4>
                <p className="text-stone-600 mb-4">
                  Choose a threshold <InlineMath math={"\\tau"} /> over PD
                  scores to maximize expected portfolio value:
                </p>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                  <BlockMath
                    math={
                      "\\max_{\\tau}\\; \\sum_{i=1}^{N} \\mathbf{1}\\{\\hat{p}_i < \\tau\\}\\,\\mathrm{ENV}_i"
                    }
                  />
                </div>

                <ul className="mt-4 space-y-2 text-stone-600 list-disc list-inside">
                  <li>Lower thresholds approve fewer loans (lower risk).</li>
                  <li>
                    Higher thresholds increase volume but may destroy value.
                  </li>
                  <li>Optimal cutoff depends on LGD and profit assumptions.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="font-semibold text-stone-800 mb-2">
                  Optimal Threshold Visualization
                </h4>

                <img
                  src="/optimal_threshold.png"
                  alt="Threshold optimization"
                  className="rounded-lg border border-stone-200 w-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </section>

          {/* Practical Notes / Assumptions */}
          <section>
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Assumptions & Practical Notes
            </h3>

            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <ul className="space-y-3 text-stone-600 list-disc list-inside">
                <li>
                  If default timing is unknown, realized profit is approximated;
                  the decision rule should be interpreted as{" "}
                  <span className="font-medium">expected</span> value under your
                  assumptions.
                </li>
                <li>
                  Threshold optimization is sensitive to{" "}
                  <InlineMath math={"\\mathrm{LGD}"} /> and profit assumptions.
                  The LGD Sensitivity page stress-tests this explicitly.
                </li>
                <li>
                  AUC measures ranking quality; decisioning quality additionally
                  depends on calibration and stability.
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Decisioning;
