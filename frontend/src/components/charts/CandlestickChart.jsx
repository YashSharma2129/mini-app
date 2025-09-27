import React, { useMemo } from 'react';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CandlestickChart = ({ data, title, height = 400 }) => {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map(item => ({
      ...item,
      // Calculate candlestick properties
      body: item.close - item.open,
      upperShadow: item.high - Math.max(item.open, item.close),
      lowerShadow: Math.min(item.open, item.close) - item.low,
      isPositive: item.close >= item.open
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Open:</span>
              <span className="font-medium">₹{data.open?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">High:</span>
              <span className="font-medium text-green-600">₹{data.high?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Low:</span>
              <span className="font-medium text-red-600">₹{data.low?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Close:</span>
              <span className="font-medium">₹{data.close?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Volume:</span>
              <span className="font-medium">{data.volume?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
        <CardTitle className="text-lg font-semibold text-green-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div style={{ width: '100%', height: height }}>
          <ResponsiveContainer>
            <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              <YAxis 
                domain={['dataMin - 10', 'dataMax + 10']}
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#d1d5db' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Candlestick bars */}
              {processedData.map((item, index) => (
                <Bar
                  key={index}
                  dataKey="high"
                  fill="transparent"
                  stroke={item.isPositive ? '#10B981' : '#EF4444'}
                  strokeWidth={1}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Bullish (Close ≥ Open)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Bearish (Close < Open)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandlestickChart;
