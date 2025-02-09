import React, { useEffect, useState } from "react";
import { getAllActiveUsers, getDeletedUsers, setAdminStatus, deleteUserByAdmin, restoreUser } from "../utils/api";
import { useNavigate } from "react-router-dom";
import "../styles/AdminUsersPage.css";
import Header from "../components/Header";

interface User {
    userId: string;
    loginId: string;
    nickname: string;
    role: string;
    updatedAt: string;
    createdAt: string;
    
}

const AdminUsersPage: React.FC = () => {
    const navigate = useNavigate();

    // 일반 사용자 목록 (탈퇴되지 않은 사용자)
    const [activeUsers, setActiveUsers] = useState<User[]>([]);
    const [activeUserPage, setActiveUserPage] = useState<number>(0);
    const [totalActivePages, setTotalActivePages] = useState<number>(1);

    // 탈퇴된 사용자 목록
    const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
    const [deletedUserPage, setDeletedUserPage] = useState<number>(0);
    const [totalDeletedPages, setTotalDeletedPages] = useState<number>(1);

    const [loading, setLoading] = useState<boolean>(true);
    const [searchId, setSearchId] = useState<string>("");

    useEffect(() => {
        fetchUsers();
    }, [activeUserPage]);

    useEffect(() => {
        fetchDeletedUsers();
    }, [deletedUserPage]);

    // 일반 사용자 목록 가져오기
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await getAllActiveUsers(activeUserPage, 10);

            // createdAt 기준 내림차순 정렬 (최신 가입자 순)
            const sortedUsers = response.content.sort((a: User, b: User) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setActiveUsers(response.content || []);
            setTotalActivePages(response.totalPages || 1);
        } catch (error) {
            console.error("일반 사용자 목록 불러오기 실패:", error);
        }
        setLoading(false);
    };

    // 탈퇴된 사용자 목록 가져오기
    const fetchDeletedUsers = async () => {
        try {
            const response = await getDeletedUsers(deletedUserPage, 10);
            
            // updatedAt 기준 내림차순 정렬
            const sortedUsers = response.content.sort((a: User, b: User) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
    
            setDeletedUsers(sortedUsers);
            setTotalDeletedPages(response.totalPages || 1);
        } catch (error) {
            console.error("탈퇴된 사용자 목록 불러오기 실패:", error);
        }
    };

    // 관리자 권한 부여/해제
    const handleAdminToggle = async (userId: string, currentRole: string) => {
        const newRole = currentRole === "ROLE_ADMIN" ? "ROLE_USER" : "ROLE_ADMIN";
        try {
            await setAdminStatus(userId, newRole);
            fetchUsers(); // 업데이트된 목록 가져오기
        } catch (error) {
            alert("권한 변경에 실패했습니다.");
        }
    };

    // 사용자 강제 탈퇴
    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("정말 이 사용자를 탈퇴 처리하시겠습니까?")) return;
        try {
            await deleteUserByAdmin(userId);
            fetchUsers(); // 업데이트된 목록 가져오기
            fetchDeletedUsers(); // 탈퇴된 사용자 목록도 새로고침
        } catch (error) {
            alert("사용자 삭제에 실패했습니다.");
        }
    };

    // 탈퇴된 사용자 복구
    const handleRestoreUser = async (userId: string) => {
        if (!window.confirm("이 사용자를 복구하시겠습니까?")) return;
        try {
            await restoreUser(userId);
            fetchUsers(); // 일반 사용자 목록 새로고침
            fetchDeletedUsers(); // 탈퇴된 사용자 목록도 새로고침
        } catch (error) {
            alert("사용자 복구에 실패했습니다.");
        }
    };

    // 검색 기능 (일반 사용자만 검색 가능)
    const handleSearch = () => {
        console.log("검색 실행:", searchId);
        setActiveUsers(activeUsers.filter(user => user.loginId.includes(searchId) || user.nickname.includes(searchId)));
    };

    return (
        <div className="admin-users-wrapper">
            <Header />
            <div className="admin-users-container">
                <h2>사용자 관리</h2>

                <div className="stats-container">
                    {/* 검색 필드 */}
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="아이디 또는 닉네임 검색"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                    </div>

                </div>

                <button className="search-btn" onClick={handleSearch}>검색</button>

                {/* 일반 사용자 목록 */}
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="stat-header">
                            <h2>일반 사용자 목록</h2>
                        </div>
                        <div className="user-table active-user-table">
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>아이디</th>
                                        <th>닉네임</th>
                                        <th>권한</th>
                                        <th>관리자 설정</th>
                                        <th>강제 탈퇴</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={5}>로딩 중...</td></tr>
                                    ) : activeUsers.length > 0 ? (
                                        activeUsers.map((user) => (
                                            <tr key={user.userId}>
                                                <td>{user.loginId}</td>
                                                <td>{user.nickname}</td>
                                                <td>{user.role === "ROLE_ADMIN" ? "관리자" : "일반"}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleAdminToggle(user.userId, user.role)}
                                                        className={`admin-btn ${user.role === "ROLE_ADMIN" ? "selected" : ""}`}
                                                    >
                                                        {user.role === "ROLE_ADMIN" ? "해제" : "부여"}
                                                    </button>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleDeleteUser(user.userId)} className="delete-btn">
                                                        탈퇴
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={5}>사용자 없음</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 일반 사용자 페이지네이션 */}
                        <div className="pagination">
                            <button onClick={() => setActiveUserPage(Math.max(activeUserPage - 1, 0))} disabled={activeUserPage === 0}>이전</button>
                            <span>{activeUserPage + 1} / {totalActivePages}</span>
                            <button onClick={() => setActiveUserPage(activeUserPage + 1)} disabled={activeUserPage >= totalActivePages - 1}>다음</button>
                        </div>
                    </div>
                </div>

                {/* 탈퇴된 사용자 목록 */}
                <div className="stats-container">
                    <div className="stat-box">
                        <div className="stat-header">
                            <h2>탈퇴된 사용자 목록</h2>
                        </div>
                        <div className="user-table deleted-user-table">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>아이디</th>
                                    <th>닉네임</th>
                                    <th>탈퇴일</th>
                                    <th>복귀</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deletedUsers.length > 0 ? (
                                    deletedUsers.map((user) => (
                                        <tr key={user.userId}>
                                            <td>{user.loginId}</td>
                                            <td>{user.nickname}</td>
                                            <td>{new Date(user.updatedAt).toLocaleDateString()}</td>
                                            <td>
                                                <button onClick={() => handleRestoreUser(user.userId)} className="restore-btn">
                                                    복귀
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={3}>탈퇴된 사용자 없음</td></tr>
                                )}
                            </tbody>
                        </table>
                        </div>
                        {/* 탈퇴된 사용자 페이지네이션 */}
                        <div className="pagination">
                            <button onClick={() => setDeletedUserPage(Math.max(deletedUserPage - 1, 0))} disabled={deletedUserPage === 0}>이전</button>
                            <span>{deletedUserPage + 1} / {totalDeletedPages}</span>
                            <button onClick={() => setDeletedUserPage(deletedUserPage + 1)} disabled={deletedUserPage >= totalDeletedPages - 1}>다음</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsersPage;
