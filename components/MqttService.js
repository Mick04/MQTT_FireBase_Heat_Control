//MqttService.js
import Paho from "paho-mqtt";
import { ref, set, onValue } from "firebase/database";
import { database } from "../firebaseConfig";

class MqttService {
  client = null;// Initialize the client

  /***********************************
   *   MQTT connection parameters    *
   *            Start                *
   ***********************************/

  constructor(onMessageArrived, onStateChangeCallbacks) {// Initialize the client
    this.client = new Paho.Client(
      "ea53fbd1c1a54682b81526905851077b.s1.eu.hivemq.cloud", // Replace with your actual HiveMQ cluster URL
      Number(8884), // Secure WebSocket port (wss) for HiveMQ Cloud
      "react_native_mqtt"
    );
    this.onStateChangeCallbacks = onStateChangeCallbacks; // Store callbacks
    this.client.onConnectionLost = this.onConnectionLost.bind(this);
    this.client.onMessageArrived = onMessageArrived;
    this.client.onConnectionLost = (responseObject) => {
      //console.error("MQTTServices line 17 Connection lost: ", responseObject.errorMessage);
      if (this.onStateChangeCallbacks && this.onStateChangeCallbacks.setIsConnected) {
        this.onStateChangeCallbacks.setIsConnected(false);
      }
    };
  }
       /************************************
     *  MQTT connection parameters      *
     *            End                   *
     ************************************/

       /************************************
        *   connecting to MQTT broker      *
        *            Start                 *
        ************************************/
  connect(username, password, options = {}) {
    // console.log("line 19 MqttService connect");
    // Add username and password for authentication
    this.client.connect({
      onSuccess: () => {
        setIsConnected(true);
        clearRetainedMessages(); // Clear retained messages
        //console.log(`MqttService line 28 subscribed to topic:  ${topic}`);
      },
      onFailure: (error) => {
        
        console.error(".............");
        console.error("MQTTServices line 31 Failed to connect to MQTT broker ", error);
        console.error("Error details:", JSON.stringify(error));
        console.error("............");
      },
      userName: username, // Pass the username for the MQTT broker
      password: password, // Pass the password for the MQTT broker
      useSSL: true, // Ensure SSL is enabled for secure WebSocket connection
      ...options,
    });
  }
  /************************************
   *  connecting to MQTT broker      *
   *            End                   *
   ************************************/

  /************************************
   * Reconnecting to MQTT broker     *
   *            Start                 *
   ************************************/

  reconnect = () => {
    if (this.client && !this.client.isConnected()) {
      if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        this.reconnectAttempts += 1;
        // console.log(`Reconnect attempt ${this.reconnectAttempts}`);
        this.connect(this.username, this.password, this.options);
    } else {
        // console.error("MQTTServices line 48 Max reconnect attempts reached. ");
    }
      // console.log("MQTTServices line 50 Attempting to reconnect...");
      this.client.connect({
        onSuccess: () => {
          // console.log("Reconnected successfully.");
          if (this.onStateChangeCallbacks && this.onStateChangeCallbacks.setIsConnected) {
            this.onStateChangeCallbacks.setIsConnected(false);
          }
        },
        onFailure: (error) => {
    //       console.error("MQTTServices line 57 Failed to connect to MQTT broker: ", error);
    // console.error("Error details: ", JSON.stringify(error));
    if (this.onStateChangeCallbacks && this.onStateChangeCallbacks.setIsConnected) {
      this.onStateChangeCallbacks.setIsConnected(false);
    }
        },
      });
    } else if (this.client && this.client.isConnected()) {
      console.warn("Gauges line 63 Client is already connected");
    } else {
      console.warn("Client is not initialized");
    }
  };
  /************************************
   * Reconnecting to MQTT broker     *
   *            End                   *
   ************************************/

  /************************************
   * Publishing messages to MQTT      *
   *           Start                  *
   ************************************/

  publishMessage(amTemperature, pmTemperature, AMtime, PMtime) {
    // console.log("MQTTServices line 70 publishing message");
    if (!this.client.isConnected()) {
      // console.log("Client is not connected. Attempting to reconnect...");
      client.connect({
        onSuccess: () => {
          // console.log("MQTTServices line 75 Reconnected successfully.");
          this.isConnected = true;
          this.sendMessages(amTemperature, pmTemperature, AMtime, PMtime);
        },
        onFailure: (error) => {
          // console.error("MQTTServices line 80 Failed to reconnect to MQTT broker: ", error);
          // console.error("Error details: ", JSON.stringify(error));
          if (this.onStateChangeCallbacks && this.onStateChangeCallbacks.setIsConnected) {
            this.onStateChangeCallbacks.setIsConnected(false);
          };
        },
      });
    } else {
      this.sendMessages(amTemperature, pmTemperature, AMtime, PMtime);
      // console.log("MQTTServices line 89 Message sent successfully");
    }
  }
  /************************************
   * Publishing messages to MQTT      *
   *           End                    *
   ************************************/

  /************************************
   * sending messages to MQTT topics  *
   *          Start                   *
   ***********************************/

  sendMessages(amTemperature, pmTemperature, AMtime, PMtime) {
    try {
      const messageAM = new Paho.Message(String(amTemperature || "0"));
      messageAM.destinationName = "amTemperature";
      messageAM.retained = true;
      this.client.send(messageAM);
      set(ref(database, "setTime/amTemperature"), amTemperature); // Store data in Firebase

      const messagePM = new Paho.Message(String(pmTemperature || "0"));
      messagePM.destinationName = "pmTemperature";
      messagePM.retained = true;
      this.client.send(messagePM);
      set(ref(database, "setTime/pmTemperature"), pmTemperature); // Store data in Firebase

      const messageAMTime = new Paho.Message(String(AMtime || "00:00"));
      messageAMTime.destinationName = "AMtime";
      messageAMTime.retained = true;
      this.client.send(messageAMTime);
      set(ref(database, "setTime/AMtime"), AMtime); // Store data in Firebase

      const messagePMTime = new Paho.Message(String(PMtime || "00:00"));
      messagePMTime.destinationName = "PMtime";
      messagePMTime.retained = true;
      this.client.send(messagePMTime);
      set(ref(database, "setTime/PMtime"), PMtime); // Store data in Firebase
    } catch (err) {
      // console.log("MQTTServices line 108 Failed to send messages: ", err);
    }
  }
  /************************************
   * sending messages to MQTT topics  *
   *          End                     *
   ***********************************/

  /************************************
   * subscribing to MQTT topics       *
   *          Start                   *
   ***********************************/
  subscribe(topic) {
    //console.log("MqttService line 112 subscribe topic: " + topic);
    if (this.client.isConnected()) {
      this.client.subscribe(topic, {
        onSuccess: () => {
         // console.log(`MqttService line 116 subscribed to topic:  ${topic}`);
        },

        onFailure: (error) => {
          // console.error(`MQTTServices line 120 Failed to subscribe to topic: ${topic}`, error);
        },
      });
    } else {
      console.error(
        // `MQTTServices line 125 Cannot subscribe to topic: ${topic} because the client is not connected.`
      );
    }
  }
  /************************************
   * subscribing to MQTT topics       *
   *          End                     *
   ***********************************/

  /************************************
   *     If connection is lost        *
   *    reconnect to MQTT broker      *
   *         Start                    *
   ************************************/
  onConnectionLost(response) {
    // console.error("MQTTServices line 130 Connection lost:", response.errorMessage || "Unknown error");
    this.isConnected = false; // Update connection status
    if (response.reconnect) {
      // console.log("MQTTServices line 133 Attempting to reconnect...");
      this.reconnect();
    }
  }
  /************************************
   *     If connection is lost        *
   *    reconnect to MQTT broker      *
   *         End                      *
   ************************************/


  getConnectionStatus() {
    return this.client && this.client.isConnected();
  }

  /************************************
   *  disconnecting from MQTT broker  *
   *        Start                     *
   ***********************************/
  disconnect() {
    if (this.client && this.client.isConnected()) {
      this.client.disconnect();
      // console.log("Disconnected from MQTT broker");
    }
  }
 /************************************
   *  disconnecting from MQTT broker  *
   *        End                       *
   ***********************************/
}

export default MqttService;
