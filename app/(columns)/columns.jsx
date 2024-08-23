import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal } from 'react-native';
import { supabase } from '../(auth)/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function Columns() {
  const router = useRouter();
  const { boardId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [editingColumn, setEditingColumn] = useState(null);
  const [editedColumnName, setEditedColumnName] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  useEffect(() => {
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
        .select('id, name, position, tasks (id, title, description, due_date, position)')
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
        .eq('id', editingColumn.id);
      if (error) throw error;
      setIsEditModalVisible(false);
      setEditingColumn(null);
      setEditedColumnName('');
      getColumns(boardId);
    } catch (error) {
      Alert.alert('Error updating column', error.message);
    }
  }

  async function addTaskToColumn(columnId) {
    if (!taskTitle.trim()) {
      Alert.alert('Please enter a task title');
      return;
    }
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{ title: taskTitle, description: taskDescription, due_date: taskDueDate, column_id: columnId, position: 0 }]);
      if (error) throw error;
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      getColumns(boardId);
    } catch (error) {
      Alert.alert('Error adding task', error.message);
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

  const openEditModal = (column) => {
    setEditingColumn(column);
    setEditedColumnName(column.name);
    setIsEditModalVisible(true);
  };

  const openTaskModal = (column) => {
    setSelectedColumn(column);
    setIsTaskModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.addColumnContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Column Name"
          value={newColumnName}
          onChangeText={setNewColumnName}
        />
        <TouchableOpacity onPress={addColumn} style={styles.button}>
          <Text style={styles.buttonText}>Add Column</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={columns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openTaskModal(item)} style={styles.columnItem}>
            <Text style={styles.columnTitle}>{item.name}</Text>
            <Text style={styles.taskCount}>{item.tasks.length} tasks</Text>
            <View style={styles.columnButtons}>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.button}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteColumn(item.id)} style={styles.button}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Edit Column Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.modalInput}
              value={editedColumnName}
              onChangeText={setEditedColumnName}
              placeholder="Edit Column Name"
            />
            <TextInput
              style={styles.modalInput}
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Task Title"
            />
            <TextInput
              style={styles.modalInput}
              value={taskDescription}
              onChangeText={setTaskDescription}
              placeholder="Task Description"
            />
            <TextInput
              style={styles.modalInput}
              value={taskDueDate}
              onChangeText={setTaskDueDate}
              placeholder="Task Due Date"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={() => addTaskToColumn(editingColumn.id)}>
                <Text style={styles.buttonText}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={updateColumn}>
                <Text style={styles.buttonText}>Save Column</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Task Display Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTaskModalVisible}
        onRequestClose={() => setIsTaskModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedColumn?.name} Tasks</Text>
            <FlatList
              data={selectedColumn?.tasks}
              keyExtractor={(task) => task.id.toString()}
              renderItem={({ item: task }) => (
                <View style={styles.taskItem}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  <Text style={styles.taskDueDate}>Due: {task.due_date}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setIsTaskModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
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
    backgroundColor: '#f5f5f5',
  },
  addColumnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  columnItem: {
    padding: 15,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
    borderRadius: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  taskDueDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  input: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%',
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  buttonClose: {
    backgroundColor: "#FF0000",
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  columnButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
