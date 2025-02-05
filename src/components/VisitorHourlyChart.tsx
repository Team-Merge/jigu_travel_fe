import React, { useEffect, useState } from "react";
import { getVisitCountByHour } from "../utils/api";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

interface Props {
  startDate: string;
  endDate: string;
  searchIp?: string;
}

const VisitorHourlyChart: React.FC<Props> = ({ startDate, endDate, searchIp }) => {
  const [hourlyData, setHourlyData] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (!startDate || !endDate) return;
    console.log(`시간대별 방문 기록 가져오기: ${startDate} ~ ${endDate}, IP: ${searchIp}`);

    const fetchHourlyData = async () => {
      try {
        const response = await getVisitCountByHour(startDate, endDate, searchIp);
        setHourlyData(response);
      } catch (error) {
        console.error("시간대별 방문 기록 조회 실패:", error);
      }
    };

    fetchHourlyData();
  }, [startDate, endDate, searchIp]); // ✅ searchIp이 변경될 때도 다시 실행됨

  const chartData = {
    labels: Object.keys(hourlyData).map((hour) => `${hour}시`),
    datasets: [
      {
        label: "방문자 수",
        data: Object.values(hourlyData),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="visitor-hourly-chart-container">
      <Bar data={chartData} />
    </div>
  );
};

export default VisitorHourlyChart;
