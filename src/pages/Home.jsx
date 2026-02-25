import { useEffect, useMemo, useState } from "react";
import MetricCard from "../ui/MetricCard";

function Home() {
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
        setError(e.message || "Failed to load metrics.");
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
      {/* Hero */}
      <section className="text-center mb-14">
        <h2 className="text-4xl font-bold text-stone-800 mb-4">
          End-to-End Credit Risk Modeling Pipeline
        </h2>
        <p className="text-stone-600 max-w-2xl mx-auto text-lg">
          A production-style framework integrating Probability of Default (PD)
          modeling, expected value decisioning, portfolio optimization, and
          stress testing.
        </p>

        <div className="mt-6 text-sm text-stone-500">
          Validation Split:{" "}
          <span className="font-medium text-stone-700">{splitLabel}</span>
        </div>
      </section>

      {/* Loading / Error */}
      {loading && (
        <p className="text-center text-stone-500 mb-12">Loading metrics...</p>
      )}

      {error && (
        <div className="max-w-2xl mx-auto mb-12 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Key Results */}
      {!loading && !error && logistic && xgboost && (
        <>
          <section className="mb-14">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6 text-center">
              Key Results
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Champion Model (Forward Test)"
                value={champion?.model}
                subtitle="Selected by highest test AUC"
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
              Delta (XGBoost − Logistic):{" "}
              <span
                className={`font-semibold ${aucDelta >= 0 ? "text-green-700" : "text-red-700"}`}
              >
                {aucDelta >= 0 ? "+" : ""}
                {aucDelta.toFixed(4)}
              </span>
            </div>
          </section>

          {/* System Diagram */}
          <section className="mb-14">
            <h3 className="text-2xl font-semibold text-stone-800 mb-6 text-center">
              System Architecture
            </h3>

            <div className="flex justify-center">
              <img
                src="/system_flow.png"
                alt="Credit Risk System Flow"
                className="max-w-3xl w-full rounded-xl border border-stone-200 shadow-sm"
                onError={(e) => {
                  // If you haven't added this image yet, fail gracefully.
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <p className="text-center text-sm text-stone-500 mt-4">
              Data → PD Model → Expected Net Value (ENV) → Threshold
              Optimization → Portfolio Frontier → LGD Sensitivity
            </p>
          </section>

          {/* Highlights */}
          <section>
            <h3 className="text-2xl font-semibold text-stone-800 mb-6 text-center">
              Methodological Highlights
            </h3>

            <div className="grid md:grid-cols-2 gap-8 text-stone-600 text-lg">
              <ul className="space-y-3 list-disc list-inside">
                <li>
                  Time-based validation to reduce leakage and mimic production
                  deployment.
                </li>
                <li>
                  Benchmark model (Logistic Regression) for interpretability and
                  baseline performance.
                </li>
                <li>XGBoost model for non-linearities and interactions.</li>
              </ul>

              <ul className="space-y-3 list-disc list-inside">
                <li>
                  Expected Net Value (ENV) decisioning using PD and LGD
                  assumptions.
                </li>
                <li>
                  PD cutoff optimization for profit-maximizing approval policy.
                </li>
                <li>
                  Risk–return frontier and LGD stress testing to quantify
                  robustness.
                </li>
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Home;
