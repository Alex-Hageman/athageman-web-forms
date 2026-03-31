import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { supabase, type SurveyResponse } from "@/lib/supabase";
import Footer from "@/components/Footer";

const ACCENT = "#8A3BDB";
const ACCENT_LIGHT = "#b57ef5";

const FREQUENCY_ORDER = [
  "Daily",
  "Multiple times per week",
  "Once a week",
  "Monthly",
  "Rarely/Never",
];

const REGION_ORDER = ["Northeast", "Midwest", "South", "West"];

function normalizeChain(name: string): string {
  return name.trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ChainCount { name: string; count: number }
interface FreqCount { name: string; count: number }
interface RegionCount { name: string; count: number; pct: string }

function computeStats(rows: SurveyResponse[]) {
  const total = rows.length;

  // Frequency counts
  const freqMap: Record<string, number> = {};
  FREQUENCY_ORDER.forEach((f) => { freqMap[f] = 0; });
  rows.forEach((r) => {
    if (freqMap[r.frequency] !== undefined) freqMap[r.frequency]++;
    else freqMap[r.frequency] = (freqMap[r.frequency] || 0) + 1;
  });
  const freqData: FreqCount[] = FREQUENCY_ORDER.map((f) => ({
    name: f,
    count: freqMap[f] || 0,
  }));

  // Chain counts (case-normalized)
  const chainMap: Record<string, number> = {};
  rows.forEach((r) => {
    const name = normalizeChain(r.favorite_chain);
    chainMap[name] = (chainMap[name] || 0) + 1;
  });
  const chainData: ChainCount[] = Object.entries(chainMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Region counts
  const regionMap: Record<string, number> = {};
  REGION_ORDER.forEach((r) => { regionMap[r] = 0; });
  rows.forEach((r) => {
    if (regionMap[r.region] !== undefined) regionMap[r.region]++;
    else regionMap[r.region] = (regionMap[r.region] || 0) + 1;
  });
  const regionData: RegionCount[] = REGION_ORDER.map((r) => ({
    name: r,
    count: regionMap[r] || 0,
    pct: total > 0 ? `${Math.round(((regionMap[r] || 0) / total) * 100)}%` : "0%",
  }));

  return { total, freqData, chainData, regionData };
}

// Short label for frequency axis
function shortFreq(name: string): string {
  const map: Record<string, string> = {
    "Daily": "Daily",
    "Multiple times per week": "Multi/wk",
    "Once a week": "Weekly",
    "Monthly": "Monthly",
    "Rarely/Never": "Rarely",
  };
  return map[name] || name;
}

interface PctLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: string | number;
}

function PctLabel({ x = 0, y = 0, width = 0, value }: PctLabelProps) {
  return (
    <text
      x={x + width + 6}
      y={y + 10}
      fill="#666"
      fontSize={12}
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
}

export default function Results() {
  const [rows, setRows] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("favorite_chain, region, frequency, factors, other_factor");

      if (error) {
        setError("Failed to load results. Please try again.");
      } else {
        setRows((data as SurveyResponse[]) || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const stats = rows.length > 0 ? computeStats(rows) : null;

  return (
    <div className="results-page">
      <header className="results-header">
        <h1>Survey Results</h1>
        <Link to="/" className="btn btn-link">
          ← Take the Survey
        </Link>
      </header>

      <main className="results-main">
        {loading && (
          <div className="results-loading" aria-live="polite" aria-busy="true">
            Loading results…
          </div>
        )}

        {!loading && error && (
          <div className="results-error" role="alert">{error}</div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="results-empty">
            <p>No responses yet. Be the first to take the survey!</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              Take the Survey
            </Link>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Total Foodies */}
            <div className="results-stat-card">
              <p className="results-stat-label">Total Foodies</p>
              <p className="results-stat-number" aria-label={`${stats.total} total respondents`}>
                {stats.total}
              </p>
            </div>

            {/* Dining Frequency — vertical bar chart */}
            <div className="results-chart-card">
              <h2 className="results-chart-title">Dining Frequency</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stats.freqData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={shortFreq}
                    tick={{ fontSize: 12, fill: "#555" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#555" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(138,59,219,0.06)" }}
                    contentStyle={{ fontSize: 13, borderRadius: 6 }}
                  />
                  <Bar dataKey="count" name="Responses" radius={[4, 4, 0, 0]}>
                    {stats.freqData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i % 2 === 0 ? ACCENT : ACCENT_LIGHT}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Most Popular Chains — horizontal bar chart */}
            <div className="results-chart-card">
              <h2 className="results-chart-title">Most Popular Chains</h2>
              {stats.chainData.length === 0 ? (
                <p style={{ color: "#888", fontSize: "0.9rem" }}>No chain data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(200, stats.chainData.length * 36)}>
                  <BarChart
                    data={stats.chainData}
                    layout="vertical"
                    margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fontSize: 12, fill: "#555" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 12, fill: "#555" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(138,59,219,0.06)" }}
                      contentStyle={{ fontSize: 13, borderRadius: 6 }}
                    />
                    <Bar dataKey="count" name="Responses" fill={ACCENT} radius={[0, 4, 4, 0]}>
                      <LabelList dataKey="count" position="right" style={{ fontSize: 12, fill: "#555" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Regional Participation — horizontal bar chart with % labels */}
            <div className="results-chart-card">
              <h2 className="results-chart-title">Regional Participation</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={stats.regionData}
                  layout="vertical"
                  margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#555" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={90}
                    tick={{ fontSize: 12, fill: "#555" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(138,59,219,0.06)" }}
                    contentStyle={{ fontSize: 13, borderRadius: 6 }}
                    formatter={(value: number, _name: string, entry: { payload: RegionCount }) => [
                      `${value} (${entry.payload.pct})`,
                      "Responses",
                    ]}
                  />
                  <Bar dataKey="count" name="Responses" fill={ACCENT} radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="pct" content={<PctLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
