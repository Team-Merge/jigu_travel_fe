import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getVisitorCountByDate } from "../utils/api";
import "chart.js/auto";

const VisitorChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [
      {
        label: "방문자 수",
        data: [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  });

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const dates = [];
      const counts = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = date.toISOString().split("T")[0];
        dates.push(formattedDate);
        const count = await getVisitorCountByDate(formattedDate);
        counts.push(count);
      }

      setChartData({
        labels: dates,
        datasets: [
          {
            label: "방문자 수",
            data: counts,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("🚨 방문자 데이터 로드 실패:", error);
    }
  };

  return <Line data={chartData} />;
};

export default VisitorChart;
