// boards.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../(auth)/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';

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
        .select('id, name')
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
      
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Board</Text>
      </TouchableOpacity>
      {modalVisible && (
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
            <TouchableOpacity onPress={addBoard}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.boardList}>
        {boards.map((board) => (
          <TouchableOpacity
            key={board.id}
            style={styles.boardItem}
            onPress={() => navigateToColumns(board.id)}
          >
            <Text>{board.name}</Text>
            <TouchableOpacity onPress={() => deleteBoard(board.id)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
  },
  boardList: {
    marginTop: 20,
  },
  boardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  modalInput: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
  },
  centeredView: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
  },
  buttonText: {
    color: 'blue',
  },
});
