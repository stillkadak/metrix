import React from 'react';
import { Paper, Typography } from '@mui/material';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

interface TrendChartProps {
  title: string;
  data: { date: string; count: number }[];
}

const TrendChart: React.FC<TrendChartProps> = ({ title, data }) => (
  <Paper sx={{ p: 3, border: '1px solid #DEDACD' }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDEAE0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} minTickGap={20} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          name="Scans"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </Paper>
);

export default TrendChart;
