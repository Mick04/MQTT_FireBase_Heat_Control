import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { Picker } from "@react-native-picker/picker"; // Import the native picker

const TemperaturePicker = ({ label, temperature, onValueChange }) => {
  // Create an array of temperature options from 0 to 100
  const temperatureOptions = Array.from({ length: 40 }, (_, i) => ({
    label: `${i}`,
    value: i,
  }));

  // Render native Picker for Android
  if (Platform.OS === "android") {
    // Check if the platform is Android
    return (
      // Return the native Picker component
      <View style={styles.container}>
        {/* <Text style={styles.label}>{label}   nnnnTemperature:</Text> */}
        <View style={styles.pickerWrapper}>
          <Picker
            // style={{ height: 50, width: 150, fontSize: 16, color: "black" }}
            style={styles.picker}
            itemStyle={{
              color: "black",
            }}
            display="spinner"
            showNativeInput={true}
            selectedValue={temperature ?? null}
            onValueChange={(itemValue) => onValueChange(itemValue)}
            mode="dropdown"
          >
            <Picker.Item label="Select a temperature..." value={0} />
            {temperatureOptions.map((option) => {
              return (
                <Picker.Item
                  style={pickerSelectStyles.inputAndroid} // Add the style prop
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              );
            })}
          </Picker>
        </View>
        <Text style={styles.label}>
          {label} Temperature: {temperature}{" "}
        </Text>
      </View>
    );
  }

  // Fallback to RNPickerSelect for iOS
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} Temperature:</Text>
      <View style={styles.pickerWrapper}>
        {/**********************************
         *           RNPickerSelect         *
         *        isn't being triggered     *
         ************************************/}
        <RNPickerSelect
          onValueChange={(value) => {
            console.log("Selected:", value);
            onValueChange(value);
          }}
          value={temperature}
          items={temperatureOptions}
          placeholder={{ label: "Select a temperature...", value: null }}
          useNativeAndroidPickerStyle={false} // no effect on iOS, but safe
          style={{
            inputIOS: {
              fontSize: 24,
              paddingVertical: 112,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: "gray",
              borderRadius: 4,
              color: "black",
              paddingRight: 30,
              backgroundColor: "yellow",
            },
          }}
        />

        {/* <RNPickerSelect
          onValueChange={onValueChange}
          items={temperatureOptions}
          placeholder={{
            label: "Select a temperature...",
            value: null,
            console: "Please select a temperature",
            color: "blue",
          }}
          value={temperature}
          // useNativeAndroidPickerStyle={false} // Use custom styles for Android
          textInputProps={{ style: pickerSelectStyles.inputIOS }}
        /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  label: {
    fontSize: 18,
    padding: 10,
    // marginTop: 30,
    marginLeft: 30,
    alignItems: "center",
    color: "blue",
  },
  pickerWrapper: {
    backgroundColor: "yellow",
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 20,
    justifyContent: "top",
    alignItems: "center",
    // width: "90%", // Adjust the width as necessary
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === "android" ? 10 : 5, // Adjust padding for Android
  },
  picker: {
    height: 65,
    width: 200,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 24,
    height: 40, // Set a fixed height
    width: 200, // Set a fixed width if necessary, or use a percentage to fill the container
    paddingVertical: 8,
    paddingHorizontal: 10,
    // borderWidth: 1,
    color: "black",
    backgroundColor: "yellow",
    // color: "red",
    //borderRadius: 80,

    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 24, // Adjust font size if needed
    paddingVertical: 8,
    paddingHorizontal: 10, // Adjust padding to fit within the container
    // borderWidth: 1,
    // borderColor: "red",
    // borderRadius: 20,
    // color: "black",
    // paddingRight: 100, // to ensure the text is never behind the icon
  },
  // placeholder: {
  //   fontSize: 4,
  //   color: "blue",
  // },
});

export default TemperaturePicker;
