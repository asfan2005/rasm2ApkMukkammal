import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Foto() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = async (permissionFunc, errorMessage) => {
    const { status } = await permissionFunc();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', errorMessage);
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const granted = await requestPermission(
      ImagePicker.requestMediaLibraryPermissionsAsync,
      'Galereyadan foydalanish uchun ruxsat berilmadi'
    );
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const granted = await requestPermission(
      ImagePicker.requestCameraPermissionsAsync,
      'Kameradan foydalanish uchun ruxsat berilmadi'
    );
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert('Xatolik', 'Rasm tanlanmagan');
      return;
    }

    try {
      setLoading(true);

      const ffResponse = await fetch('https://samaralitalim.uz/javoblar_ei_mobi.asp');
      const ffValue = await ffResponse.text();
      
      const formData = new FormData();
      formData.append('javob_file', {
        uri: image,
        type: 'image/jpeg',
        name: 'javob_file.jpg',
      });
      
      formData.append('katalog', '0');
      formData.append('avtor', '1');
      formData.append('ff', ffValue);
      formData.append('Saqlsh', 'Submit');

      const uploadResponse = await fetch('https://samaralitalim.uz/class_request_javob.asp', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': '*/*',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.ok) {
        Alert.alert('Muvaffaqiyatli', 'Rasm muvaffaqiyatli yuklandi!');
        setImage(null);
      } else {
        Alert.alert('Xatolik', 'Rasm yuklashda xatolik yuz berdi');
      }
    } catch (error) {
      Alert.alert('Xatolik', 'Rasm yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {image && (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={[styles.button, styles.uploadButton]} onPress={handleUpload}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Rasmni yuborish</Text>}
          </TouchableOpacity>
        </>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Rasmga olish</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
          <Text style={styles.buttonText}>Galereyadan tanlash</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={loading}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#f4511e" />
            <Text style={styles.loadingText}>Rasm yuklanmoqda...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    width: 150,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadButton: {
    marginTop: 10,
    marginBottom: 20,
    width: 200,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});
