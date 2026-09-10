import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Skeleton,
} from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { analytics as analyticsApi } from '../services/api';

interface SummaryData {
  total_scans: number;
  scans_today: number;
  compliance_rate: number;
  total_violations: number;
  violations_by_severity: { name: string; value: number }[];
  trend: { date: string; count: number }[];
}

interface ViolationAnalytics {
  top_violations: { code: string; description: string; count: number }[];
  daily_trend: { date: string; count: number }[];
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#DC2626',
  major: '#EA580C',
  minor: '#64748B',
};

const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [violationStats, setViolationStats] = useState<ViolationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      analyticsApi.summary(),
      analyticsApi.violations(30),
    ])
      .then(([summaryRes, violRes]) => {
        if (mounted) {
          setSummary(summaryRes.data);
          setViolationStats(violRes.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const severityData = (summary?.violations_by_severity || []).map((item) => ({
    name: item.name.toUpperCase(),
    value: item.value,
    color: SEVERITY_COLORS[item.name.toLowerCase()] || '#64748B',
  }));

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Scan Volume 30-Day Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              Scan Activity Volume (Last 30 Days)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Daily packaging label scans processed across all teams.
            </Typography>

            {loading ? (
              <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={summary?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0F172A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0F172A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#0F172A',
                      borderRadius: 8,
                      color: '#FFFFFF',
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#0F172A" strokeWidth={2.5} fillOpacity={1} fill="url(#scanGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Violations by Severity Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3, height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              Violations by Severity
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Proportions of Critical, Major, and Minor rule failures.
            </Typography>

            {loading ? (
              <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto', my: 2 }} />
            ) : severityData.length === 0 ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No violations recorded.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={severityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Top Violated Legal Metrology Rules */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              Top Non-Compliant Rules (Frequency Ranking)
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Legal Metrology rules most frequently violated on package labels.
            </Typography>

            {loading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
            ) : (violationStats?.top_violations || []).length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No rule violation frequency data recorded.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={violationStats?.top_violations || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="code" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#0F172A',
                      borderRadius: 8,
                      color: '#FFFFFF',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="#DC2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
