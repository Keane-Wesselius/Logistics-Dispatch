import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Video } from "expo-av";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Login from "../screens/Login";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const Landing = () => {
  const navigation = useNavigation();

	global.navigation = navigation;

  const videoRef = useRef(null);
  const Stack = createStackNavigator();
  const handlePress = () => {
    navigation.navigate("Login");
    // console.log('shiva')
  };
  return (
    <View>
      <View style={styles.container} pointerEvents="none">
        <Video
          ref={videoRef}
          source={require("../assets/video2.mp4")}
          resizeMode="cover"
          shouldPlay={true}
          style={styles.video}
          useNativeControls
          isLooping={true}
          isMuted={true}
          rate={2.0}
          resumePlayback={false}
        />
        <View style={styles.heading}>
          <Text style={{ fontSize: 30, fontWeight: "bold" }}>
            Welcome to the Driver App
          </Text>
        </View>
      </View>
      <View
        style={{
          justifyContent: "center",
          alignSelf: "center",
          backgroundColor: "red",
          width: SCREEN_WIDTH,
          //height: SCREEN_HEIGHT,
        }}
      >
        <TouchableOpacity
          style={styles.blackButton}
          activeOpacity={0.7}
          pointerEvents="box-none"
          onPress={() => handlePress()}
        >
          <Text style={{ color: "white", fontSize: 20 }}> Continue</Text>
          <AntDesign name="arrowright" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Landing;
const styles = StyleSheet.create({
  video: {
    position: "absolute",
    zIndex: 0,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    maxHeight: "84%",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderBottomColor: "black",

    // borderBottomWidth: 10,
  },
  container: {
    //flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D0EDF6",
    height: "100%",
  },
  heading: {
    marginTop: SCREEN_HEIGHT / 1.7,

    //backgroundColor: 'red'
  },
  blackButton: {
    backgroundColor: "black",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    width: SCREEN_WIDTH / 2,
    alignItems: "center",
    //alignSelf: 'stretch',
    justifyContent: "center",
    marginBottom: "15%",
    marginLeft: "20%",
    // marginHorizontal: '5%',
    flexDirection: "row",
    borderRadius: 10,
  },
});
