import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getVisitorCountByDate, getTotalVisitCountByDate } from "../utils/api"; // API 추가
import "chart.js/auto";

interface VisitorChartProps {
  startDate: string;
  endDate: string;
  searchIp?: string; // IP 필터링을 위한 선택적 프로퍼티 추가
}

const VisitorChart: React.FC<VisitorChartProps> = ({ startDate, endDate, searchIp }) => { // ip 추가
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
      {
        label: "누적 방문자 수",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
      },
    ],
  });

  useEffect(() => {
    fetchChartData();
  }, [startDate, endDate, searchIp]); // IP 변경 시 다시 실행

  const fetchChartData = async () => {
    try {
      const dates: string[] = [];
      const visitorCounts: number[] = [];
      const totalVisitCounts: number[] = [];

      let currentDate = new Date(startDate);
      const end = new Date(endDate);

      while (currentDate <= end) {
        const formattedDate = currentDate.toISOString().split("T")[0];
        dates.push(formattedDate);

        // IP 포함하여 API 호출 (기본값: 전체 조회)
        const visitorCount = await getVisitorCountByDate(formattedDate, searchIp || "");
        const totalVisitCount = await getTotalVisitCountByDate(formattedDate, searchIp || "");

        visitorCounts.push(visitorCount);
        totalVisitCounts.push(totalVisitCount);

        currentDate.setDate(currentDate.getDate() + 1); // 날짜 증가
      }

      setChartData({
        labels: dates,
        datasets: [
          {
            label: "방문자 수",
            data: visitorCounts,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
          },
          {
            label: "누적 방문자 수",
            data: totalVisitCounts,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("방문자 데이터 로드 실패:", error);
    }
  };

  return <Line data={chartData} />;
};

export default VisitorChart;
