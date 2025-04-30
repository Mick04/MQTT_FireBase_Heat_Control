import React, { createContext, useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "./firebaseConfig";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [sensorData, setSensorData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log("Fetching data from Firebase...");
      const dataRef = ref(database, "sensorData");
      const timeRef = ref(database, "timeData");

      const [dataSnapshot, timeSnapshot] = await Promise.all([
        get(dataRef),
        get(timeRef),
      ]);

      const sensorData = dataSnapshot.val() || {};
      const timeData = timeSnapshot.val() || {};

      setSensorData(sensorData);
      setTimeData(timeData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ sensorData, timeData, isLoading }}>
      {children}
    </DataContext.Provider>
  );
};