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

  const renderTaskCard = (task) => (
    <TouchableOpacity style={styles.taskCard} key={task.id}>
      <Text style={styles.taskCardTitle} numberOfLines={2} ellipsizeMode="tail">
        {task.title}
      </Text>
      {task.due_date && (
        <View style={styles.taskCardDueDate}>
          <Ionicons name="calendar-outline" size={12} color="#666" />
          <Text style={styles.taskCardDueDateText}>{task.due_date}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderColumn = ({ item }) => (
    <View style={styles.column}>
      <View style={styles.columnHeader}>
        <Text style={styles.columnTitle}>{item.name}</Text>
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={item.tasks}
        keyExtractor={(task) => task.id.toString()}
        renderItem={({ item: task }) => renderTaskCard(task)}
        ListEmptyComponent={<Text style={styles.emptyTaskList}>No cards</Text>}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity onPress={() => openTaskModal(item)} style={styles.addCardButton}>
        <Ionicons name="add" size={24} color="#5E6C84" />
        <Text style={styles.addCardButtonText}>Add a card</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Trello Board</Text>
        <TouchableOpacity onPress={openAddColumnModal} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal={true} contentContainerStyle={styles.boardContainer} showsHorizontalScrollIndicator={false}>
        {columns.map((column) => (
          <View key={column.id} style={styles.columnWrapper}>
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
    backgroundColor: '#0079BF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#026AA7',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    padding: 8,
    backgroundColor: '#ffffff33',
    borderRadius: 4,
  },
  boardContainer: {
    padding: 8,
  },
  columnWrapper: {
    marginRight: 8,
  },
  column: {
    width: 272,
    backgroundColor: '#EBECF0',
    borderRadius: 3,
    padding: 8,
    maxHeight: '100%',
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#172B4D',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 3,
    padding: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  taskCardTitle: {
    fontSize: 14,
    color: '#172B4D',
    marginBottom: 4,
  },
  taskCardDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCardDueDateText: {
    fontSize: 12,
    color: '#5E6C84',
    marginLeft: 4,
  },
  emptyTaskList: {
    textAlign: 'center',
    color: '#5E6C84',
    marginTop: 8,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addCardButtonText: {
    color: '#5E6C84',
    marginLeft: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#172B4D',
    marginBottom: 16,
  },
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#DFE1E6',
    borderRadius: 3,
    paddingHorizontal: 8,
    width: '100%',
    marginBottom: 16,
    color: '#172B4D',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 3,
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#5AAC44',
  },
  secondaryButton: {
    backgroundColor: '#EBECF0',
  },
  secondaryButtonText: {
    color: '#172B4D',
  },
  deleteButton: {
    backgroundColor: '#B04632',
  },
  taskDescriptionInput: {
    height: 80,
    borderWidth: 1,
    borderColor: '#DFE1E6',
    borderRadius: 3,
    paddingHorizontal: 8,
    width: '100%',
    marginBottom: 16,
    color: '#172B4D',
    textAlignVertical: 'top',
  },
});
