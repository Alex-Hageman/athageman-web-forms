import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

const REGIONS = ["Northeast", "Midwest", "South", "West"];
const FREQUENCIES = [
  "Daily",
  "Multiple times per week",
  "Once a week",
  "Monthly",
  "Rarely/Never",
];
const FACTORS = [
  "Price",
  "Speed",
  "Taste",
  "Location/Proximity",
  "Healthy Options",
  "Other",
];

interface FormValues {
  chain: string;
  region: string;
  frequency: string;
  factors: string[];
  otherFactor: string;
}

interface FormErrors {
  chain?: string;
  region?: string;
  frequency?: string;
  factors?: string;
  otherFactor?: string;
}

export default function SurveyForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>({
    chain: "",
    region: "",
    frequency: "",
    factors: [],
    otherFactor: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const otherInputRef = useRef<HTMLInputElement>(null);
  const chainInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chainInputRef.current?.focus();
  }, []);

  const otherChecked = values.factors.includes("Other");

  useEffect(() => {
    if (otherChecked) {
      otherInputRef.current?.focus();
    }
  }, [otherChecked]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!values.chain.trim()) errs.chain = "Please enter your favorite fast food chain.";
    if (!values.region) errs.region = "Please select your region.";
    if (!values.frequency) errs.frequency = "Please select how often you eat fast food.";
    if (values.factors.length === 0) errs.factors = "Please select at least one factor.";
    if (otherChecked && !values.otherFactor.trim()) {
      errs.otherFactor = "Please describe your other reason.";
    }
    return errs;
  }

  function handleChainChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, chain: e.target.value }));
    if (errors.chain) setErrors((e) => ({ ...e, chain: undefined }));
  }

  function handleRegionChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setValues((v) => ({ ...v, region: e.target.value }));
    if (errors.region) setErrors((e) => ({ ...e, region: undefined }));
  }

  function handleFrequencyChange(freq: string) {
    setValues((v) => ({ ...v, frequency: freq }));
    if (errors.frequency) setErrors((e) => ({ ...e, frequency: undefined }));
  }

  function handleFactorChange(factor: string, checked: boolean) {
    setValues((v) => ({
      ...v,
      factors: checked
        ? [...v.factors, factor]
        : v.factors.filter((f) => f !== factor),
      otherFactor: factor === "Other" && !checked ? "" : v.otherFactor,
    }));
    if (errors.factors) setErrors((e) => ({ ...e, factors: undefined }));
  }

  function handleOtherFactorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, otherFactor: e.target.value }));
    if (errors.otherFactor) setErrors((e) => ({ ...e, otherFactor: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorId = Object.keys(errs)[0];
      const el = document.getElementById(`field-${firstErrorId}`);
      el?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("survey_responses").insert({
      favorite_chain: values.chain.trim(),
      region: values.region,
      frequency: values.frequency,
      factors: values.factors,
      other_factor: otherChecked ? values.otherFactor.trim() || null : null,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError("Sorry, something went wrong saving your response. Please try again.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="survey-page">
        <header className="survey-header">
          <h1>Fast Food Favorites</h1>
          <Link to="/results" className="btn btn-link">
            View Results
          </Link>
        </header>
        <main className="survey-main">
          <div className="thankyou-card">
            <div className="thankyou-icon" aria-hidden="true">✓</div>
            <h2 className="thankyou-title">Thanks for responding!</h2>
            <p className="thankyou-subtitle">Your answers have been saved. Here's a summary of what you submitted:</p>
            <div className="thankyou-summary">
              <h3>Your Answers</h3>
              <dl>
                <div>
                  <dt>Favorite chain</dt>
                  <dd>{values.chain}</dd>
                </div>
                <div>
                  <dt>Region</dt>
                  <dd>{values.region}</dd>
                </div>
                <div>
                  <dt>Dining frequency</dt>
                  <dd>{values.frequency}</dd>
                </div>
                <div>
                  <dt>Selection factors</dt>
                  <dd>
                    {values.factors.join(", ")}
                    {otherChecked && values.otherFactor ? ` (other: ${values.otherFactor})` : ""}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="thankyou-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/results")}
              >
                View Results
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="survey-page">
      <header className="survey-header">
        <h1>Fast Food Favorites</h1>
        <Link to="/results" className="btn btn-link">
          View Results
        </Link>
      </header>

      <main className="survey-main">
        <div className="form-card">
          <h2 className="form-title">Fast Food Survey</h2>
          <p className="form-subtitle">
            Tell us about your fast food habits. All fields are required.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Q1 — Favorite Chain */}
            <div className="form-question">
              <label htmlFor="field-chain" className="form-label">
                1. What is your favorite fast food chain?
                <span className="form-required" aria-hidden="true">*</span>
              </label>
              <input
                id="field-chain"
                ref={chainInputRef}
                type="text"
                className={`form-input${errors.chain ? " has-error" : ""}`}
                placeholder="e.g. Wendy's"
                value={values.chain}
                onChange={handleChainChange}
                aria-required="true"
                aria-describedby={errors.chain ? "error-chain" : undefined}
                aria-invalid={!!errors.chain}
              />
              {errors.chain && (
                <p id="error-chain" className="field-error" role="alert">
                  <span aria-hidden="true">⚠</span> {errors.chain}
                </p>
              )}
            </div>

            {/* Q2 — Region */}
            <div className="form-question">
              <label htmlFor="field-region" className="form-label">
                2. Which region do you live in?
                <span className="form-required" aria-hidden="true">*</span>
              </label>
              <select
                id="field-region"
                className={`form-select${errors.region ? " has-error" : ""}`}
                value={values.region}
                onChange={handleRegionChange}
                aria-required="true"
                aria-describedby={errors.region ? "error-region" : undefined}
                aria-invalid={!!errors.region}
              >
                <option value="">Select a region…</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.region && (
                <p id="error-region" className="field-error" role="alert">
                  <span aria-hidden="true">⚠</span> {errors.region}
                </p>
              )}
            </div>

            {/* Q3 — Frequency */}
            <div className="form-question">
              <fieldset>
                <legend className="form-label">
                  3. How often do you eat fast food?
                  <span className="form-required" aria-hidden="true">*</span>
                </legend>
                <div
                  className="radio-group"
                  role="radiogroup"
                  aria-describedby={errors.frequency ? "error-frequency" : undefined}
                >
                  {FREQUENCIES.map((freq) => (
                    <label key={freq} className="radio-option">
                      <input
                        type="radio"
                        name="frequency"
                        value={freq}
                        checked={values.frequency === freq}
                        onChange={() => handleFrequencyChange(freq)}
                        aria-required="true"
                      />
                      {freq}
                    </label>
                  ))}
                </div>
                {errors.frequency && (
                  <p id="error-frequency" className="field-error" role="alert">
                    <span aria-hidden="true">⚠</span> {errors.frequency}
                  </p>
                )}
              </fieldset>
            </div>

            {/* Q4 — Selection Factors */}
            <div className="form-question">
              <fieldset>
                <legend className="form-label">
                  4. What factors drive your choice? (select all that apply)
                  <span className="form-required" aria-hidden="true">*</span>
                </legend>
                <div
                  className="checkbox-group"
                  aria-describedby={errors.factors ? "error-factors" : undefined}
                >
                  {FACTORS.map((factor) => (
                    <div key={factor}>
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          value={factor}
                          checked={values.factors.includes(factor)}
                          onChange={(e) => handleFactorChange(factor, e.target.checked)}
                        />
                        {factor}
                      </label>
                      {factor === "Other" && otherChecked && (
                        <div className="other-input-wrapper">
                          <label htmlFor="field-otherFactor" className="form-label" style={{ fontSize: "0.875rem" }}>
                            Please specify
                            <span className="form-required" aria-hidden="true">*</span>
                          </label>
                          <input
                            id="field-otherFactor"
                            ref={otherInputRef}
                            type="text"
                            className={`form-input${errors.otherFactor ? " has-error" : ""}`}
                            placeholder="Describe your reason…"
                            value={values.otherFactor}
                            onChange={handleOtherFactorChange}
                            aria-required="true"
                            aria-describedby={errors.otherFactor ? "error-otherFactor" : undefined}
                            aria-invalid={!!errors.otherFactor}
                          />
                          {errors.otherFactor && (
                            <p id="error-otherFactor" className="field-error" role="alert">
                              <span aria-hidden="true">⚠</span> {errors.otherFactor}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {errors.factors && (
                  <p id="error-factors" className="field-error" role="alert">
                    <span aria-hidden="true">⚠</span> {errors.factors}
                  </p>
                )}
              </fieldset>
            </div>

            {submitError && (
              <div className="submit-error" role="alert">
                {submitError}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? "Submitting…" : "Submit Survey"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
