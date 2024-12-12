import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Foto() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  const requestPermission = async (permissionFunc, errorMessage) => {
    const { status } = await permissionFunc();
    if (status !== 'granted') {
      Alert.alert('Ruxsat kerak', errorMessage);
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Xatolik", "Galereyaga ruxsat berilmadi");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setResultMessage('');
      }
    } catch (error) {
      Alert.alert("Xatolik", "Rasm tanlashda xatolik yuz berdi");
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
      allowsEditing: false,
      quality: 1,
      base64: false,
      exif: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert("Xatolik", "Iltimos rasm tanlang");
      return;
    }

    try {
      setLoading(true);
      setResultMessage('Rasm yuklanmoqda...');

      // FF qiymatini olish
      const response = await fetch('https://samaralitalim.uz/javoblar_ei_mobi.asp');
      const ffValue = await response.text();
      
      // Rasmni to'g'ri formatda tayyorlash
      const imageUri = Platform.OS === 'ios' ? image.replace('file://', '') : image;

      const formData = new FormData();
      formData.append('javob_file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });
      formData.append('katalog', '0');
      formData.append('avtor', '1');
      formData.append('ff', ffValue.trim());
      formData.append('Saqlsh', 'Submit');

      // Rasmni yuklash
      const uploadResponse = await fetch('https://samaralitalim.uz/class_request_javob.asp', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': '*/*',
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Yuklashda xatolik yuz berdi');
      }

      setResultMessage('Natija tekshirilmoqda...');

      // Natijani tekshirish
      let attempts = 0;
      const maxAttempts = 45; // Urinishlar sonini ko'paytirdik
      const delay = 3000; // Har bir so'rov orasidagi vaqt (3 sekund)
      
      const checkResult = async () => {
        while (attempts < maxAttempts) {
          try {
            const checkResponse = await fetch(`https://samaralitalim.uz/javoblarni_takshir.asp?fayl=${ffValue.trim()}`);
            const resultText = await checkResponse.text();

            if (resultText.includes('-1:')) {
              const result = `Sizning balingiz: Tekshirilmadi`;
              setResultMessage(result);
              Alert.alert("Natija", result);
              return true;
            }

            if (resultText.includes('1:')) {
              const score = resultText.split(':')[1].trim();
              const result = `Sizning balingiz: ${score}`;
              setResultMessage(result);
              Alert.alert("Muvaffaqiyatli", result);
              return true;
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, delay));
          } catch (error) {
            console.error('Tekshirishda xatolik:', error);
            continue;
          }
        }
        throw new Error('Vaqt tugadi. Qayta urinib ko\'ring');
      };

      await checkResult();

    } catch (error) {
      console.error('Xatolik:', error);
      setResultMessage(`Xatolik yuz berdi: ${error.message}`);
      Alert.alert("Xatolik", error.message);
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

      {resultMessage ? (
        <Text style={styles.resultText}>{resultMessage}</Text>
      ) : null}

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
  resultText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '90%',
  },
});
