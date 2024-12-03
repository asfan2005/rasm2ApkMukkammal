import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Galeriya() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Xatolik', 'Galereyadan foydalanish uchun ruxsat berilmadi');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Xatolik', 'Rasm tanlashda xatolik yuz berdi');
    }
  };

  const getFfValueFromServer = async () => {
    try {
      const response = await fetch('https://samaralitalim.uz/javoblar_ei_mobi.asp');
      const text = await response.text();
      return text.trim();
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert("Xatolik", "Rasm tanlanmagan");
      return;
    }

    try {
      setLoading(true);
      const ffValue = await getFfValueFromServer();

      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      formData.append('javob_file', {
        uri: image,
        type: type,
        name: filename || 'photo.jpg',
      });

      formData.append('katalog', '0');
      formData.append('avtor', '0');
      formData.append('ff', ffValue);
      formData.append('Saqlsh', 'Submit');

      const uploadResponse = await fetch('https://samaralitalim.uz/class_request_javob_mobil.asp', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        },
      });

      if (uploadResponse.ok) {
        Alert.alert(
          "Muvaffaqiyatli", 
          "Rasm yuborildi!",
          [{ text: "OK", onPress: () => setImage(null) }]
        );
      } else {
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }
    } catch (error) {
      Alert.alert("Xatolik", "Rasm yuborishda xatolik yuz berdi. Iltimos qayta urinib koring");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity 
            style={[styles.button, styles.uploadButton]} 
            onPress={handleUpload}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Rasmni yuborish</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Galereyadan tanlash</Text>
        </TouchableOpacity>
      )}

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
  imageContainer: {
    alignItems: 'center',
    width: '100%',
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 10,
    width: 200,
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
    backgroundColor: '#4CAF50',
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
  }
});