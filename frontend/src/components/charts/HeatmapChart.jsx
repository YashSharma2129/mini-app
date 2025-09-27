import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Calendar } from 'lucide-react';

const HeatmapChart = ({ data, title, height = 300 }) => {
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    // Group data by month and day
    const heatmapData = {};
    
    data.forEach(item => {
      const date = new Date(item.date);
      const month = date.getMonth();
      const day = date.getDay();
      const key = `${month}-${day}`;
      
      if (!heatmapData[key]) {
        heatmapData[key] = {
          month,
          day,
          value: 0,
          count: 0
        };
      }
      
      heatmapData[key].value += item.value || 0;
      heatmapData[key].count += 1;
    });
    
    // Calculate average values
    Object.values(heatmapData).forEach(item => {
      item.averageValue = item.value / item.count;
    });
    
    return Object.values(heatmapData);
  }, [data]);

  const getIntensity = (value, maxValue) => {
    if (maxValue === 0) return 0;
    return Math.min(value / maxValue, 1);
  };

  const getColor = (intensity) => {
    const colors = [
      '#f3f4f6', // gray-100
      '#dbeafe', // blue-100
      '#bfdbfe', // blue-200
      '#93c5fd', // blue-300
      '#60a5fa', // blue-400
      '#3b82f6', // blue-500
      '#2563eb', // blue-600
      '#1d4ed8', // blue-700
      '#1e40af', // blue-800
      '#1e3a8a'  // blue-900
    ];
    
    const index = Math.floor(intensity * (colors.length - 1));
    return colors[index];
  };

  const maxValue = Math.max(...processedData.map(item => item.averageValue));

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
        <CardTitle className="text-lg font-semibold text-purple-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div style={{ height: height }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Less
            </div>
            <div className="flex space-x-1">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                <div
                  key={intensity}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getColor(intensity) }}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              More
            </div>
          </div>
          
          <div className="grid grid-cols-8 gap-1">
            {/* Day labels */}
            <div></div>
            {days.map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
            
            {/* Heatmap grid */}
            {months.map((month, monthIndex) => (
              <React.Fragment key={month}>
                <div className="text-xs text-gray-500 flex items-center justify-center">
                  {month}
                </div>
                {days.map((_, dayIndex) => {
                  const cellData = processedData.find(
                    item => item.month === monthIndex && item.day === dayIndex
                  );
                  
                  const intensity = cellData 
                    ? getIntensity(cellData.averageValue, maxValue)
                    : 0;
                  
                  return (
                    <div
                      key={`${monthIndex}-${dayIndex}`}
                      className="w-3 h-3 rounded-sm border border-gray-200"
                      style={{ backgroundColor: getColor(intensity) }}
                      title={cellData ? `Value: ${cellData.averageValue.toFixed(2)}` : 'No data'}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Activity heatmap showing data distribution across days and months
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatmapChart;
