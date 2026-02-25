# Interpretable Credit Risk Scoring & Portfolio Optimization System

## Overview

This project builds an end-to-end credit underwriting system using LendingClub loan data.

Rather than stopping at predictive modeling, it translates model outputs into economically optimal lending decisions through expected value optimization and risk sensitivity analysis.

---

## Business Problem

A lending platform must decide which loan applicants to approve in order to maximize portfolio value under uncertain default risk.

Each loan decision involves a tradeoff between:

- Interest income
- Default probability
- Loss severity (LGD)

---

## Methodology

### 1. Data Preparation

- Cleaned 1.3M+ issued loans
- Removed post-origination leakage variables
- Time-based validation:
  - Train: ≤ 2016
  - Test: ≥ 2017

---

### 2. Predict Default Probability (PD)

| Model               | Test AUC |
| ------------------- | -------- |
| Logistic Regression | 0.699    |
| XGBoost             | 0.712    |

XGBoost selected as Champion model due to improved discrimination and calibration.

---

### 3. Decision Optimization

Converted PD into Expected Net Value:

$$ENV = (1 - PD)\cdot r\cdot L - PD\cdot LGD\cdot L$$

Implemented:

- PD threshold optimization
- Risk–return frontier
- LGD sensitivity analysis (0.2–1.0)

---

## Key Results

- Approve-all strategy leads to large negative portfolio value.
- Profit-maximizing approval rate ≈ 11–20% depending on LGD.
- Policy responds monotonically to changes in loss severity.
- Model ranking quality enables economically coherent decision boundaries.

---

## Visual Outputs

- Default rate by grade
- Calibration comparison (Logistic vs XGBoost)
- Risk–Return Frontier
- Expected Portfolio Value vs LGD

---

## Skills Demonstrated

- Time-aware model validation
- Logistic and gradient boosting models
- Probability calibration
- Decision theory and expected value optimization
- Scenario stress testing
- Portfolio-level reasoning
- JSON artifact export for frontend integration

---

## Project Structure
