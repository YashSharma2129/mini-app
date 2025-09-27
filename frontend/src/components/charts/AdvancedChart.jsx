import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity,
  ScatterChart as ScatterChartIcon,
  Calendar,
  Download
} from 'lucide-react';

const AdvancedChart = ({ 
  data, 
  title, 
  type = 'line',
  height = 300,
  showControls = true,
  onExport 
}) => {
  const [chartType, setChartType] = useState(type);
  const [timeRange, setTimeRange] = useState('6M');
  const [selectedMetric, setSelectedMetric] = useState('value');

  const chartTypes = [
    { value: 'line', label: 'Line Chart', icon: TrendingUp },
    { value: 'area', label: 'Area Chart', icon: Activity },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
    { value: 'scatter', label: 'Scatter Plot', icon: ScatterChartIcon },
    { value: 'composed', label: 'Composed Chart', icon: BarChart3 }
  ];

  const timeRanges = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: 'ALL', label: 'All Time' }
  ];

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data.map((item, index) => ({
      ...item,
      color: colors[index % colors.length]
    }));
  }, [data]);

  const renderChart = () => {
    const commonProps = {
      data: processedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke={colors[0]} 
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke={colors[0]} 
              fill={colors[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={selectedMetric} fill={colors[0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={selectedMetric}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Scatter dataKey={selectedMetric} fill={colors[0]} />
          </ScatterChart>
        );

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={selectedMetric} fill={colors[0]} />
            <Line type="monotone" dataKey={selectedMetric} stroke={colors[1]} strokeWidth={2} />
          </ComposedChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
            {chartTypes.find(t => t.value === chartType)?.icon && (
              React.createElement(chartTypes.find(t => t.value === chartType).icon, {
                className: "h-5 w-5 mr-2"
              })
            )}
            {title}
          </CardTitle>
          
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(chartType, processedData)}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {showControls && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Chart Type:</span>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <type.icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Metric:</span>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div style={{ width: '100%', height: height }}>
          <ResponsiveContainer>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedChart;
