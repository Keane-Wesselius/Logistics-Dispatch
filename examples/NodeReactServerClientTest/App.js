import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from "react";

export default function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://10.0.0.183:8000/message")
            .then((res) => res.json())
            .then((data) => setMessage(data.message));
    }, []);

    return (
    <View style={styles.container}>
            <Text>{message}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#aebcd4',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
