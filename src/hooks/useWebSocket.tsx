// npm install @stomp/stompjs

import Stomp from "@stomp/stompjs";
import { Client } from "@stomp/stompjs";
import React, { useEffect, useState, useRef } from "react";
import { fetchUUID } from "../utils/api";

const serverUrl = "ws://localhost:8080/stomp-ws";

const useWebSocket = (userLocation, interests) => {
  const [client, setClient] = useState<Client | null>(null);
  const [places, setPlaces] = useState([]);
  const [serviceUUID, setServiceUUID] = useState<string | null>(() => localStorage.getItem("serviceUUID"));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionRef = useRef<any>(null); //
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
    if (!serviceUUID || !userLocation || interests.length === 0) return;

    const stompClient = new Client({
      brokerURL: serverUrl,
      connectHeaders: {
                  Authorization: `Bearer ${jwtToken}` // 메시지 전송 시 인증 헤더 추가
              },
      debug: (str) => console.log(str),
      reconnectDelay: 5000, // 5초 후 자동 재연결
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("WebSocket 연결 성공!");

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

        // 5초마다 위치 정보 & 관심사 전송 (setInterval ID를 useRef에 저장)
        intervalRef.current = setInterval(() => {
          if (stompClient.connected) {
            stompClient.publish({
              destination: "/pub/place",
              body: JSON.stringify({
                serviceUUID,
                latitude: userLocation.lat,
                longitude: userLocation.lng,
                interests, // 관심사 포함
              }),
            });
            console.log("웹소켓으로 위치 & 관심사 전송:", userLocation, interests);
          }
        }, 5000);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      // 컴포넌트 언마운트 시 `clearInterval()` 및 웹소켓 해제
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      stompClient.deactivate();
      setClient(null);
    };
  }, [userLocation, interests]);

  return { places };
};

export default useWebSocket;
