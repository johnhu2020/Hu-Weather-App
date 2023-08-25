/* ****John Hu's Weather app comments

  *Capabilities: 
  -The app will make sure that the coordinates entered correspond to an actual location. Any value that is not from -90 to 90 for latitude input will output an alert. Any value that is not from -180 to 180 for longitude input will output an alert as well. 
  -Given the location's coordinates, the app is able to find the coordinate's real location in city and country. If the coordinates reflects a random place in the ocean, the app will output 'somewhere in the oceans'. Similarly with the north or south poles, the app will output 'somewhere in the poles'
  -Given the location's coordinates, the app is able to find the current weather, high and low temperatures, the 'feels like' temperature, the current wind speed and its corresponding description. For example, low winds will say 'breeze', while large winds will give a warning to the user. The app also displays the current weather condition: 'snow, rain, cloudy, etc.'
  -Given the location's coordinates, the app also outputs the next 5 days forecast: their temperatures and weather conditions. 
  -works with andriod and ios
  -enter new coordinates button so that the user is able to enter coordinates again easily without having to reset the entire app. 

  *Issues:
  -Slight delay when the app moves from the menu to the actual weather page. For a split second, the app's aesthetics are all messed up, but then it fixes itself when the app receives all needed data. 
  -I may have some trouble for the aesthetics regarding to the line spacings of the next 5 day forecast's temperatures and weather conditions icons. For negative numbers, since the number includes a negative symbol that takes up some space, I added less spaces in between that number and the next number. For numbers that only have 1 decimal, I added 4 spaces and 2 decimals adds 5 spaces. For numbers that do not have decimals at all, I added 6 spaces. Sometimes when I run my app, the spaces are messed up, and the next line, which includes my weather conditions icons, may join the same line as the next 5 day forecast's temperatures, messing up the aesthetics. Also, the app on ios and andriod are different, so a specific set of coordinates may look perfectly fine on ios but not on andriod and vise versa. 

*/
import React, { useState, useEffect } from 'react';
import { Component } from 'react';
import {Picker} from '@react-native-picker/picker';
 
import { Text, View, StyleSheet, TextInput, Button, Alert, TouchableOpacity, SafeAreaView, ScrollView, Image, Pressable, Switch, ImageBackground, TouchableHighlight } from 'react-native';
import Constants from 'expo-constants';
 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
 
const Stack = createNativeStackNavigator();

//https://api.openweathermap.org/data/2.5/forecast?lat=40.7128&lon=-74.0060&units=imperial&appid=4ecb44d66b7a133c4c7db439bcac9db3
//https://stackoverflow.com/questions/30158574/how-to-convert-result-from-date-now-to-yyyy-mm-dd-hhmmss-ffff 
//https://www.w3schools.com/jsref/jsref_getday.asp#:~:text=JavaScript%20Date%20getDay%20%28%29%201%20Definition%20and%20Usage,day%20%3D%20weekday%20%5Bd.getDay%28%29%5D%3B%20...%206%20Browser%20Support

const weatherKey = 'da5f06a7a1567b823d685052ed30635a';
const weatherURL = 'https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&units={unit}&appid={API key}';

function Home({ navigation }) {
  const [lat, setLat] = useState(0);
  const [long, setLong] = useState(0);

  const goToNext = () => {
    if (!isNaN(lat) && !isNaN(long) && (lat>=-90) && (lat<=90) && (long>=-180) && (long<=180)) {
      navigation.navigate("Weather Menu",{
        lat: lat,
        long: long,
      }); 
    } else {
      alertMessage();
    }
  }

  const alertMessage = () =>
      Alert.alert(
      "To see the weather, you must: ",
      "-Make sure that the inputted latitude and longitude values are valid\n-Latitude must be from -90 to 90\n-Longitude must be from -180 to 180",
      [
        { text: "Ok", }
      ]
    );

  const setLatitude = (t) => { 
    setLat(t);
  }
  const setLongitude = (t) => { 
    setLong(t);
  }
  return (
    <View style={styles.container}>
      <ImageBackground 
      source={require('./assets/fog.jpg')}
      resizeMode="cover"
      style={{height: '100%', width: '100%'}}
      > 
      <Text style = {styles.buffer}> </Text>

      <Text style={{color: 'lavender', fontFamily: 'Cochin', textAlign: 'center', fontSize: 40}}>The Weather App</Text>
      <Text style = {styles.buffer}> </Text>
      <Text style={styles.standardText}>Please enter your coordinates: </Text>
      <Text style = {styles.buffer}> </Text>
      <TextInput style = {styles.input} placeholder = "Enter Latitude..." 
                                        maxLength={15}
                                        keyboardType = "default" clearTextOnFocus
                                        placeholderTextColor = "skyblue" 
                                        onChangeText={(text) => setLatitude(text)}>
      </TextInput>
      <Text style = {styles.buffer}> </Text>
      <Text style = {styles.buffer}> </Text>
      <TextInput style = {styles.input} placeholder = "Enter Longitude..." 
                                        maxLength={15}
                                        keyboardType = "default" clearTextOnFocus
                                        placeholderTextColor = "skyblue" 
                                        onChangeText={(text) => setLongitude(text)}>
      </TextInput>

      <Text style = {styles.buffer}> </Text>
      
      <TouchableOpacity
        onPress={() => goToNext()}>
        <Text style={styles.standardText}>Find weather now!</Text>
      </TouchableOpacity>
      </ImageBackground>
      
    </View>
  );
}

function WeatherMenu({ route, navigation }) {
  const { lat } = route.params;
  const { long } = route.params;
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  
  const [currTemp1, setCurrTemp1] = useState([]); 
  const [locationCity, setLocationCity] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [windSpeed, setWindSpeed] = useState(0);
  const [currWeather, setCurrWeather] = useState("");
  const [image, setImage] = useState();
  const [dateIndex, setDateIndex] = useState(-1);
  const [imagesForFuture, setImagesForFuture] = useState([]);

  const [futureTemp, setFutureTemp] = useState([]);

  const goBack = () => {
    navigation.navigate("Home");
  }

  const countNumDecimals = (currNum) => {
    const num = String(currNum);
    if (num.includes('.')) {
      return num.split('.')[1].length;
    }
    return 0;
  }

  const lookBetter = (array) => {
    let string = "";
    for (let i = 0; i < array.length; i++) {
      if (array[i] < 0) {
        string += array[i] + "℉    ";
      } else if (countNumDecimals(array[i]) == 2) {
        string += array[i] + "℉    ";
      } else if (countNumDecimals(array[i]) == 1) {
        string += array[i] + "℉     ";
      } else if (countNumDecimals(array[i]) == 0){
        string += array[i] + "℉      ";
      }
    }
    return string;
  }

  const seeWindDescription = (speed) => {
    let description = "";
    if (speed <= 12) {
      description = "Gentle to Moderate Breeze";
    } else if (speed <= 31) {
      description = "Moderate to Strong Breeze";
    } else if (speed <= 63) {
      description = "Gale to Whole Gale: Please be careful when outside";
    } else if (speed <= 75) {
      description = "Storm Force: Please be careful when outside";
    } else if (speed <= 100) {
      description = "Hurricane Force: Please stay indoors. Evacuate if necessary";
    }

    return description;
  }

  const setWeatherStatement = (city, country) => {
    let currString = "";
    if (city == "" || country == "") {
      currString = "Somewhere in the Ocean";
    } else if (city.includes("Globe")) {
      currString = "Somewhere in the Pole";
    } else {
      currString = city + ", " + country;
    }
    return currString;
  }

  const getToday = (dayIndex) => {
    let dayType = weekday[dayIndex];
    return dayType;
  }

  const getWeather = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=imperial&appid=4ecb44d66b7a133c4c7db439bcac9db3`
      );
      const json = await response.json();
      const theList = json.list;

      setCurrTemp1(currTemp1 => [...currTemp1, theList[0].main.temp]);
      setCurrTemp1(currTemp1 => [...currTemp1, theList[0].main.feels_like]);
      setCurrTemp1(currTemp1 => [...currTemp1, theList[0].main.temp_min]);
      setCurrTemp1(currTemp1 => [...currTemp1, theList[0].main.temp_max]);
      setLocationCity(json.city.name);
      setLocationCountry(json.city.country);
      setWindSpeed(theList[0].wind.speed);
      setImage(json.list[0].weather[0].icon);
      setCurrWeather(theList[0].weather[0].description); //each description going towards different weather type
      let index = 0;
      for (let i = 1; i < theList.length; i++) {
        if (JSON.stringify(theList[i]).includes("15:00:00")) {
          setFutureTemp(futureTemp => [...futureTemp, theList[index].main.temp]);
          setImagesForFuture(imagesForFuture => [...imagesForFuture, theList[index].weather[0].icon]);
          index++;
        }
      }
      
      return json.list;
    } catch (error) {
      Alert.alert("Error, please try again");
    }
  }; 

  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.container}>
        <Text style={{fontSize: 40}}> </Text>
        <ImageBackground 
      source={{uri: `http://openweathermap.org/img/wn/${image}@2x.png`}}
      resizeMode="cover"
      style={{height: '100%', width: '100%'}}
      > 
        <Text style={{fontFamily: 'Cochin', fontSize: 25, textAlign: 'center', fontWeight: 'bold', color: '#c5c6d0'}}>{setWeatherStatement(locationCity, locationCountry)}</Text>
        
        <Text style={{fontFamily: 'Cochin', fontSize: 25, textAlign: 'center', color: '#59778e'}}>{currTemp1[0]}℉</Text>
        <Text style={styles.upperText}>{currWeather}</Text>
        <Text style={styles.upperText}>H: {currTemp1[3]}℉ | L: {currTemp1[2]}℉</Text>

        <Text style={{fontSize: 10}}> </Text>
        <Text style={styles.upperText}>Feels Like: {currTemp1[1]}℉</Text>
        
        <Text style={styles.buffer}> </Text>


        <View style={{ width: '100%', height: '20%', display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "center", justifyContent: "space-evenly", backgroundColor: '#36454F', opacity: 0.8,borderBottomLeftRadius: 50, borderBottomRightRadius: 50, borderTopLeftRadius: 50, borderTopRightRadius: 50}}>
        <Text style={{fontSize: 20, fontFamily: 'Cochin', color: '#c5c6d0'}}>Wind Speed: {windSpeed} mph</Text>
        <Text style={{fontSize: 25, fontFamily: 'Cochin'}}> </Text>
        <Text style={{fontSize: 18, fontFamily: 'Cochin', color: 'manatee'}}>{seeWindDescription(windSpeed)}</Text>
          </View>
        
        <Text style={{fontSize: 10}}> </Text>

        <View style={{ width: '100%', height: '30%', display: "flex", flexDirection: "row", flexWrap: "wrap", alignContent: "center", alignItems: "center", justifyContent: "center", backgroundColor: '#36454F', opacity: 0.8,borderBottomLeftRadius: 50, borderBottomRightRadius: 50, borderTopLeftRadius: 50, borderTopRightRadius: 50}}>
        <Text style={{fontSize: 15, textAlign: 'center', color: '#c5c6d0', fontFamily: 'Cochin'}}>Next 5 Day Forecast</Text>
        <Text style={{fontSize: 30}}> </Text>
        <Text style={styles.regularForecastText}>{lookBetter(futureTemp)}</Text>
    <Image source={{uri: `http://openweathermap.org/img/wn/${imagesForFuture[0]}@2x.png`}}style={{ width: "19%", height: '20%' }} />
    <Image source={{uri: `http://openweathermap.org/img/wn/${imagesForFuture[1]}@2x.png`}}style={{ width: "18%", height: '20%' }} />
    <Image source={{uri: `http://openweathermap.org/img/wn/${imagesForFuture[2]}@2x.png`}}style={{ width: "18%", height: '20%' }} />
    <Image source={{uri: `http://openweathermap.org/img/wn/${imagesForFuture[3]}@2x.png`}}style={{ width: "18%", height: '20%' }} />
    <Image source={{uri: `http://openweathermap.org/img/wn/${imagesForFuture[4]}@2x.png`}}style={{ width: "18%", height: '20%' }} />
</View>

        <Text style={{fontSize: 10}}> </Text>
        <TouchableOpacity style={{height: '10%', width: '100%'}}
        onPress={() => goBack()}
        >
          <Text style={{fontFamily: 'Cochin', color: 'black', textAlign: 'center', fontSize: 25, color: '#c5c6d0'}}>Enter New Coordinates</Text>
        </TouchableOpacity>
        <Text style={{fontSize: 200}}> </Text>
        </ImageBackground>
        </ScrollView>
      </SafeAreaView>
    </View>
  )

}

export default function App() {
  
  return (
    <View style = {styles.container}>
      <NavigationContainer>
        <Stack.Navigator initalRouteName = {"Home"} screenOptions={{headerShown: false}}>
          <Stack.Screen name = "Home" component = {Home}/>
          <Stack.Screen name = "Weather Menu" component = {WeatherMenu}/>
        </Stack.Navigator>
      </NavigationContainer>
    </View>
    )

}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    backgroundColor: '#8DA399',
  },
  buffer: {
    fontSize: 30,
  },
  standardText: {
    color: 'lavender',
    fontFamily: 'Cochin',
    fontSize: 20,
    textAlign: 'center',
  },
  input: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Cochin',
    color: 'skyblue',
    borderWidth: 1,
    borderColor: 'silver',
  },
  regularForecastText: {
    fontSize: 15,
    textAlign: 'center',
    color: 'manatee',
    fontFamily: 'Cochin',
  },
  upperText: {
    fontSize: 15,
    textAlign: 'center',
    color: 'lavender',
    fontFamily: 'Cochin',
  },
});
