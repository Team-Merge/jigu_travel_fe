import { Link } from "react-router-dom";
import Header from "../components/Header";

import AiProfile from "../assets/images/ai-profile.png";
import "../styles/ErrorPage.css";

const ErrorPage: React.FC = () => {
  return (
    <div className="error-container">
      <div className="header-wrapper">
        <Header />
      </div>
      <div className="error-main">
        <h1 className="error-title">404</h1>
        <div className="error-content">
          <div className="error-profile">
            <img src={AiProfile} alt="ai-profile" className="error-image" />
            <div className="error-bubble">이 페이지를 찾을 수 없어요!</div>
          </div>
          <div className="error-text">
            <h2>페이지를 찾을 수 없습니다.</h2>
            <p>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
            <Link to="/" className="error-button">홈으로 돌아가기</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
