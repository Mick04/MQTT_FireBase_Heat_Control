//Gauges.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import MqttService from "./MqttService";
import { styles } from "../Styles/styles";
const GaugeScreen = () => {
  const [mqttService, setMqttService] = useState(null);
  const [outSide, setOutSideTemp] = useState("");
  const [coolSide, setCoolSideTemp] = useState("");
  const [heater, setHeaterTemp] = useState("");
  const [gaugeHours, setGaugeHours] = useState(0);
  const [gaugeMinutes, setGaugeMinutes] = useState(0);
  const [HeaterStatus, setHeaterStatus] = useState(false);
  const [targetTemperature, setTargetTemperature] = useState(0);
  const [time, setTime] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Define the onMessageArrived callback
  const onMessageArrived = useCallback((message) => {
    switch (message.destinationName) {
      case "outSide":
        setOutSideTemp(parseFloat(message.payloadString).toFixed(1));
        console.log("***** outSide******: ", message.payloadString);
        break;
      case "coolSide":
        setCoolSideTemp(parseFloat(message.payloadString).toFixed(1));
        console.log("***** coolSide******: ", message.payloadString);
        break;
      case "heater":
        setHeaterTemp(parseFloat(message.payloadString).toFixed(1));
        console.log("***** heater******: ", message.payloadString);
        break;
      // case "time/hour":
      //   setGaugeHours(parseInt(message.payloadString));
      //   console.log("***** time/hour******: ", message.payloadString);
      //   break;
      case "time/minute":
        setGaugeMinutes(parseInt(message.payloadString));
        console.log("***** gaugeMinutes******: ", message.payloadString);
        break;
      case "HeaterStatus":
        const newStatus = message.payloadString.trim() === "true";
        setHeaterStatus(newStatus);
        console.log("***** HeaterStatus******: ", message.payloadString);
        break;
      case "TargetTemperature":
        console.log("***** TargetTemperature******: ", message.payloadString);
        setTargetTemperature(parseInt(message.payloadString));

        break;
        case "wemos/status":
          const status = message.payloadString.trim().toLowerCase();
          const onlineStatus = status === "online"; // true if "online", false if "offline"
          setIsOnline(onlineStatus);
          console.log("***** wemos/status******: ", message.payloadString);
  console.log("***** isOnline******: ", isOnline);
          break;    
      case "test/time":
        setTime(message.payloadString);
        break;
      default:
        console.log("Unknown topic:", message.destinationName);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Gauge Screen is focused");

      // Initialize the MQTT service
      const mqtt = new MqttService(onMessageArrived, setIsConnected);
      // console.log("line 55 Guages mqtt: ", mqtt);
      mqtt.connect("ESP32FireBaseTortoise", "ESP32FireBaseHea1951Ter", {
        onSuccess: () => {
          // console.log(
          //   "Settings line 76 TemperatureGraph Connected to MQTT broker"
          // );
          setIsConnected(true);
          mqtt.client.subscribe("outSide"); //Blue
          mqtt.client.subscribe("coolSide"); //Green
          mqtt.client.subscribe("heater"); //Red
          mqtt.client.subscribe("wemos/status");
          //mqtt.client.subscribe("gaugeMinutes");
          mqtt.client.subscribe("HeaterStatus");
          mqtt.client.subscribe("TargetTemperature");
          mqtt.client.subscribe("time/hour");
          mqtt.client.subscribe("time/minute");
          console.log("line 76 coolSide: ", coolSide);
          console.log("line 76 outSide: ", outSide);
          console.log("line 76 heater: ", heater);

          // Fetch the current time when the screen is focused
          const currentHour = new Date().getHours();
          const currentMinute = new Date().getMinutes();
          setGaugeHours(currentHour);
          setGaugeMinutes(currentMinute);
        },
        onFailure: (error) => {
          // console.error("Failed to connect to MQTT broker", error);
          setIsConnected(false);
        },
      });

      setMqttService(mqtt);

      return () => {
        console.log("Info Screen is unfocused, cleaning up...");
        // Disconnect MQTT when the screen is unfocused
        if (mqtt) {
          // console.log("Gauges line 97 Disconnecting MQTT");
          mqtt.disconnect();
        }
        setIsConnected(false); // Reset connection state
      };
    }, [onMessageArrived])
  );

  function handleReconnect() {
    // console.log("Gauges line 104 Reconnecting...");
    if (mqttService) {
      mqttService.reconnect();
      mqttService.reconnectAttempts = 0;
    } else {
      // console.log("Gauges line 110 MQTT Service is not initialized");
    }
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.heading}>MQTT_FireBase_Heat_Control</Text>
        <Text style={styles.Info}>Information</Text>
        <View>
        <Text style={styles.TargetTempText}>Wemos WiFi Status</Text>
          <Text style={[
              styles.TargetTempText,
              { color: isOnline ? "green" : "red",
              fontWeight: isOnline ? "normal" : "bold" },// Bold when offline 
            ]}>
            {"         " + (isOnline ? "On line" : "Off line")}
          </Text>
          <Text style={styles.timeText}>      Time: {gaugeHours}:{gaugeMinutes.toString().padStart(2, "0")}</Text>
          <Text
            style={[
              styles.TargetTempText,
              { color: HeaterStatus ? "red" : "green" },
            ]}
          >
            {"Heater Status = " + (HeaterStatus ? "on" : "off")}
          </Text>
        </View>
        <Text style={styles.TargetTempText}>
          {"Target Temperature = " + targetTemperature}{" "}
        </Text>
        <View style={styles.tempContainer}>
          <Text style={[styles.tempText, { color: "black" }]}>
            {"outSide Temperature = " + outSide + "\n"}
          </Text>
          <Text style={[styles.tempText, { color: "green" }]}>
            {"coolSide Temperature = " + coolSide + "\n"}
          </Text>

          <Text style={[styles.tempText, { color: "red" }]}>
            {"heater Temperature = " + heater}
          </Text>
        </View>
        <View style={styles.connectionStatus}>
          <Text
            style={[
              styles.connectionStatus,
              { color: isConnected ? "green" : "red" },
            ]}
          >
            {isConnected
              ? "Connected to MQTT Broker"
              : "Disconnected from MQTT Broker"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.reconnectButton}
          onPress={handleReconnect}
        >
          <Text style={styles.reconnectText}>Reconnect</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </ScrollView>
  );
};

export default GaugeScreen;
