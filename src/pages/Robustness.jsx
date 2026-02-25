import { useEffect, useMemo, useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

import MetricCard from "../ui/MetricCard";

function Robustness() {
  const [baselineLR, setBaselineLR] = useState(null);
  const [baselineXGB, setBaselineXGB] = useState(null);
  const [robustLR, setRobustLR] = useState(null);
  const [robustXGB, setRobustXGB] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function fetchJson(path, required = true) {
      const res = await fetch(path);
      if (!res.ok) {
        if (required) throw new Error(`Could not load ${path}`);
        return null;
      }
      return await res.json();
    }

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [lr0, xgb0, lr1, xgb1] = await Promise.all([
          fetchJson("/logistic_metrics.json", true),
          fetchJson("/xgboost_metrics.json", true),
          fetchJson("/logistic_robust_metrics.json", true),
          fetchJson("/xgboost_robust_metrics.json", true),
        ]);

        if (!alive) return;
        setBaselineLR(lr0);
        setBaselineXGB(xgb0);
        setRobustLR(lr1);
        setRobustXGB(xgb1);
      } catch (e) {
        if (!alive) return;
        setError(e.message || "Failed to load robustness metrics.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const splitLabel =
    baselineLR?.validation_split ||
    baselineXGB?.validation_split ||
    robustLR?.validation_split ||
    robustXGB?.validation_split ||
    "—";

  const delta = useMemo(() => {
    if (!baselineLR || !baselineXGB || !robustLR || !robustXGB) return null;

    return {
      lr_test: robustLR.test_auc - baselineLR.test_auc,
      lr_train: robustLR.train_auc - baselineLR.train_auc,
      xgb_test: robustXGB.test_auc - baselineXGB.test_auc,
      xgb_train: robustXGB.train_auc - baselineXGB.train_auc,
    };
  }, [baselineLR, baselineXGB, robustLR, robustXGB]);

  const fmt = (x) =>
    x === null || x === undefined ? "—" : Number(x).toFixed(4);
  const fmtSigned = (x) => {
    if (x === null || x === undefined) return "—";
    const v = Number(x);
    return `${v >= 0 ? "+" : ""}${v.toFixed(4)}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-stone-800 mb-4">
          Robustness Check
        </h2>
        <p className="text-stone-600 max-w-3xl mx-auto text-lg">
          We test model stability by removing{" "}
          <span className="font-medium">interest rate</span> as a feature and
          comparing performance against the baseline specification.
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

      {!loading &&
        !error &&
        baselineLR &&
        baselineXGB &&
        robustLR &&
        robustXGB && (
          <>
            {/* KPI Row */}
            <section className="mb-12">
              <h3 className="text-2xl font-semibold text-stone-800 mb-6 text-center">
                Performance Impact (No Interest Rate)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                  title="Baseline XGBoost Test AUC"
                  value={fmt(baselineXGB.test_auc)}
                  subtitle={`Train AUC: ${fmt(baselineXGB.train_auc)}`}
                  highlight
                />

                <MetricCard
                  title="Robust XGBoost Test AUC"
                  value={fmt(robustXGB.test_auc)}
                  subtitle={`Δ Test AUC: ${fmtSigned(delta?.xgb_test)}`}
                />

                <MetricCard
                  title="Robust Logistic Test AUC"
                  value={fmt(robustLR.test_auc)}
                  subtitle={`Δ Test AUC: ${fmtSigned(delta?.lr_test)}`}
                />
              </div>

              <div className="mt-6 text-center text-sm text-stone-500">
                “Robust” denotes models trained without the interest rate
                feature.
              </div>
            </section>

            {/* Why interest rate is problematic */}
            <section className="mb-12">
              <h3 className="text-2xl font-semibold text-stone-800 mb-6">
                Why excluding interest rate can matter
              </h3>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <p className="text-stone-600 mb-4">
                  In many lending settings, the interest rate is not a pure
                  borrower attribute—it is partly a{" "}
                  <span className="font-medium">policy variable</span> set by
                  the lender and may embed the lender’s own risk assessment.
                  Including it can introduce governance issues:
                </p>

                <ul className="space-y-3 text-stone-600 list-disc list-inside">
                  <li>
                    <span className="font-medium">
                      Post-treatment / target leakage:
                    </span>{" "}
                    if the rate is assigned using internal risk logic correlated
                    with default risk, the model can “learn” that mapping rather
                    than borrower fundamentals.
                  </li>
                  <li>
                    <span className="font-medium">Endogeneity:</span> pricing
                    may respond to unobserved risk factors; the feature becomes
                    a proxy for hidden underwriting decisions.
                  </li>
                  <li>
                    <span className="font-medium">Deployment mismatch:</span> if
                    your model is intended to inform pricing, you may not know
                    the interest rate at scoring time (or it becomes circular).
                  </li>
                  <li>
                    <span className="font-medium">Stability / drift:</span>{" "}
                    pricing policies change over time; using the rate can make
                    the model brittle to policy shifts.
                  </li>
                </ul>

                <div className="mt-6 bg-stone-50 border border-stone-200 rounded-lg p-4">
                  <p className="text-stone-600 mb-2">
                    One way to formalize the concern is that the interest rate
                    may be a function of the lender’s internal score:
                  </p>
                  <BlockMath
                    math={"r = g(s_{\\text{internal}}(x)) + \\varepsilon"}
                  />
                  <p className="text-sm text-stone-500 mt-2">
                    If <InlineMath math={"s_{\\text{internal}}(x)"} /> is
                    correlated with default risk, using{" "}
                    <InlineMath math={"r"} /> can leak underwriting information
                    into the PD model.
                  </p>
                </div>
              </div>
            </section>

            {/* Detailed comparison table */}
            <section className="mb-12">
              <h3 className="text-2xl font-semibold text-stone-800 mb-6">
                Detailed Comparison
              </h3>

              <div className="rounded-xl border border-stone-200 bg-white p-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-sm text-stone-600 border-b border-stone-200">
                      <th className="py-3 pr-4 font-semibold">Model</th>
                      <th className="py-3 pr-4 font-semibold">Spec</th>
                      <th className="py-3 pr-4 font-semibold">Train AUC</th>
                      <th className="py-3 pr-4 font-semibold">Test AUC</th>
                      <th className="py-3 pr-4 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="text-stone-700">
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4">{baselineLR.model}</td>
                      <td className="py-3 pr-4">Baseline (with rate)</td>
                      <td className="py-3 pr-4">{fmt(baselineLR.train_auc)}</td>
                      <td className="py-3 pr-4">{fmt(baselineLR.test_auc)}</td>
                      <td className="py-3 pr-4">
                        {baselineLR.timestamp || "—"}
                      </td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4">{robustLR.model}</td>
                      <td className="py-3 pr-4">Robust (no rate)</td>
                      <td className="py-3 pr-4">{fmt(robustLR.train_auc)}</td>
                      <td className="py-3 pr-4">{fmt(robustLR.test_auc)}</td>
                      <td className="py-3 pr-4">{robustLR.timestamp || "—"}</td>
                    </tr>
                    <tr className="border-b border-stone-100">
                      <td className="py-3 pr-4">{baselineXGB.model}</td>
                      <td className="py-3 pr-4">Baseline (with rate)</td>
                      <td className="py-3 pr-4">
                        {fmt(baselineXGB.train_auc)}
                      </td>
                      <td className="py-3 pr-4">{fmt(baselineXGB.test_auc)}</td>
                      <td className="py-3 pr-4">
                        {baselineXGB.timestamp || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4">{robustXGB.model}</td>
                      <td className="py-3 pr-4">Robust (no rate)</td>
                      <td className="py-3 pr-4">{fmt(robustXGB.train_auc)}</td>
                      <td className="py-3 pr-4">{fmt(robustXGB.test_auc)}</td>
                      <td className="py-3 pr-4">
                        {robustXGB.timestamp || "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-6 text-sm text-stone-500">
                  Interpretation: if removing the interest rate causes only a
                  small drop in test AUC, the model is less reliant on
                  pricing-policy information and may generalize better across
                  policy regimes.
                </div>
              </div>
            </section>

            {/* Practical guidance */}
            <section>
              <h3 className="text-2xl font-semibold text-stone-800 mb-6">
                Practical Guidance
              </h3>

              <div className="rounded-xl border border-stone-200 bg-white p-6">
                <ul className="space-y-3 text-stone-600 list-disc list-inside">
                  <li>
                    If your goal is{" "}
                    <span className="font-medium">pure credit risk</span>,
                    prefer excluding interest rate or using it only in a
                    controlled way (e.g., as a scenario variable).
                  </li>
                  <li>
                    If your goal is <span className="font-medium">pricing</span>
                    , consider modeling PD on borrower attributes first, then
                    pricing in a second step to avoid circularity.
                  </li>
                  <li>
                    Monitor stability: policy-driven features can create
                    artificial performance that does not survive policy shifts.
                  </li>
                </ul>
              </div>
            </section>
          </>
        )}
    </div>
  );
}

export default Robustness;
