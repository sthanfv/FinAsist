

"use client"
import React, { memo } from "react"
import dynamic from "next/dynamic"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });


type ChartProps = { 
  data: any[]; 
  dataKey: string;
  xAxisKey: string;
  type: 'bar' | 'line';
  config?: any;
};

const ChartComponentInternal = ({ data, dataKey, xAxisKey, type, config }: ChartProps) => {
  const chartConfig = config || {
    [dataKey]: {
      label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
      color: "hsl(var(--primary))",
    },
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg">
          <p className="label text-sm text-muted-foreground">{`${label}`}</p>
          <p className="intro font-semibold" style={{ color: chartConfig[dataKey]?.color }}>
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === 'bar') {
    return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={250}>
              <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <XAxis
                      dataKey={xAxisKey}
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      fontSize={12}
                  />
                  <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      fontSize={12}
                      tickFormatter={formatCurrency}
                  />
                  <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={4} />
              </BarChart>
          </ResponsiveContainer>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis 
            dataKey={xAxisKey} 
            tickFormatter={(value) => new Date(value).toLocaleDateString('es', { month: 'short' })}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey={dataKey}
            stroke={`var(--color-${dataKey})`}
            strokeWidth={2}
            dot={{
              r: 4,
              fill: `var(--color-${dataKey})`,
              stroke: 'transparent',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export const ChartComponent = memo(ChartComponentInternal);
