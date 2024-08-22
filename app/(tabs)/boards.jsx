import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, FlatList, Modal } from 'react-native';
import { supabase } from '../(auth)/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';

export default function Boards() {
  const router = useRouter();
  const { session } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');

  useEffect(() => {
    if (session) {
      const parsedSession = JSON.parse(session);
      getBoards(parsedSession.user.id);
    }
  }, [session]);

  async function getBoards(userId) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('boards')
        .select('id, name, description')
        .eq('user_id', userId);

      if (error) throw error;
      setBoards(data);
    } catch (error) {
      Alert.alert('Loading boards failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteBoard(id) {
    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', id);
      if (error) throw error;
      getBoards(JSON.parse(session).user.id);
    } catch (error) {
      Alert.alert('Error deleting board', error.message);
    }
  }

  async function addBoard() {
    if (!newBoardName.trim() || !newBoardDescription.trim()) {
      Alert.alert('Please enter a board name and description');
      return;
    }
    try {
      const { error } = await supabase
        .from('boards')
        .insert([{ name: newBoardName, description: newBoardDescription, user_id: JSON.parse(session).user.id }]);
      if (error) throw error;
      setModalVisible(false);
      getBoards(JSON.parse(session).user.id);
    } catch (error) {
      Alert.alert('Error adding board', error.message);
    }
  }

  function navigateToColumns(boardId) {
    router.push(`/(columns)/columns?boardId=${boardId}`);
  }

  const renderBoardItem = ({ item, index }) => {
    const colors = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA'];
    const icons = ['layout', 'list', 'calendar', 'folder'];
    
    return (
      <TouchableOpacity
        style={[styles.boardItem, { backgroundColor: colors[index % colors.length] }]}
        onPress={() => navigateToColumns(item.id)}
      >
        <View style={styles.boardItemContent}>
          <Feather name={icons[index % icons.length]} size={24} color="#333" style={styles.boardIcon} />
          <Text style={styles.boardItemTitle}>{item.name}</Text>
          <Text style={styles.boardItemDescription}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Board</Text>
      </TouchableOpacity>
      
      <FlatList
        data={boards}
        renderItem={renderBoardItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.boardList}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.modalInput}
              placeholder="Board Name"
              value={newBoardName}
              onChangeText={setNewBoardName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Board Description"
              value={newBoardDescription}
              onChangeText={setNewBoardDescription}
            />
            <TouchableOpacity style={styles.modalButton} onPress={addBoard}>
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boardList: {
    paddingBottom: 20,
  },
  boardItem: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  boardItemContent: {
    padding: 16,
  },
  boardIcon: {
    marginBottom: 8,
  },
  boardItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  boardItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    marginTop: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
