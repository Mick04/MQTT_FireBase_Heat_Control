import React, { useRef, useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { styles } from "../Styles/styles";

const CustomLineChart = ({ data, GraphTextcolor,curved }) => {
  const scrollViewRef = useRef(null);
  const navigation = useNavigation(); // Access the navigation object

  const scrollToEnd = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToEnd();
  }, [data]);

  useFocusEffect(
    React.useCallback(() => {
      scrollToEnd();
    }, [])
  );
  const renderXAxisLabel = (value) => {
    console.log("renderXAxisLabel - value:", value);
    let dateString = "Invalid Date";
    let timeString = value.label;

    // Check if value.label is a valid string
    if (value.label) {
      // Combine current date with time to create a valid date object
      const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
      const combinedDateTime = `${today}T${value.label}`;
      const date = new Date(combinedDateTime);

      if (!isNaN(date)) {
        dateString = date.toLocaleDateString(); // Format the date
        timeString = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }); // Format the time
      }
    }

    return (
      <View style={{ alignItems: "center", paddingTop: 220,marginLeft: 20 }}>
        <Text style={{ color: "red", fontSize: 25,marginBottom: 40 }}>hi ******{dateString}</Text>
        <Text style={{ color: "green", fontSize: 45 }}>{timeString}</Text>
      </View>
    );
  };

  return (
    <View style={styles.lineGraphContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        contentContainerStyle={{ flexGrow: 1 }}
        onTouchStart={() => navigation.setOptions({ swipeEnabled: false })} // Disable swipe gestures
        onTouchEnd={() => navigation.setOptions({ swipeEnabled: true })} // Re-enable swipe gestures
      >
        <LineChart
          data={data}
          color={GraphTextcolor}
          thickness={2}
          width={data.length * 94} // Adjust width based on data length
          height={200}
          initialSpacing={0}
          xAxisLabelComponent={renderXAxisLabel}
          yAxisLabelTextStyle={{ color: "red", fontSize: 52 }}
          dataPointsRadius={3}
          textShiftY={65} // Move data points up by 10 units={20}
          hideYAxisText
          spacing={100}
          textFontSize={26} // font size of the text on the data points
          textColor1={GraphTextcolor}
          showScrollIndicator={true}
          yAxisMinValue={-10} // Ensure y-axis starts from =10
          yAxisMaxValue={40} // Ensure y-axis ends at 30
          curved={curved} // Make the line points curved
        />
      </ScrollView>
    </View>
  );
};
export default CustomLineChart;
