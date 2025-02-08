import { Client } from "@stomp/stompjs";
import React, { useEffect, useState, useRef } from "react";
import { fetchUUID } from "../utils/api";

const socketUrl = window.location.protocol === "https:"
    ? "wss://jigu-travel.kro.kr/stomp-ws"
    : "ws://localhost:8080/stomp-ws";

const useWebSocket = (userLocation, interests, isWebSocketReady) => {
  const [client, setClient] = useState<Client | null>(null);
  const [places, setPlaces] = useState([]);
  const [serviceUUID, setServiceUUID] = useState<string | null>(() => localStorage.getItem("serviceUUID"));
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const subscriptionRef = useRef<any>(null); //
  const reconnectAttempts = useRef(0);
  const jwtToken = localStorage.getItem("jwtToken");

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

  useEffect(() => {
    if (!isWebSocketReady || !serviceUUID || !userLocation) return;

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

        // 기존 구독 해제 후 새로 구독
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

        // 위치 정보 변경될 때만 publish
        const sendLocation = () => {
          if (!stompClient.connected) return;
          if (!userLocation) return;

          const { lat, lng } = userLocation;
          const lastLocation = lastLocationRef.current;
          if (!lastLocation ||
              Math.abs(lat - lastLocation.lat) > 0.0001 ||
               Math.abs(lng - lastLocation.lng) > 0.0001
                    ) {
                      stompClient.publish({
                        destination: "/pub/place",
                        body: JSON.stringify({
                          serviceUUID: serviceUUID,
                          latitude: lat,
                          longitude: lng,
                        }),
                      });
                      console.log("웹소켓으로 위치 전송:", userLocation);
                      lastLocationRef.current = { lat, lng };
                    }
                  };
        sendLocation();
              },

      onDisconnect: () => {
              console.warn(" WebSocket 연결 끊김. 재연결 시도 중...");
              attemptReconnect();
            },

      onStompError: (frame) => {
              console.error("WebSocket 에러 발생:", frame.headers["message"]);
            },

      onWebSocketError: (event) => {
              console.error("WebSocket 네트워크 오류 발생:", event);
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
      }, [isWebSocketReady, userLocation]);

    // 웹소켓 재연결
    const attemptReconnect = () => {
        if (reconnectAttempts.current >= 5) {
          console.error(" WebSocket 재연결 시도 5회 초과! 중단합니다.");
          return;
        }
        reconnectAttempts.current += 1;
        console.log(`WebSocket 재연결 시도 중.. (${reconnectAttempts.current}/5)`);

        setTimeout(() => {
          setClient(null); // 기존 클라이언트 초기화
          setTimeout(() => setClient(new Client({ brokerURL: serverUrl })), 1000); // 새로운 클라이언트 생성
        }, 5000); // 5초 후 재연결 시도
      };

      return { places };
    };

export default useWebSocket;
