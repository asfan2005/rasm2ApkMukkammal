import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Alert 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ListFromAPI() {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const navigation = useNavigation();

  // Direct data object
  const rawData = {
    1: "probniy", 
    3: "M1", 
    4: "m2", 
    5: "M3", 
    6: "M4", 
    8: "21/09/2024", 
    12: "20/09/2024", 
    13: "Blok testlar 7-8-9-sinflar uchun", 
    14: "21/09/2024 kungi blok test", 
    15: "Probniy3", 
    16: "Blok testlar", 
    17: "23/09/2024", 
    18: "27/09/2024", 
    19: "28/09/2024 blok test", 
    20: "02/10/2024 blok test", 
    21: "05/10/2024 blok test", 
    22: "05/10/2024 blok test", 
    23: "07/10/2024 blok test", 
    24: "11/10/2024 blok test", 
    25: "12/10/2024 blok test", 
    26: "14/10/2024 Blok test", 
    27: "18/10/2024 blok test natilalari", 
    28: "19/10/2024 blok test natija", 
    29: "21/10/2024 blok test natilalari", 
    30: "25/10/2024 blok test natijalari", 
    31: "26/10/2024 blok test natijalari", 
    32: "28/10/2024 blok test natijalari", 
    33: "02/11/2024 blok test natijalari", 
    34: "02/11/2024 blok test natijalari", 
    35: "04/11/2024 blok test natijalari", 
    36: "08/11/2024 blok test natijalari", 
    37: "09/11/2024 blok test natijalari", 
    38: "11/11/2024 blok test natilalari", 
    39: "19/11/2024 blok test natija", 
    40: "19/11/2024 blok test natijalari", 
    41: "27/11/2024 blok test natijalari", 
    42: "25/11/2024 blok test natijalari", 
    43: "02/12/2024 blok test natijalari", 
    44: "03/12/2024 blok test natija", 
    45: "9/12/2024 blok test natijalari", 
    46: "9/12/2024 blok test natijalari"
  };

  useEffect(() => {
    // Transform raw data into a structured array
    const transformedItems = Object.entries(rawData).map(([key, value]) => ({
      id: key,
      name: value,
      category: categorizeItem(value)
    }));

    // Sort items
    const sortedItems = transformedItems.sort((a, b) => 
      parseInt(a.id) - parseInt(b.id)
    );

    setItems(sortedItems);
  }, []);

  const categorizeItem = (value) => {
    const lowerValue = value.toLowerCase();
    
    if (/^\d{1,2}\/\d{2}\/\d{4}/.test(value)) return 'date';
    if (lowerValue.includes('blok test')) return 'test';
    if (value.startsWith('M') || value.startsWith('m')) return 'module';
    if (lowerValue.includes('probniy')) return 'practice';
    return 'other';
  };

  const filteredItems = items.filter(item => {
    switch(filterType) {
      case 'date': return item.category === 'date';
      case 'test': return item.category === 'test';
      case 'module': return item.category === 'module';
      case 'practice': return item.category === 'practice';
      default: return true;
    }
  });

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {['all', 'date', 'test', 'module', 'practice'].map(type => (
        <TouchableOpacity 
          key={type}
          style={[
            styles.filterButton, 
            filterType === type && styles.activeFilterButton
          ]}
          onPress={() => setFilterType(type)}
        >
          <Text style={styles.filterButtonText}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.itemContainer,
        item.category === 'date' && styles.dateItemContainer,
        item.category === 'test' && styles.testItemContainer,
        item.category === 'module' && styles.moduleItemContainer,
        item.category === 'practice' && styles.practiceItemContainer
      ]}
      onPress={() => {
        setSelectedId(item.id);
        Alert.alert('Tanlangan element', item.name);
      }}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemId}>#{item.id}</Text>
        <Text 
          style={[
            styles.itemText, 
            item.category === 'date' && styles.dateItemText,
            item.category === 'test' && styles.testItemText,
            item.category === 'module' && styles.moduleItemText,
            item.category === 'practice' && styles.practiceItemText
          ]}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const openCamera = () => {
    if (!selectedId) {
      Alert.alert('Xatolik', 'Iltimos, biror elementni tanlang!');
      return;
    }
    navigation.navigate('Foto', { 
      selectedId: selectedId,
      selectedItem: items.find(item => item.id === selectedId)
    });
  };

  const openGallery = () => {
    if (!selectedId) {
      Alert.alert('Xatolik', 'Iltimos, biror elementni tanlang!');
      return;
    }
    navigation.navigate('Galeriya', { 
      selectedId: selectedId,
      selectedItem: items.find(item => item.id === selectedId)
    });
  };

  const renderMediaButtons = () => (
    <View style={styles.mediaButtonContainer}>
      <TouchableOpacity 
        style={styles.mediaButton} 
        onPress={openCamera}
      >
        <MaterialIcons name="photo-camera" size={24} color="white" />
        <Text style={styles.mediaButtonText}>Camera</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.mediaButton} 
        onPress={openGallery}
      >
        <MaterialIcons name="photo-library" size={24} color="white" />
        <Text style={styles.mediaButtonText}>Gallery</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elementlar Ro'yxati</Text>
      {renderFilterButtons()}
      {renderMediaButtons()}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Hech qanday element topilmadi</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  filterButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeFilterButton: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    color: '#333',
  },
  list: {
    paddingHorizontal: 15,
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateItemContainer: {
    backgroundColor: '#e6f2ff',
  },
  testItemContainer: {
    backgroundColor: '#e6f3ff',
  },
  moduleItemContainer: {
    backgroundColor: '#f0f0f0',
  },
  practiceItemContainer: {
    backgroundColor: '#f3e5f5',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemId: {
    fontSize: 14,
    color: '#888',
    marginRight: 10,
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  dateItemText: {
    color: '#0066cc',
  },
  testItemText: {
    color: '#0066cc',
  },
  moduleItemText: {
    color: '#666',
  },
  practiceItemText: {
    color: '#9c27b0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  mediaButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  mediaButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  mediaButtonText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  }
});
