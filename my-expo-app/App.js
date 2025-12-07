import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";
import { Audio } from "expo-av";

export default function App() {
  const [volumeLevel, setVolumeLevel] = useState(0); // 0–1
  const [decibels, setDecibels] = useState(0);       // դեցիբել
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startRecording();
  }, []);

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: volumeLevel,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [volumeLevel]);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return alert("Microphone permission required");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      setInterval(async () => {
        const status = await recording.getStatusAsync();
        if (status.metering !== undefined) {
          // status.metering հաճախ բացասական է, վերցնում ենք positive արժեք
          let v = Math.abs(status.metering); 

          // Scale 0-1 (հարմարեցված տեսանելիության համար)
          let scaled = Math.min(1, v / 160);
          setVolumeLevel(scaled);

          // Ավելի իրական dB հաշվարկ (0–120 dB)
          let db = Math.round(scaled * 120);
          setDecibels(db);
        }
      }, 100);
    } catch (error) {
      console.log("Error:", error);
    }
  }

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [
      "rgb(255,0,0)",    // Red
      "rgb(255,165,0)",  // Orange
      "rgb(255,255,0)",  // Yellow
      "rgb(0,128,0)",    // Green
      "rgb(0,0,255)",    // Blue
      "rgb(128,0,128)"   // Purple
    ],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.box,
          { backgroundColor }
        ]}
      />
      <Text style={styles.dbText}>Volume: {decibels} dB</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 300,
    height: 200,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 20,
  },
  dbText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});
