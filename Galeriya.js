import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Galeriya() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingResult, setCheckingResult] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Xatolik', 'Galereyadan foydalanish uchun ruxsat berilmadi');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: undefined,
        quality: 1,
        cropping: false,
        presentationStyle: 'fullScreen',
        exif: true,
        base64: false,
        videoQuality: undefined,
        allowsMultipleSelection: false
      });
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImage(selectedImage.uri);
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

  const checkSubmissionStatus = async (fileHash) => {
    try {
      const url = `https://samaralitalim.uz/javoblarni_takshir.asp?fayl=${fileHash}`;
      const response = await fetch(url);
      const text = await response.text().then(t => t.trim());
      
      console.log('Natija:', text);

      if (text === "0") {
        return "0"; // Hali tekshirilmoqda
      } 
      else if (text.startsWith("1:")) {
        const score = text.split(":")[1].replace(",", ".");
        return { success: true, score: score };
      }
      else if (text === "-1") {
        return { success: false, error: 'Xatolik yuz berdi' };
      }
      else {
        return { success: false, error: 'Kutilmagan natija' };
      }
    } catch (error) {
      console.error('Status tekshirishda xatolik:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!image) {
      Alert.alert("Xatolik", "Iltimos, avval rasm tanlang");
      return;
    }

    try {
      setLoading(true);
      setUploadStatus('Rasm yuklanmoqda...');
      
      const ffValue = await getFfValueFromServer();
      
      const formData = new FormData();
      const filename = image.split('/').pop();
      
      formData.append('javob_file', {
        uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
        type: 'image/jpeg',
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
          'Accept': '*/*',
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseText = await uploadResponse.text();
      console.log('Upload response:', responseText);

      if (!responseText || responseText.includes('error')) {
        throw new Error('Yuklashda xatolik');
      }

      const fileHash = responseText.trim();
      setCheckingResult(true);
      setUploadStatus('Natija tekshirilmoqda...');

      let attempts = 0;
      const maxAttempts = 30;
      const checkInterval = setInterval(async () => {
        try {
          const status = await checkSubmissionStatus(fileHash);
          
          if (status === "0" && attempts < maxAttempts) {
            setUploadStatus(`Tekshirilmoqda... (${attempts + 1}/${maxAttempts})`);
            attempts++;
          } else {
            clearInterval(checkInterval);
            
            if (status.success) {
              const finalResult = `Sizning balingiz: ${status.score} ball`;
              setResult(finalResult);
              setUploadStatus('');
              setImage(null);
              Alert.alert("Natija", finalResult);
            } else {
              setUploadStatus(status.error || 'Xatolik yuz berdi');
              Alert.alert("Xatolik", status.error || 'Natijani olishda xatolik');
            }
          }
        } catch (error) {
          clearInterval(checkInterval);
          setUploadStatus('Xatolik yuz berdi');
          Alert.alert("Xatolik", "Natijani tekshirishda xatolik");
        }
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Xatolik yuz berdi');
      Alert.alert("Xatolik", "Rasm yuborishda xatolik. Qayta urinib ko'ring");
    } finally {
      setLoading(false);
      setCheckingResult(false);
    }
  };

  return (
    <View style={styles.container}>
      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
          <TouchableOpacity 
            style={[styles.button, styles.newImageButton]} 
            onPress={() => {
              setResult(null);
              pickImage();
            }}
          >
            <Text style={styles.buttonText}>Yangi rasm yuklash</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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
        </>
      )}

      {uploadStatus ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{uploadStatus}</Text>
          {(loading || checkingResult) && <ActivityIndicator style={styles.statusSpinner} color="#f4511e" />}
        </View>
      ) : null}
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
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '90%',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  statusSpinner: {
    marginTop: 10,
  },
  resultText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  resultContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  newImageButton: {
    marginTop: 20,
    backgroundColor: '#2196F3',
  }
});