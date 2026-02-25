import Button from "../ui/Button";

function Notebooks() {
  // Paste your GitHub links here
  const notebooks = [
    {
      title: "01 — Data Cleaning",
      href: "https://github.com/NChavezC/CreditRisk/blob/main/notebooks/01_data_cleaning.ipynb",
      description: "Builds the dataset, cleans NAs, etc.",
      tags: ["Data Cleaning", "Data Engineering", "Data Preparation"],
    },
    {
      title: "02 — EDA ",
      href: "https://github.com/NChavezC/CreditRisk/blob/main/notebooks/02_eda.ipynb",
      description:
        "Preforms exploratory data analysis, determining the type of train-test split for this data.",
      tags: ["EDA", "Data Visualization"],
    },
    {
      title: "03 — Feature Cleaning & Split",
      href: "https://github.com/NChavezC/CreditRisk/blob/main/notebooks/03_feature_cleaning%20%26%20split.ipynb",
      description:
        "Cleans features for modeling and implements a train-test split consistent with production deployment (time-based split).",
      tags: ["Feature Cleaning", "Train-test Split", "Data Preparation"],
    },
    {
      title: "04 — Baseline Logistic Regression Model",
      href: "https://github.com/NChavezC/CreditRisk/blob/main/notebooks/04_baseline_logistic.ipynb",
      description:
        "Trains a logistic regression model as a baseline for PD prediction, including hyperparameter tuning and evaluation.",
      tags: ["Logistic Regression", "Baseline Model", "Modeling"],
    },
    {
      title: "05 — Gradient Boosting Model",
      href: "https://github.com/NChavezC/CreditRisk/blob/main/notebooks/05_gradient_boosting_challenger.ipynb",
      description:
        "Trains an XGBoost model for PD prediction and evaluation against the logistic regression baseline.",
      tags: ["XGBoost", "Gradient Boosting", "Modeling"],
    },
    {
      title: "06 — Descisioning Layer & Threshold Optimization",
      href: "https://github.com/NChavezC/CreditRisk/blob/main/notebooks/06_decision_layer.ipynb",
      description:
        "Implements the decisioning layer, converting predicted PDs into approval rules using an Expected Net Value (ENV) framework and optimizing the PD threshold.",
      tags: ["Decisioning", "Threshold Optimization", "Expected Net Value"],
    },
    {
      title: "07 — Robustness (No interest rate feature)",
      href: "https://github.com/NChavezC/CreditRisk/blob/main/notebooks/07_robustness_no_interest.ipynb",
      description:
        "Tests model robustness by retraining without the interest rate feature.",
      tags: ["Robustness Testing", "Feature Importance"],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-stone-800 mb-4">Notebooks</h2>
        <p className="text-stone-600 max-w-3xl mx-auto text-lg">
          These notebooks contain the full end-to-end analysis: data
          preparation, PD modeling, and the decisioning layer (threshold
          optimization, frontier, and LGD stress tests).
        </p>
      </section>

      {/* Reproducibility Note */}
      <section className="mb-10">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-2">
            Reproducibility
          </h3>
          <p className="text-stone-600">
            Raw CSV data files are not included in the repository due to size
            constraints. The notebooks expect data to be available locally
            (e.g., under <span className="font-medium">notebooks/</span> or your
            preferred path). All exported charts and metrics used in this webapp
            are saved into <span className="font-medium">/public</span>.
          </p>
        </div>
      </section>

      {/* Notebook Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notebooks.map((nb) => (
          <div
            key={nb.title}
            className="rounded-xl border border-stone-200 bg-white p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-stone-800 mb-2">
              {nb.title}
            </h3>
            <p className="text-stone-600 mb-4">{nb.description}</p>

            {/* Tags */}
            {nb.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {nb.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-1 rounded-full border border-stone-200 text-stone-600 bg-stone-50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Link */}
            <div className="flex items-center gap-3">
              <a
                href={nb.href}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Open on GitHub →
              </a>

              {/* Optional: nice CTA button if your Button supports asChild/href; otherwise keep it simple */}
              <Button
                onClick={() => window.open(nb.href, "_blank", "noreferrer")}
              >
                View Notebook
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* Footer hint */}
      <section className="mt-12 text-center text-sm text-stone-500">
        Tip: If GitHub rendering is slow, you can also paste{" "}
        <span className="font-medium">nbviewer</span> links here.
      </section>
    </div>
  );
}

export default Notebooks;
