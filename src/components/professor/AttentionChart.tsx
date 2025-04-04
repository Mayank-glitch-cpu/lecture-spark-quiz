
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AttentionPoint } from "../../types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AttentionChartProps {
  data: AttentionPoint[];
}

const AttentionChart = ({ data }: AttentionChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Attention Level Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  padding: "10px"
                }}
                itemStyle={{ color: "#6D28D9" }}
                labelStyle={{ fontWeight: 500, marginBottom: "5px" }}
                formatter={(value: number) => [`${value}%`, "Attention"]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6D28D9"
                strokeWidth={2}
                dot={{ fill: "#6D28D9", strokeWidth: 2, r: 4 }}
                activeDot={{ fill: "#6D28D9", strokeWidth: 0, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttentionChart;
