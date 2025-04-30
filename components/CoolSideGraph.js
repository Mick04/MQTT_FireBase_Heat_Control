//CoolSideGraph.js

import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect, useCallback,useRef } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  Alert,
} from "react-native";
import { DataContext } from "../DataContext";
import { useFocusEffect } from "@react-navigation/native";
//import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get } from "firebase/database";
import { database } from "../firebaseConfig";
import MqttService from "./MqttService";
import CustomLineChart from "./CustomLineChart"; // Import the reusable component
import { fetchData } from "../components/fetchData"; // Adjust the path as needed
import { styles } from "../Styles/styles";

const CoolSideGraph = () => {
  const [mqttService, setMqttService] = useState(null);
  const [coolSide, setCoolSideTemp] = useState("");
  const [gaugeHours, setGaugeHours] = useState(0);
  const [gaugeMinutes, setGaugeMinutes] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const dataFetchedRef = useRef(false); // Flag to track data fetching
  // const [textColor, setTextColor] = useState('red'); // Example color state
  // const [count, setStoreCount] = useState(0)
  const { sensorData, timeData, isLoading } = useContext(DataContext);
  const [data, setData] = useState([
    // { value: -10, label: "10:00", dataPointText: "-10 c˚" },
  ]);

  useEffect(() => {
    if (!isLoading && sensorData) {
      const formattedData = Object.entries(sensorData).map(([key, value]) => ({
        value: value.green,
        label: `${value.hour}:${value.minute.toString().padStart(2, "0")}`,
        dataPointText: `${value.green} c˚`,
      }));
  
      setData(formattedData);
    }
  }, [sensorData, isLoading]);

  // Define the onMessageArrived callback

  const onMessageArrived = useCallback((message) => {
    console.log("Message arrived: ", message);
  
    if (message.destinationName === "coolSide") {
      const newTemp = parseFloat(message.payloadString).toFixed(2);
      const lastTemp = data.length > 0 ? data[data.length - 1].value : null;
  
      if (lastTemp === null || Math.abs(newTemp - lastTemp) >= 0.01) {
        const formattedTemp = parseFloat(newTemp);
        setCoolSideTemp(formattedTemp);
  
        const newLabel = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
  
        const newDataPoint = {
          value: formattedTemp,
          label: newLabel,
          dataPointText: `${formattedTemp} c˚`,
        };
  
        setData((prevData) => [...prevData, newDataPoint]);
      }
    }
  
    if (message.destinationName === "time/hour") {
      setGaugeHours(parseInt(message.payloadString));
    }
  
    if (message.destinationName === "time/minute") {
      setGaugeMinutes(parseInt(message.payloadString));
    }
  }, [data]);

  const mqttServiceRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      console.log("coolSide screen is focused");
  
      const fetchCoolSideData = async () => {
        try {
          console.log("Fetching data from Firebase...");
          const bufferSize = 100;
          const entriesToFetch = 100;
          const sensorKey = "green";
  
          const fetchedData = await fetchData(bufferSize, entriesToFetch, sensorKey);
  
          setData((prevData) => {
            const mergedData = [...fetchedData, ...prevData];
            const uniqueData = mergedData.filter(
              (item, index, self) =>
                index === self.findIndex((t) => t.label === item.label)
            );
            return uniqueData;
          });
        } catch (error) {
          console.error("Error fetching data from Firebase:", error);
        }
      };
  
      if (!dataFetchedRef.current) {
        console.log("Fetching data from Firebase...");
        fetchCoolSideData();
        dataFetchedRef.current = true;
      }
  
      if (!mqttServiceRef.current) {
        const mqtt = new MqttService(onMessageArrived, setIsConnected);
        mqtt.connect("Tortoise", "Hea1951Ter", {
          onSuccess: () => {
            setIsConnected(true);
  
            mqtt.client.subscribe("coolSide");
            mqtt.client.subscribe("time/hour");
            mqtt.client.subscribe("time/minute");
  
            const currentHour = new Date().getHours();
            const currentMinute = new Date().getMinutes();
            setGaugeHours(currentHour);
            setGaugeMinutes(currentMinute);
          },
          onFailure: (error) => {
            setIsConnected(false);
            console.error("CoolSide MQTT connection failed:", error);
          },
        });
  
        mqttServiceRef.current = mqtt;
      }
  
      return () => {
        console.log("coolSideis unfocused, cleaning up...");
        if (mqttServiceRef.current) {
          mqttServiceRef.current.disconnect();
          mqttServiceRef.current = null;
        }
        setIsConnected(false);
      };
    }, [onMessageArrived])
  );

  function handleReconnect() {
    if (mqttService) {
      mqttService.reconnect();
      mqttService.reconnectAttempts = 0;
    } else {
      console.error("MQTT service is not initialized");
    }
  }

  const addDataPoint = () => {
    const newValue = parseFloat(inputValue);
    if (isNaN(newValue)) {
      Alert.alert("Invalid input", "Please enter a valid number", [
        { text: "OK" },
      ]);
      return;
    }
    const newLabel = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newDataPoint = {
      value: newValue,
      label: newLabel,
      dataPointText: `${newValue} c˚`,
    };
    const updatedData = [...data, newDataPoint];
    setData(updatedData);
    setInputValue("");
    set(ref(database, "mqtt/data"), updatedData); // Store data in Firebase
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.graphContainer}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.graphContainer}>
      <View>
        <Text style={styles.header}> MQTT_FireBase_Heat_Control</Text>
        <Text style={styles.header}> coolSide Temperature</Text>
        <Text style={styles.timeText}>Hours: Minutes</Text>
        <Text style={styles.time}>
          {gaugeHours}:{gaugeMinutes.toString().padStart(2, "0")}
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
      <CustomLineChart data={data} GraphTextcolor={"green"} curved={true} />
      <TouchableOpacity
        style={styles.reconnectButton}
        onPress={handleReconnect}
      >
        <Text style={styles.reconnectText}>Reconnect</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};
export default CoolSideGraph;
