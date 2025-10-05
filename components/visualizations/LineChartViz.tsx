import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import type { LineChartSlideData } from '../../types';

interface LineChartVizProps {
  slide: LineChartSlideData;
}

export const LineChartViz: React.FC<LineChartVizProps> = ({ slide }) => {
  const data = slide.data || [];
  return (
    <div className="w-full h-full p-4 flex flex-col">
      <h2 className="text-xl lg:text-2xl font-bold text-center mb-4 text-gray-200">{slide.title}</h2>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
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
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};