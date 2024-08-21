// columns.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { supabase } from '../(auth)/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function columns() {
  const router = useRouter();
  console.log('Router:', router);
  const { boardId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [editedColumnName, setEditedColumnName] = useState('');

  console.log('useLocalSearchParams:', useLocalSearchParams());
  console.log('Received boardId:', boardId);

  useEffect(() => {
    console.log('Received boardId:', boardId);
  
    if (!boardId) {
      console.error('No boardId received');
      return;
    }
  
    getColumns(boardId);
  }, [boardId]);

  async function getColumns(boardId) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('columns')
        .select('id, name, position')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching columns:', error);
        throw error;
      }

      if (!data) {
        console.error('No column data received');
        return;
      }

      setColumns(data);
    } catch (error) {
      Alert.alert('Loading columns failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addColumn() {
    if (!newColumnName.trim()) {
      Alert.alert('Please enter a column name');
      return;
    }
    try {
      const { error } = await supabase
        .from('columns')
        .insert([{ name: newColumnName, board_id: boardId, position: columns.length }]);
      if (error) throw error;
      setNewColumnName('');
      getColumns(boardId);
    } catch (error) {
      Alert.alert('Error adding column', error.message);
    }
  }

  async function updateColumn() {
    if (!editedColumnName.trim()) {
      Alert.alert('Please enter a column name');
      return;
    }
    try {
      const { error } = await supabase
        .from('columns')
        .update({ name: editedColumnName })
        .eq('id', editingColumnId);
      if (error) throw error;
      setEditingColumnId(null);
      setEditedColumnName('');
      getColumns(boardId);
    } catch (error) {
      Alert.alert('Error updating column', error.message);
    }
  }

  async function deleteColumn(columnId) {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);
      if (error) throw error;
      getColumns(boardId);
    } catch (error) {
      Alert.alert('Error deleting column', error.message);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.addColumnContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Column Name"
          value={newColumnName}
          onChangeText={setNewColumnName}
        />
        <TouchableOpacity onPress={addColumn}>
          <Text style={styles.buttonText}>Add Column</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={columns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.columnItem}>
            {editingColumnId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editedColumnName}
                  onChangeText={setEditedColumnName}
                />
                <TouchableOpacity onPress={updateColumn}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingColumnId(null)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text>{item.name}</Text>
                <TouchableOpacity onPress={() => setEditingColumnId(item.id)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteColumn(item.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
  },
  addColumnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  columnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
  },
  buttonText: {
    color: 'blue',
  },
});
