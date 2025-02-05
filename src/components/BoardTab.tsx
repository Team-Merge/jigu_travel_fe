import React, {useState} from "react";
import "../styles/BoardTab.css";
import FAQ from "./FAQ";
import ServiceDescription  from "./ServiceDescription";
import BoardList from "../pages/BoardList";
import BoardCreate from "../pages/BoardCreate";
import BoardDetail from "../pages/BoardDetail";
import BoardEdit from "../pages/BoardEdit"; 
import Header from "./Header";

const tabs = ["서비스 설명", "자주 묻는 질문", "묻고 답하기"];
type TabType = "list" | "create" | "detail" | "edit";

const BoardTabs: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0); // ✅ 탭 상태를 BoardTabs 내부에서 관리
    const [boardState, setBoardState] = useState<TabType>("list");
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  return (
    <>
    <Header />
    <div className="tabs-container">
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
                {boardState === "list" && (
                    <BoardList 
                        goToCreate={() => setBoardState("create")} 
                        goToDetail={(postId: number) => {
                        setSelectedPostId(postId); 
                        setBoardState("detail");
                        }} 
                    />
                    )}
                    {boardState === "create" && (
                    <BoardCreate goToList={() => setBoardState("list")} />
                    )}
                    {boardState === "detail" && selectedPostId !== null && (
                    <BoardDetail 
                        postId={selectedPostId} 
                        goToList={() => setBoardState("list")}
                        goToEdit={() => setBoardState("edit")} 
                    />
                    )}
                    {boardState === "edit" && selectedPostId !== null && (
                    <BoardEdit 
                        postId={selectedPostId} 
                        goToList={() => setBoardState("list")}
                        goToDetail={() => setBoardState("detail")} // ✅ 수정 후 상세보기 이동
                    />
                    )}
                </>
                )}
      </div>
      
    </div>
    </>
  );
};

export default BoardTabs;
