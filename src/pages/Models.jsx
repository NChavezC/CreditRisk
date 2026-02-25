import { useEffect, useMemo, useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

import MetricCard from "../ui/MetricCard";

function Models() {
  const [logistic, setLogistic] = useState(null);
  const [xgboost, setXgboost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [lrRes, xgbRes] = await Promise.all([
          fetch("/logistic_metrics.json"),
          fetch("/xgboost_metrics.json"),
        ]);

        if (!lrRes.ok) throw new Error("Could not load logistic_metrics.json");
        if (!xgbRes.ok) throw new Error("Could not load xgboost_metrics.json");

        const [lrJson, xgbJson] = await Promise.all([
          lrRes.json(),
          xgbRes.json(),
        ]);

        if (!alive) return;
        setLogistic(lrJson);
        setXgboost(xgbJson);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Failed to load model metrics.");
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

  const aucDelta = useMemo(() => {
    if (!logistic || !xgboost) return null;
    return xgboost.test_auc - logistic.test_auc;
  }, [logistic, xgboost]);

  const splitLabel =
    logistic?.validation_split || xgboost?.validation_split || "—";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-stone-800 mb-4">Models</h2>
        <p className="text-stone-600 max-w-3xl mx-auto text-lg">
          Two PD models are trained and evaluated with a time-based validation
          split to approximate forward-looking deployment performance.
        </p>
        <div className="mt-4 text-sm text-stone-500">
          Validation Split:{" "}
          <span className="font-medium text-stone-700">{splitLabel}</span>
        </div>
      </section>

      {/* Loading / Error */}
      {loading && (
        <p className="text-center text-stone-500 mb-10">
          Loading model metrics...
        </p>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mb-10 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && logistic && xgboost && (
        <>
          {/* Summary KPI cards */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Champion Model (by Test AUC)"
                value={champion?.model}
                subtitle="Forward test selection criterion"
                highlight
              />
              <MetricCard
                title="XGBoost Test AUC"
                value={xgboost.test_auc.toFixed(4)}
                subtitle={`Train AUC: ${xgboost.train_auc.toFixed(4)}`}
              />
              <MetricCard
                title="Logistic Test AUC"
                value={logistic.test_auc.toFixed(4)}
                subtitle={`Train AUC: ${logistic.train_auc.toFixed(4)}`}
              />
            </div>

            <div className="mt-6 text-center text-stone-600">
              Test AUC Delta (XGBoost − Logistic):{" "}
              <span
                className={`font-semibold ${aucDelta >= 0 ? "text-green-700" : "text-red-700"}`}
              >
                {aucDelta >= 0 ? "+" : ""}
                {aucDelta.toFixed(4)}
              </span>
            </div>
          </section>

          {/* Model definitions */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Model Definitions
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Logistic */}
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="text-lg font-semibold text-stone-800 mb-2">
                  Logistic Regression (Baseline)
                </h4>
                <p className="text-stone-600 mb-4">
                  Interpretable linear model for probability of default:{" "}
                  <InlineMath math={"\\hat{p}(x)=\\Pr(Y=1\\mid x)"} />.
                </p>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                  <BlockMath
                    math={
                      "\\hat{p}(x)=\\sigma(\\beta_0 + x^{\\top}\\beta)=\\frac{1}{1+e^{-(\\beta_0 + x^{\\top}\\beta)}}"
                    }
                  />
                </div>

                <ul className="mt-4 space-y-2 text-stone-600 list-disc list-inside">
                  <li>Good baseline and a sanity check for leakage.</li>
                  <li>Easy to explain and communicate in a risk context.</li>
                  <li>May underfit non-linearities and interactions.</li>
                </ul>
              </div>

              {/* XGBoost */}
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="text-lg font-semibold text-stone-800 mb-2">
                  XGBoost (Champion)
                </h4>
                <p className="text-stone-600 mb-4">
                  Gradient-boosted trees capture non-linear relationships and
                  feature interactions.
                </p>

                <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                  <BlockMath
                    math={
                      "f_M(x)=\\sum_{m=1}^{M} \\eta\\, h_m(x),\\qquad \\hat{p}(x)=\\sigma\\big(f_M(x)\\big)"
                    }
                  />
                </div>

                <ul className="mt-4 space-y-2 text-stone-600 list-disc list-inside">
                  <li>
                    Typically higher predictive power for tabular credit data.
                  </li>
                  <li>
                    Supports monotonic constraints (optional) and
                    regularization.
                  </li>
                  <li>
                    Needs stronger governance (explainability, stability
                    checks).
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Evaluation */}
          <section className="mb-12">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Evaluation
            </h3>

            <div className="rounded-xl border border-stone-200 bg-white p-6">
              <p className="text-stone-600 mb-4">
                Primary metric is ROC-AUC, interpreted as the probability a
                randomly chosen default receives a higher score than a randomly
                chosen non-default:
              </p>

              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6">
                <BlockMath
                  math={"\\mathrm{AUC}=\\Pr\\big(s(X^+) > s(X^-)\\big)"}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-sm text-stone-600 border-b border-stone-200">
                      <th className="py-3 pr-4 font-semibold">Model</th>
                      <th className="py-3 pr-4 font-semibold">Train AUC</th>
                      <th className="py-3 pr-4 font-semibold">Test AUC</th>
                      <th className="py-3 pr-4 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="text-stone-700">
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4">{logistic.model}</td>
                      <td className="py-3 pr-4">
                        {logistic.train_auc.toFixed(4)}
                      </td>
                      <td className="py-3 pr-4">
                        {logistic.test_auc.toFixed(4)}
                      </td>
                      <td className="py-3 pr-4">{logistic.timestamp || "—"}</td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">{xgboost.model}</td>
                      <td className="py-3 pr-4">
                        {xgboost.train_auc.toFixed(4)}
                      </td>
                      <td className="py-3 pr-4">
                        {xgboost.test_auc.toFixed(4)}
                      </td>
                      <td className="py-3 pr-4">{xgboost.timestamp || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 text-sm text-stone-500">
                Note: If you later add calibration artifacts (reliability curve
                / Brier score), this section is where they fit, alongside a
                short discussion of probability calibration.
              </div>
            </div>
          </section>

          {/* Optional artifacts */}
          <section className="mb-4">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6">
              Artifacts
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="font-semibold text-stone-800 mb-2">
                  ROC / Calibration Plots
                </h4>
                <p className="text-stone-600 mb-4">
                  If present, place the exported figures in{" "}
                  <span className="font-medium">/public</span> and reference
                  them here.
                </p>

                <div className="flex flex-col gap-4">
                  <img
                    src="/calibration.png"
                    alt="Calibration plot"
                    className="rounded-lg border border-stone-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <img
                    src="/roc.png"
                    alt="ROC curve"
                    className="rounded-lg border border-stone-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <p className="text-xs text-stone-500 mt-4">
                  (These images are optional; they will auto-hide if the files
                  don’t exist.)
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <h4 className="font-semibold text-stone-800 mb-2">
                  What to look for
                </h4>
                <ul className="space-y-2 text-stone-600 list-disc list-inside">
                  <li>Generalization gap: Train vs Test AUC.</li>
                  <li>Score calibration for stable decision thresholds.</li>
                  <li>Drift sensitivity under time-split validation.</li>
                  <li>
                    Business impact evaluated in the Decisioning page via ENV.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Models;
