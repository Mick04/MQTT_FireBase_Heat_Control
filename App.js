// In App.js in a new project
import { LogBox } from "react-native";
LogBox.ignoreLogs([
  'A props object containing a "key" prop is being spread into JSX',
]);
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView, StyleSheet, Platform, StatusBar } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { DataProvider } from "./DataContext.js";

import { MqttProvider } from "./components/MqttContext";
import SettingsScreen from "./components/Settings.js";
import GaugeScreen from "./components/Gauges.js";
import HomeScreen from "./components/HomeScreen.js";
import CoolSideGraph from "./components/CoolSideGraph.js";
import OutSideGraph from "./components/OutSideGraph.js";
import HeatGraph from "./components/HeaterGraph.js";
import Heater_ON_OFF_Graph from "./components/Heater_ON_OFF.js";
import { getDatabase, ref, remove } from "firebase/database";

// const db = getDatabase();
// const dateDataRef = ref(db, "dateData");
// console.log("dateDataRef: ", dateDataRef);

// remove(dateDataRef)
//   .then(() => {
//     console.log("dateData deleted successfully.");
//   })
//   .catch((error) => {
//     console.error("Error deleting dateData:", error);
//   });

const Tab = createMaterialTopTabNavigator();
function App() {
  //getDatabase();
  return (
    <MqttProvider>
      <DataProvider>
        <SafeAreaView style={styles.AndroidSafeArea}>
          <NavigationContainer>
            <Tab.Navigator
              initialRouteName="Home"
              screenOptions={{
                tabBarActiveTintColor: "red",
                tabBarInactiveTintColor: "blue",
                tabBarLabelStyle: { fontSize: 6, fontWeight: "bold" },
                tabBarIndicatorStyle: { backgroundColor: "red", height: 3 },
                tabBarStyle: { backgroundColor: "white" },
              }}
            >
              {/* <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            tabBarActiveTintColor: "red",
            tabBarInactiveTintColor: "blue",
            tabBarLabelStyle: { fontSize: 8 },
            // tabBarItemStyle: { width: 70 },
            tabBarIndicatorStyle: { backgroundColor: "red" },
            tabBarStyle: { backgroundColor: "white" },
          }}
        > */}
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Gauges" component={GaugeScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
              <Tab.Screen name="cool Side" component={CoolSideGraph} />
              <Tab.Screen name="out Side" component={OutSideGraph} />
              <Tab.Screen name="heat Graph" component={HeatGraph} />
              <Tab.Screen name="HeaterStatus" component={Heater_ON_OFF_Graph} />
            </Tab.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </DataProvider>
    </MqttProvider>
  );
}

const styles = StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});
export default App;
