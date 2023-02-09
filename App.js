import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Landing from "./src/screens/landing";
import Home from "./src/screens/home";
import Delivery from "./src/screens/delivery";
import Earning from "./src/screens/earning";
import Profile from "./src/screens/profile";
// import Register from "./src/screeens/register";
import Register from "./src/screens/register";

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Landing">
      <Stack.Screen
        name="Landing"
        component={Landing}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        // options={{ headerShown: false, gesturesEnabled: false }}
        options={{ title: "Register", headerShown: true }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false, gesturesEnabled: false }}
      />
      <Stack.Screen
        name="Earning"
        component={Earning}
        options={{ headerShown: false, headerLeft: () => <View /> }}
      />

      <Stack.Screen
        name="Delivery"
        component={Delivery}
        options={{ headerShown: false, gesturesEnabled: false }}
      />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false, gesturesEnabled: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
