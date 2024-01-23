import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const onboardingValidationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  age: Yup.number().required('Age is required').positive().integer(),
  fitnessGoals: Yup.string().required('Fitness goals are required'),
});

const OnboardingScreen = ({ navigation }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const registerAndOnboardUser = async (values) => {
    console.log('Attempting to register and onboard user with values:', values);
    try {
      console.log('Attempting to register user:', values.username);
      const registerResponse = await axios.post('http://192.168.0.22:8081/api/auth/register', {
        username: values.username,
        password: values.password
      });
      console.log('Registration response:', registerResponse.data);

      if (registerResponse.status === 201) {
        console.log('User registered, attempting onboarding:', values.username);
        const onboardingResponse = await axios.post('http://192.168.0.22:8081/api/users/onboarding', {
          userId: registerResponse.data.userId,
          age: values.age,
          fitnessGoals: values.fitnessGoals
        });
        console.log('Onboarding response:', onboardingResponse.data);

        if (onboardingResponse.status === 201) {
          console.log('User onboarded successfully, user ID:', registerResponse.data.userId);
          await AsyncStorage.setItem('userId', registerResponse.data.userId.toString());
          navigation.navigate('Home');
        } else {
          // Log and alert if onboarding fails
          console.error('Onboarding failed:', onboardingResponse.data);
          Alert.alert('Onboarding failed', onboardingResponse.data.message);
        }
      } else {
        // Log and alert if registration fails
        console.error('Registration failed:', registerResponse.data);
        Alert.alert('Registration failed', registerResponse.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'An unknown error occurred';
      console.error('Error during registration or onboarding:', message);
      Alert.alert('Error', message); // Show error message in an alert dialog
      setErrorMessage(message);
    }
  };

  return (
    <Formik
      initialValues={{ username: '', password: '', age: '', fitnessGoals: '' }}
      validationSchema={onboardingValidationSchema}
      onSubmit={values => registerAndOnboardUser(values)}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <View style={styles.container}>
          <TextInput
            onChangeText={handleChange('username')}
            onBlur={handleBlur('username')}
            value={values.username}
            placeholder="Username"
            style={styles.textInput}
          />
          {touched.username && errors.username ? (
            <Text style={styles.errorText}>{errors.username}</Text>
          ) : null}
          <TextInput
            onChangeText={handleChange('password')}
            onBlur={handleBlur('password')}
            value={values.password}
            placeholder="Password"
            secureTextEntry
            style={styles.textInput}
          />
          {touched.password && errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
          <TextInput
            onChangeText={handleChange('age')}
            onBlur={handleBlur('age')}
            value={values.age}
            keyboardType="numeric"
            placeholder="Age"
            style={styles.textInput}
          />
          {touched.age && errors.age ? (
            <Text style={styles.errorText}>{errors.age}</Text>
          ) : null}
          <TextInput
            onChangeText={handleChange('fitnessGoals')}
            onBlur={handleBlur('fitnessGoals')}
            value={values.fitnessGoals}
            placeholder="Fitness Goals"
            style={styles.textInput}
          />
          {touched.fitnessGoals && errors.fitnessGoals ? (
            <Text style={styles.errorText}>{errors.fitnessGoals}</Text>
          ) : null}
          <Button onPress={handleSubmit} title='Submit' />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textInput: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red'
  },
  // ... any other styles you have ...
});

export default OnboardingScreen;
