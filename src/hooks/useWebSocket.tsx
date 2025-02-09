import { Client } from "@stomp/stompjs";
import React, { useEffect, useState, useRef } from "react";
import { fetchUUID, saveUserLocation } from "../utils/api";

const socketUrl = window.location.protocol === "https:"
    ? "wss://jigu-travel.kro.kr/stomp-ws"
    : "ws://localhost:8080/stomp-ws";

const useWebSocket = (userLocation, interests, isWebSocketReady, isWebSocketActive, setIsTravelEnding) => {
  const [client, setClient] = useState<Client | null>(null);
  const [places, setPlaces] = useState([]);
  const [serviceUUID, setServiceUUID] = useState<string | null>(() => localStorage.getItem("serviceUUID"));
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const subscriptionRef = useRef<any>(null); //
  const reconnectAttempts = useRef(0);
  const jwtToken = localStorage.getItem("jwtToken");
  const lastSentTime = useRef(0);

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
          if (!userLocation || !serviceUUID) return;

          const { lat, lng } = userLocation;
          const lastLocation = lastLocationRef.current;
          const now = Date.now();

          // 최소 5초 간격으로 11m 이상 위치 변화 있는 경우에만 전송
          if (now - lastSentTime.current < 5000) return;
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
                      lastSentTime.current = now;
                    }
                  };
        sendLocation();
              },

      onDisconnect: () => {
          if (!isTravelEnding) {
              console.warn(" WebSocket 연결 끊김. 재연결 시도 중...");
              alert(" 네트워크 연결이 끊어졌습니다. 자동으로 다시 연결을 시도합니다.");
              attemptReconnect();
            }
        },

      onStompError: (frame) => {
              console.error("WebSocket 에러 발생:", frame.headers["message"]);
              alert(" 알 수 없는 오류가 발생했습니다. 페이지를 새로고침 해보세요.");
            },

      onWebSocketError: (event) => {
              console.error("WebSocket 네트워크 오류 발생:", event);
              alert(" 인터넷 연결이 원활하지 않습니다. 인터넷 연결을 확인해주세요.");
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

    // 웹소켓 재연결
    const attemptReconnect = () => {
        if (reconnectAttempts.current >= 5) {
          console.error(" WebSocket 재연결 시도 5회 초과! 중단합니다.");
          alert("실시간 위치 감지에 실패했습니다. 페이지를 새로고침 하거나 인터넷 연결을 확인해주세요.");
          return;
        }
        reconnectAttempts.current += 1;
        console.log(`WebSocket 재연결 시도 중.. (${reconnectAttempts.current}/5)`);

        setTimeout(() => {
          console.log("새로운 WebSocket 클라이언트 생성");
          const newClient = new Client({ brokerURL: socketUrl });
          newClient.activate();
          setClient(newClient);
        }, 5000); // 5초 후 재연결 시도
      };

    // 위치 데이터 5분마다 자동 저장
    useEffect(() => {
        if (!userLocation) return; // 위치 정보가 없으면 실행하지 않음

        const interval = setInterval(() => {
          saveUserLocation(userLocation.lat, userLocation.lng)
            .then(() => console.log("5분마다 위치 저장 완료:", userLocation))
            .catch((error) => console.error("위치 저장 오류:", error));
        }, 300000); // 5분마다 실행

        return () => clearInterval(interval);
      }, [userLocation]); // userLocation 변경 시 실행

    return { places };
        };

export default useWebSocket;
