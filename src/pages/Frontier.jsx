import { useEffect, useMemo, useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

import MetricCard from "../ui/MetricCard";

function Frontier() {
  const [logistic, setLogistic] = useState(null);
  const [xgboost, setXgboost] = useState(null);

  // Cards come from this file (per your note)
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
          safeFetchJson("/decisioning_metrics.json"), // <-- source of KPI card variables
        ]);

        if (!lr) throw new Error("Could not load logistic_metrics.json");
        if (!xgb) throw new Error("Could not load xgboost_metrics.json");

        if (!alive) return;
        setLogistic(lr);
        setXgboost(xgb);
        setDecisioning(dec);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Failed to load frontier inputs.");
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

  // Helpers to avoid rendering "undefined"
  const valOrDash = (v) => (v === null || v === undefined ? "—" : v);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-stone-800 mb-4">
          Risk–Return Frontier
        </h2>
        <p className="text-stone-600 max-w-3xl mx-auto text-lg">
          The frontier summarizes the trade-off between expected portfolio value
          and risk as the approval threshold varies over predicted PD scores.
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
              Frontier Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Champion PD Model"
                value={champion?.model}
                subtitle="Selected by forward test AUC"
                highlight
              />

              <MetricCard
                title="Optimal Approval Rate"
                value={valOrDash(decisioning?.approval_rate_opt)}
                subtitle="At max expected value"
              />

              <MetricCard
                title="Max Expected Value"
                value={valOrDash(decisioning?.portfolio_env_opt)}
                subtitle="From decisioning_metrics.json"
              />
            </div>

            {!decisioning && (
              <div className="mt-6 text-center text-sm text-stone-500">
                Missing{" "}
                <code className="px-1 rounded bg-stone-100">
                  /decisioning_metrics.json
                </code>{" "}
                — KPI cards show <span className="font-medium">—</span>.
              </div>
            )}
          </section>

          {/* Definition */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Definition
            </h3>

            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <p className="text-stone-600 mb-4">
                For a threshold <InlineMath math={"\\tau"} />, define an
                approval set{" "}
                <InlineMath
                  math={"\\mathcal{A}(\\tau)=\\{i:\\hat{p}_i<\\tau\\}"}
                />
                . The portfolio expected value is:
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
                <BlockMath
                  math={
                    "V(\\tau)=\\sum_{i\\in \\mathcal{A}(\\tau)} \\mathrm{ENV}_i"
                  }
                />
              </div>

              <p className="text-stone-600 mb-4">
                A simple risk proxy is the average predicted PD among approved
                loans:
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <BlockMath
                  math={
                    "R(\\tau)=\\frac{1}{|\\mathcal{A}(\\tau)|}\\sum_{i\\in \\mathcal{A}(\\tau)} \\hat{p}_i"
                  }
                />
              </div>

              <p className="text-sm text-stone-500 mt-4">
                The frontier is the curve traced by{" "}
                <InlineMath math={"(R(\\tau),\\,V(\\tau))"} /> as{" "}
                <InlineMath math={"\\tau"} /> varies.
              </p>
            </div>
          </section>

          {/* Plot */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Frontier Plot
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <img
                  src="/risk_return_frontier.png"
                  alt="Risk–Return Frontier"
                  className="rounded-lg border border-stone-200 w-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <p className="text-xs text-stone-500 mt-4">
                  (Auto-hides if <code>/frontier.png</code> does not exist.)
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="font-semibold text-stone-800 mb-2">
                  How to interpret
                </h4>
                <ul className="space-y-2 text-stone-600 list-disc list-inside">
                  <li>
                    Moving along the curve corresponds to changing the PD
                    approval threshold <InlineMath math={"\\tau"} />.
                  </li>
                  <li>
                    Value may rise initially with higher approval, then fall as
                    marginal loans become unprofitable.
                  </li>
                  <li>
                    The “best” point depends on risk appetite, constraints, and
                    the LGD assumption.
                  </li>
                  <li>
                    Use the LGD Sensitivity page to test how stable the frontier
                    is under different LGD values.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Optional: show decisioning JSON details */}
          {decisioning && (
            <section>
              <h3 className="text-2xl font-semibold text-stone-800 mb-6">
                Decisioning Metrics
              </h3>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Optimal PD Threshold"
                    value={valOrDash(decisioning.pd_threshold_opt)}
                    subtitle="Cutoff at optimum"
                  />
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Frontier;
