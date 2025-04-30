import React, { createContext, useState, useEffect, useCallback } from "react";
import MqttService from "./MqttService";

export const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const [mqttService, setMqttService] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const onMessageArrived = useCallback((message) => {
    console.log("Message arrived:", message.destinationName, message.payloadString);
    // Handle the message here or pass it to a handler function
  }, []);

  useEffect(() => {
    const mqtt = new MqttService(onMessageArrived, setIsConnected);
    mqtt.connect("ESP32FireBaseTortoise", "ESP32FireBaseHea1951Ter", {
      onSuccess: () => {
        console.log("Connected to MQTT broker");
        setIsConnected(true);
        mqtt.client.subscribe("outSide");
        mqtt.client.subscribe("coolSide");
        mqtt.client.subscribe("heater");
        mqtt.client.subscribe("HeaterStatus");
        mqtt.client.subscribe("TargetTemperature");
        mqtt.client.subscribe("time/hour");
        mqtt.client.subscribe("time/minute");
      },
      onFailure: (error) => {
        console.error("Failed to connect to MQTT broker", error);
        setIsConnected(false);
      },
    });

    setMqttService(mqtt);

    return () => {
      if (mqtt) {
        mqtt.disconnect();
      }
      setIsConnected(false);
    };
  }, [onMessageArrived]);

  return (
    <MqttContext.Provider value={{ mqttService, isConnected }}>
      {children}
    </MqttContext.Provider>
  );
};