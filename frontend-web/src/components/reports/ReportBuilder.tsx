import React, { useEffect, useState } from 'react';
import { Box, Grid, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { api } from '../../services/api';
import StatsCard from '../dashboard/StatsCard';
import { AssessmentOutlined, CheckCircleOutlined, ErrorOutlineOutlined } from '@mui/icons-material';
import { CHART_COLORS } from '../../utils/constants';
import { titleCase } from '../../utils/helpers';

interface ReportSummary {
  period_days: number;
  total_scans: number;
  compliant_scans: number;
  compliance_rate: number;
  violations_by_severity: { severity: string; count: number }[];
}

const PERIOD_OPTIONS = [7, 30, 90, 365];

const ReportBuilder: React.FC = () => {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<ReportSummary | null>(null);

  useEffect(() => {
    api.get('/reports/summary', { params: { days } }).then((res) => setReport(res.data));
  }, [days]);

  const chartData = (report?.violations_by_severity ?? []).map((v) => ({
    severity: titleCase(v.severity),
    count: v.count,
  }));

  return (
    <Box>
      <TextField
        select
        label="Period"
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        sx={{ width: 200, mb: 3 }}
      >
        {PERIOD_OPTIONS.map((d) => (
          <MenuItem key={d} value={d}>Last {d} days</MenuItem>
        ))}
      </TextField>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatsCard title="Total Scans" value={report?.total_scans ?? 0} icon={<AssessmentOutlined />} color={CHART_COLORS.primary} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard title="Compliant Scans" value={report?.compliant_scans ?? 0} icon={<CheckCircleOutlined />} color="#2F6F4E" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard title="Compliance Rate" value={`${report?.compliance_rate ?? 0}%`} icon={<ErrorOutlineOutlined />} color={CHART_COLORS.secondary} />
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, border: '1px solid #DEDACD' }}>
        <Typography variant="h6" gutterBottom>
          Violations by Severity
        </Typography>
        {chartData.length === 0 ? (
          <Typography variant="body2" color="text.secondary">No violations in this period.</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE0" />
              <XAxis dataKey="severity" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
};

export default ReportBuilder;
