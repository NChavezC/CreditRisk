import { useEffect, useMemo, useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

import MetricCard from "../ui/MetricCard";

function LGD() {
  const [logistic, setLogistic] = useState(null);
  const [xgboost, setXgboost] = useState(null);
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
          safeFetchJson("/decisioning_metrics.json"), // optional but preferred
        ]);

        if (!lr) throw new Error("Could not load logistic_metrics.json");
        if (!xgb) throw new Error("Could not load xgboost_metrics.json");

        if (!alive) return;
        setLogistic(lr);
        setXgboost(xgb);
        setDecisioning(dec);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Failed to load LGD inputs.");
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

  const valOrDash = (v) => (v === null || v === undefined ? "—" : v);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-stone-800 mb-4">
          LGD Sensitivity
        </h2>
        <p className="text-stone-600 max-w-3xl mx-auto text-lg">
          Stress test portfolio decisions under varying Loss Given Default
          (LGD). This quantifies how robust the approval rule and expected
          portfolio value are to recovery assumptions.
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
              Sensitivity Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Champion PD Model"
                value={champion?.model}
                subtitle="Selected by forward test AUC"
                highlight
              />

              <MetricCard
                title="Baseline LGD Assumption"
                value={valOrDash(decisioning?.lgd_assumption)}
                subtitle="Used for main threshold/EPV results"
              />

              <MetricCard
                title="Optimal PD Threshold (Baseline LGD)"
                value={valOrDash(decisioning?.pd_threshold_opt)}
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
              What is LGD?
            </h3>

            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <p className="text-stone-600 mb-4">
                LGD is the fraction of exposure lost conditional on default:
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
                <BlockMath
                  math={
                    "\\mathrm{LGD}=1-\\mathrm{Recovery\\ Rate} \\quad \\in[0,1]"
                  }
                />
              </div>

              <p className="text-stone-600 mb-4">
                In the ENV framework, LGD scales the loss term:
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <BlockMath
                  math={
                    "\\mathrm{ENV}(x)=\\big(1-\\hat{p}(x)\\big)\\,\\Pi-\\hat{p}(x)\\,\\mathrm{LGD}\\,L"
                  }
                />
              </div>

              <p className="text-sm text-stone-500 mt-4">
                Higher LGD makes defaults more costly, shifting the optimal
                approval threshold downward.
              </p>
            </div>
          </section>

          {/* Plots */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Sensitivity Plots
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Approval rate vs LGD */}
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="font-semibold text-stone-800 mb-2">
                  Approval Rate vs LGD
                </h4>
                <p className="text-stone-600 mb-4">
                  As LGD increases, optimal approval typically declines because
                  marginal loans become less valuable.
                </p>

                <img
                  src="/approval_rate_vs_LGD.png"
                  alt="Approval rate vs LGD"
                  className="rounded-lg border border-stone-200 w-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <p className="text-xs text-stone-500 mt-4">
                  (Auto-hides if <code>/approval_rate_vs_LGD.png</code> does not
                  exist.)
                </p>
              </div>

              {/* EPV vs LGD */}
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="font-semibold text-stone-800 mb-2">
                  Expected Portfolio Value vs LGD
                </h4>
                <p className="text-stone-600 mb-4">
                  This shows how sensitive the maximum achievable EPV is to
                  recovery assumptions.
                </p>

                <img
                  src="/epv_vs_LGD.png"
                  alt="Expected portfolio value vs LGD"
                  className="rounded-lg border border-stone-200 w-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <p className="text-xs text-stone-500 mt-4">
                  (Auto-hides if <code>/epv_vs_LGD.png</code> does not exist.)
                </p>
              </div>
            </div>
          </section>

          {/* Interpretation */}
          <section>
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Interpretation
            </h3>

            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <ul className="space-y-3 text-stone-600 list-disc list-inside">
                <li>
                  If the curves change sharply for small changes in LGD, your
                  decision policy is{" "}
                  <span className="font-medium">fragile</span> to recovery
                  assumptions.
                </li>
                <li>
                  A stable policy shows smooth monotonic behavior and a
                  consistent region of near-optimal thresholds.
                </li>
                <li>
                  In practice, you can set guardrails (e.g., max approval rate,
                  minimum margin, conservative LGD) to reduce sensitivity.
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default LGD;
