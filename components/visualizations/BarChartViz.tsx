import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, Label } from 'recharts';
import type { BarChartSlideData } from '../../types';

interface BarChartVizProps {
  slide: BarChartSlideData;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export const BarChartViz: React.FC<BarChartVizProps> = ({ slide }) => {
  const data = slide.data || [];
  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h2 className="text-xl lg:text-2xl font-bold text-center mb-4 text-gray-200">{slide.title}</h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#A0AEC0" tick={{ fontSize: 12 }}>
                 <Label value={slide.xAxisTitle || ''} offset={-15} position="insideBottom" fill="#A0AEC0" />
            </XAxis>
            <YAxis stroke="#A0AEC0" tick={{ fontSize: 12 }}>
                <Label value={slide.yAxisTitle || ''} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#A0AEC0' }} />
            </YAxis>
            <Tooltip
                contentStyle={{ backgroundColor: '#2D3748', border: 'none', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#E2E8F0' }}
            />
            <Bar dataKey="value" fill="#8884d8">
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};