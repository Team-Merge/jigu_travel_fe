import React, {useState} from "react";
import "../styles/BoardTab.css";
import FAQ from "./FAQ";
import ServiceDescription  from "./ServiceDescription";
import QnA from "./QnA";
import BoardList from "../pages/BoardList";
import BoardCreate from "../pages/BoardCreate";
import Header from "./Header";

const tabs = ["서비스 설명", "자주 묻는 질문", "묻고 답하기"];
type TabType = "list" | "create";

const BoardTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0); // ✅ 탭 상태를 BoardTabs 내부에서 관리
    const [boardState, setBoardState] = useState<TabType>("list");
  return (
    
    <div className="tabs-container">
        <Header />
      <div className="tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            className={`tab ${activeTab === index ? "active" : ""}`}
            onClick={() => {
                setActiveTab(index);
                setBoardState("list"); // ✅ "묻고 답하기" 탭 클릭 시 항상 목록으로 이동
              }}
          >
            {tab}
          </button>
        ))}

        </div>
        {/* ✅ 탭 내용 표시 */}
        <div className="board-content">
            {activeTab === 0 && <ServiceDescription />}
            {activeTab === 1 && <FAQ />}
            {activeTab === 2 && (
                <>
                {boardState === "list" ? (
                  <BoardList goToCreate={() => setBoardState("create")} />
                ) : (
                  <BoardCreate goToList={() => setBoardState("list")} />
                )}
              </>
            )}
      </div>
      
    </div>
  );
};

export default BoardTabs;
