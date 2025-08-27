"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

type ChartProps = { data: { name: string; amount: number }[]; dataKey?: string };

export function ChartComponent({ data, dataKey = 'amount' }: ChartProps) {
  const chartConfig = {
    amount: {
      label: "Cantidad",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height={250}>
            <BarChart accessibilityLayer data={data}>
                <XAxis
                    dataKey="name"
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
                    tickFormatter={(value) => `${value / 1000}k`}
                />
                 <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey={dataKey} fill="var(--color-amount)" radius={4} />
            </BarChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
