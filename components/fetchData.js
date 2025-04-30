import { ref, get } from "firebase/database";
import { database } from "../firebaseConfig";

export const fetchData = async (bufferSize, entriesToFetch, sensorKey) => {
  try {
    console.log("Fetching data from Firebase...");

    // Fetch the current storeCount
    const storeCountRef = ref(database, "/storeCount");
    const storeCountSnapshot = await get(storeCountRef);
    const storeCount = storeCountSnapshot.val();

    if (!storeCount) {
      console.warn("storeCount not found in Firebase");
      return [];
    }

    console.log("Current storeCount:", storeCount);

    const sensorData = [];
 
    // Fetch the most recent entries from the circular buffer
    for (let i = 0; i < entriesToFetch; i++) {
      const index = ((storeCount - i - 1 + bufferSize) % bufferSize) + 1; // Handle wrap-around
      const sensorPath = `/${index}`;

      // Fetch sensor data
      const sensorSnapshot = await get(ref(database, sensorPath));
      const sensorEntry = sensorSnapshot.val();

      if (sensorEntry) {
        sensorData.push({
          value: sensorEntry[sensorKey],
          label: `${sensorEntry.hour}:${sensorEntry.minute
            .toString()
            .padStart(2, "0")}`,
          dataPointText: `${sensorEntry[sensorKey]} c˚`,
        });
    }
    }

    console.log("Fetched sensor data:", sensorData);

    return sensorData;
} catch (error) {
  console.error("Error fetching data from Firebase:", error);
  return [];
   }
};
//     // Format the data for display
//     const formattedData = sensorData.map((entry, idx) => {
//       const timeEntry = timeData.find((t) => t.index === entry.index);
//       if (!timeEntry) return null;

//       const hour = timeEntry.hour ?? 0;
//       const minute = timeEntry.minute ?? 0;

//       return {
//         value: entry[sensorKey], // Use the specified sensor key (e.g., "green" for coolSide)
//         label: `${hour}:${minute.toString().padStart(2, "0")}`, // Format the time
//         dataPointText: `${entry[sensorKey]} c˚`,
//       };
//     }).filter((item) => item !== null); // Remove null entries

//     return formattedData;
//   } catch (error) {
//     console.error("Error fetching data from Firebase:", error);
//     return [];
//   }
// };