import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, ScrollView } from 'react-native';
import { supabase } from '../(auth)/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

export default function Columns() {
  const router = useRouter();
  const { boardId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([]);
  const [isAddColumnModalVisible, setIsAddColumnModalVisible] = useState(false);
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
      setIsAddColumnModalVisible(false);
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

  async function addTaskToColumn() {
    if (!taskTitle.trim()) {
      Alert.alert('Please enter a task title');
      return;
    }
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{ 
          title: taskTitle, 
          description: taskDescription, 
          due_date: taskDueDate, 
          column_id: selectedColumn.id, 
          position: selectedColumn.tasks.length 
        }]);
      if (error) throw error;
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setIsTaskModalVisible(false);
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
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setIsTaskModalVisible(true);
  };

  const openAddColumnModal = () => {
    setIsAddColumnModalVisible(true);
  };

  const renderTaskPreview = (task) => (
    <View style={styles.taskPreview} key={task.id}>
      <Text style={styles.taskPreviewTitle} numberOfLines={1} ellipsizeMode="tail">
        {task.title}
      </Text>
      <Text style={styles.taskPreviewDueDate}>
        Due: {task.due_date || 'Not set'}
      </Text>
    </View>
  );
  
  const renderColumn = ({ item }) => (
    <View style={styles.columnItem}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnTitle}>{item.name}</Text>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.taskCount}>{item.tasks.length} tasks</Text>
      <FlatList
        data={item.tasks}
        keyExtractor={(task) => task.id.toString()}
        renderItem={({ item: task }) => renderTaskPreview(task)}
        ListEmptyComponent={<Text style={styles.emptyTaskList}>No tasks yet</Text>}
      />
      <TouchableOpacity onPress={() => openTaskModal(item)} style={styles.button}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Board Columns</Text>
        <TouchableOpacity onPress={openAddColumnModal} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal={true} contentContainerStyle={styles.columnsContainer}>
        {columns.map((column) => (
          <View key={column.id}>
            {renderColumn({ item: column })}
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddColumnModalVisible}
        onRequestClose={() => setIsAddColumnModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Column</Text>
            <TextInput
              style={styles.modalInput}
              value={newColumnName}
              onChangeText={setNewColumnName}
              placeholder="Column Name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={addColumn}>
                <Text style={styles.buttonText}>Add Column</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIsAddColumnModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTaskModalVisible}
        onRequestClose={() => setIsTaskModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Task to {selectedColumn?.name}</Text>
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
              placeholder="Due Date (YYYY-MM-DD)"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={addTaskToColumn}>
                <Text style={styles.buttonText}>Add Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setIsTaskModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Edit Column</Text>
            <TextInput
              style={styles.modalInput}
              value={editedColumnName}
              onChangeText={setEditedColumnName}
              placeholder="Column Name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={updateColumn}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonDelete]} onPress={() => deleteColumn(editingColumn.id)}>
                <Text style={styles.buttonText}>Delete</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  columnsContainer: {
    flexDirection: 'row',
  },
  columnItem: {
    width: 300,
    padding: 15,
    backgroundColor: '#ffffff',
    marginRight: 10,
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
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  taskPreview: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  taskPreviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskPreviewDueDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyTaskList: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    marginTop: 10,
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
  buttonDelete: {
    backgroundColor: "#FF6347",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});
