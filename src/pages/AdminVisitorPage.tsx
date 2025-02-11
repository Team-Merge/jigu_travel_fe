import React, { useState, useEffect } from "react";
import VisitorChart from "../components/VisitorChart";
import { getVisitorRecordsWithPagination } from "../utils/api";
import VisitorHourlyChart from "../components/VisitorHourlyChart";
import "../styles/AdminVisitorPage.css";
import Header from "../components/layout/Header";

const getTodayKST = () => {
    const now = new Date();
    now.setHours(now.getHours() + 9);
    return now.toISOString().split("T")[0];
};

// `getPastDate` 함수: 과거 특정 날짜를 반환
const getPastDate = (days: number) => {
    const date = new Date();
    date.setHours(date.getHours() + 9);
    date.setDate(date.getDate() - days);
    return date.toISOString().split("T")[0];
};

const AdminVisitorPage: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<number>(7);
  const [customStartDate, setCustomStartDate] = useState<string>(getPastDate(7));
  const [customEndDate, setCustomEndDate] = useState<string>(getTodayKST());
  const [showCustomDate, setShowCustomDate] = useState<boolean>(false);
  const [searchIp, setSearchIp] = useState<string>(""); // IP 검색 필드 추가

  const [finalStartDate, setFinalStartDate] = useState<string>(getPastDate(7));
  const [finalEndDate, setFinalEndDate] = useState<string>(getTodayKST());
  const [finalIp, setFinalIp] = useState<string>(""); // 최종 IP 저장

  const [visitorRecords, setVisitorRecords] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    console.log(`useEffect 실행됨!`);
    console.log(`오늘 날짜: ${new Date().toISOString().split("T")[0]}`);
    console.log(`finalStartDate: ${finalStartDate}, finalEndDate: ${finalEndDate}, finalIp: ${finalIp}`);
    fetchVisitorRecords(finalStartDate, finalEndDate, finalIp);
  }, [page, finalIp]); // ✅ finalIp도 감지하도록 수정

  // 방문자 기록 조회 함수
  const fetchVisitorRecords = async (startDate: string, endDate: string, ip: string) => {
    try {
      console.log("조회 기간:", startDate, "→", endDate, "IP:", ip);
      const response = await getVisitorRecordsWithPagination(page, 10, startDate, endDate, ip);
      setVisitorRecords(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("방문자 기록 조회 실패:", error);
    }
  };

  // 1일, 7일 등 버튼 클릭 시 실행
  const handleDateRangeClick = (days: number) => {
    setSelectedRange(days);
    setShowCustomDate(false);
    setCustomStartDate(getPastDate(days));
    setCustomEndDate(getTodayKST());
  };

  // '확인' 버튼 클릭 시 실행 (기간 + IP 반영)
  const handleSearchConfirm = () => {
    setFinalStartDate(customStartDate);
    setFinalEndDate(customEndDate);
    setFinalIp(searchIp);
    setPage(0); // 검색 시 첫 페이지로 초기화
    fetchVisitorRecords(customStartDate, customEndDate, searchIp);
  };

  return (
    <div className="admin-visitor-wrapper">
      <Header />
      <div className="admin-visitor-container">
        <h2>방문자 통계 보고서</h2>

        <div className="visitor-stats-container">
            <div className="visitor-stat-box">
                {/* 검색 기간 버튼 */}
                <div className="date-buttons">
                {[1, 2, 3, 7, 31].map((day) => (
                    <button
                    key={day}
                    className={selectedRange === day ? "selected" : ""}
                    onClick={() => handleDateRangeClick(day)}
                    >
                    {day}일
                    </button>
                ))}
                <button
                    className={selectedRange === -1 ? "selected" : ""}
                    onClick={() => {
                    setSelectedRange(-1);
                    setShowCustomDate(true);
                    }}
                >
                    직접 선택
                </button>
                </div>
                {/* 직접 날짜 선택 */}
                {showCustomDate && (
                <div className="custom-date-picker">
                    <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                    <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                </div>
                )}

                {/* IP 주소 검색 필드 */}
                <div className="search-container">
                <input
                    type="text"
                    placeholder="IP 주소 입력(아무것도 입력 안할 시 전체)"
                    value={searchIp}
                    onChange={(e) => setSearchIp(e.target.value)}
                />
                </div>
            </div>
        </div>
        <button className="search-btn" onClick={handleSearchConfirm}>확인</button>

        <div className="visitor-stats-container">
          <div className="visitor-stat-box">
            <h3>시간대별 방문 기록</h3>
            {/* IP 필터링 추가 */}
            <VisitorHourlyChart startDate={finalStartDate} endDate={finalEndDate} searchIp={finalIp} />
          </div>
        </div>

        <div className="visitor-stats-container">
            <div className="visitor-stat-box">
                <h3>날짜별 방문자 수</h3>
                <div className="visitor-chart-container">
                    {/* IP 필터링 추가 */}
                    <VisitorChart startDate={finalStartDate} endDate={finalEndDate} searchIp={finalIp} />
                </div>
            </div>
        </div>

        <div className="visitor-stats-container">
            <div className="visitor-stat-box">
                <h3>날짜별 방문자 목록</h3>
                <div className="visitor-table-container">
                    <table className="visitor-table">
                    <thead>
                        <tr>
                        <th>날짜</th>
                        <th>IP 주소</th>
                        <th>방문 횟수</th>
                        <th>생성 시간</th>
                        <th>수정 시간</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visitorRecords.map((record, index) => (
                        <tr key={index}>
                            <td>{record.visitDate}</td>
                            <td>{record.ip}</td>
                            <td>{record.visitCount}</td>
                            <td>{record.createdAt}</td>
                            <td>{record.updatedAt}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>

                </div>
            </div>

          {/* 페이지네이션 */}
          <div className="pagination">
            <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>이전</button>
            <span>{page + 1} / {totalPages}</span>
            <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={page === totalPages - 1}>다음</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminVisitorPage;
