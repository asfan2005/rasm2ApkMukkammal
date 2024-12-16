import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Foto from "./Foto";
import Galeriya from './Galeriya';
import List from './List';

// Stack navigatorni yaratish
const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Foto"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Foto" 
            component={Foto}
            options={({ navigation }) => ({
              title: 'Rasmga olish',
              headerRight: () => (
                <TouchableOpacity 
                  style={styles.listButton}
                  onPress={() => navigation.navigate('List')}
                >
                  <Text style={styles.listButtonText}>Ro'yxat</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen 
            name="Galeriya" 
            component={Galeriya}
            options={{
              title: 'Galeriya',
            }}
          />
          <Stack.Screen 
            name="List" 
            component={List}
            options={{
              title: 'Ro\'yxat',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listButton: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  listButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});