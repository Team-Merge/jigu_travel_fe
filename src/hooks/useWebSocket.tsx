import { Client } from "@stomp/stompjs";
import React, { useEffect, useState, useRef } from "react";
import { fetchUUID, calculateDistance } from "../utils/api";  // `saveUserLocation` 제거

const socketUrl = window.location.protocol === "https:"
    ? "wss://jigu-travel.kro.kr/stomp-ws"
    : "ws://localhost:8080/stomp-ws";

const useWebSocket = (userLocation, interests, isWebSocketReady, isWebSocketActive, setIsTravelEnding) => {
  const [client, setClient] = useState<Client | null>(null);
  const [places, setPlaces] = useState([]);
  const [serviceUUID, setServiceUUID] = useState<string | null>(() => localStorage.getItem("serviceUUID"));
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const subscriptionRef = useRef<any>(null);
  const reconnectAttempts = useRef(0);
  const jwtToken = localStorage.getItem("jwtToken");
  const lastSentTime = useRef(0);
  const maxReconnectAttempts = 5;

  // UUID 가져오기
  useEffect(() => {
    const fetchAndStoreUUID = async () => {
      if (!serviceUUID) {
        const newUUID = await fetchUUID();
        if (newUUID) {
          localStorage.setItem("serviceUUID", newUUID);
          setServiceUUID(newUUID);
        }
      }
    };

    fetchAndStoreUUID();
  }, []);

  // 웹소켓 연결 및 메시지 수신
  useEffect(() => {
    if (!isWebSocketReady || !serviceUUID || !userLocation || !isWebSocketActive) return;

    const stompClient = new Client({
      brokerURL: socketUrl,
      connectHeaders: {
          Authorization: `Bearer ${jwtToken}` // 메시지 전송 시 인증 헤더 추가
          },
      debug: (str) => console.log(str),
      reconnectDelay: 5000, // 5초 후 자동 재연결
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("WebSocket 연결 성공!");
        reconnectAttempts.current = 0;

        // 기존 구독 해제 후 재구독
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
        }
        subscriptionRef.current = stompClient.subscribe(`/sub/${serviceUUID}`, (frame) => {
          try {
            const placeData = JSON.parse(frame.body);
            console.log("받은 명소 데이터:", placeData);
            setPlaces(placeData);
          } catch (error) {
            console.error("명소 데이터 오류 발생:", error);
          }
        });

        // 위치 정보 전송
        sendLocation(stompClient);
      },

      onDisconnect: () => {
          if (!isWebSocketActive || isTravelEnding) return;
              console.warn(" WebSocket 연결 끊김. 재연결 시도 중...");
              attemptReconnect();
        },

      onStompError: (frame) => {
        console.error("WebSocket 에러 발생:", frame.headers["message"]);
      },

      onWebSocketError: (event) => {
        console.error(" WebSocket 네트워크 오류 발생:", event);
        attemptReconnect();
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      stompClient.deactivate();
      setClient(null);
    };
  }, [isWebSocketReady, userLocation, serviceUUID, isWebSocketActive]);

  // 위치 전송 로직 (5초마다 & 일정 거리 이상 이동한 경우)
  const sendLocation = (stompClient) => {
    if (!stompClient.connected) return;
    if (!userLocation || !serviceUUID) return;

    const { lat, lng } = userLocation;
    const lastLocation = lastLocationRef.current;
    const now = Date.now();

    // 최소 5초 간격으로 22m 이상 이동한 경우 전송
    if (now - lastSentTime.current >= 5000) {
      const distance = lastLocation ? calculateDistance(lastLocation.lat, lastLocation.lng, lat, lng) : Infinity;
      if (distance >= 22) {
        stompClient.publish({
          destination: "/pub/place",
          body: JSON.stringify({ serviceUUID, latitude: lat, longitude: lng }),
        });
        console.log("📡 웹소켓으로 위치 전송:", userLocation);
        lastLocationRef.current = { lat, lng };
        lastSentTime.current = now;
      }
    }
  };

  // 웹소켓 재연결
  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error(" WebSocket 재연결 시도 5회 초과! 중단합니다.");
      return;
    }

    reconnectAttempts.current += 1;
    console.log(` WebSocket 재연결 시도 중.. (${reconnectAttempts.current}/${maxReconnectAttempts})`);

    if (client) {
        client.deactivate();
        setClient(null);
    }

    setTimeout(() => {
      console.log("새로운 WebSocket 클라이언트 생성");
      const newClient = new Client({
        brokerURL: socketUrl,
        connectHeaders: { Authorization: `Bearer ${jwtToken}` },
      });
      newClient.activate();
      setClient(newClient);
    }, 5000);
  };

  return { places };
};

export default useWebSocket;
