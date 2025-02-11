import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { getPlacesCountByCategory } from "../../utils/api";
import "../styles/PlaceCategoryChart.css";

// Chart.js 요소 등록
ChartJS.register(ArcElement, Tooltip, Legend);

// 카테고리 개수 응답 타입
interface CategoryCount {
  types: string;
  count: number;
}

// 차트 색상 배열
const COLORS = [
  "#FF6384", "#36A2EB", "#FFCE56",
  "#4CAF50", "#9C27B0", "#FF9800"
];

// 차트 컴포넌트
const PieChart: React.FC = () => {
  const [data, setData] = useState<CategoryCount[]>([]);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  // API 호출하여 카테고리별 장소 개수 가져오기
  const fetchCategoryData = async () => {
    try {
      const response = await getPlacesCountByCategory();
      setData(response.data);
    } catch (error) {
      console.error("카테고리별 장소 데이터 불러오기 실패:", error);
    }
  };

  // 차트 데이터 변환
  const chartData = {
    labels: data.map((item) => `${item.types} (${item.count})`), // 카테고리명 + 개수
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: COLORS,
        hoverBackgroundColor: COLORS.map(color => `${color}DD`), // Hover 시 약간 더 진한 색
        borderWidth: 2, // 테두리 두께
        borderColor: "#fff", // 테두리 색상 (화이트로 둥글게)
        hoverOffset: 10, // 마우스 오버 시 확대 효과
      },
    ],
  };

  return (
<div className="pie-chart-container">
  <Pie
    data={chartData}
    options={{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#333",
            font: { size: 14 },
          },
        },
      },
    }}
    width={1000}
    height={500}
  />
</div>

  );
};

export default PieChart;
