import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, ScrollView, Platform } from 'react-native';
import { supabase } from '../(auth)/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment-timezone';

// Components
const TopBar = ({ title, onAddCard }) => (
  <View style={styles.topBar}>
    <Text style={styles.topBarTitle}>{title}</Text>
    <TouchableOpacity onPress={onAddCard} style={styles.addButton}>
      <Ionicons name="add" size={24} color="#ffffff" />
    </TouchableOpacity>
  </View>
);

const TaskCard = ({ task }) => (
  <TouchableOpacity style={styles.taskCard}>
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

const Card = ({ card, onEditCard, onAddTask }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{card.name}</Text>
      <TouchableOpacity onPress={() => onEditCard(card)}>
        <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
      </TouchableOpacity>
    </View>
    <FlatList
      data={card.tasks}
      keyExtractor={(task) => task.id.toString()}
      renderItem={({ item: task }) => <TaskCard task={task} />}
      ListEmptyComponent={<Text style={styles.emptyTaskList}>No tasks</Text>}
      showsVerticalScrollIndicator={false}
    />
    <TouchableOpacity onPress={() => onAddTask(card)} style={styles.addCardButton}>
      <Ionicons name="add" size={24} color="#5E6C84" />
      <Text style={styles.addCardButtonText}>Add a task</Text>
    </TouchableOpacity>
  </View>
);

// Modals
const AddCardModal = ({ visible, onClose, onAddCard, newCardName, setNewCardName }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Add New Card</Text>
        <TextInput
          style={styles.modalInput}
          value={newCardName}
          onChangeText={setNewCardName}
          placeholder="Card Name"
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.button} onPress={onAddCard}>
            <Text style={styles.buttonText}>Add Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const AddTaskModal = ({ visible, onClose, onAddTask, selectedCard, taskTitle, setTaskTitle, taskDescription, setTaskDescription, taskDueDate, setTaskDueDate }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    // Check if the device is set to use 24-hour format
    const is24 = new Date().toLocaleTimeString().includes('AM') ? false : true;
    setIs24Hour(is24);
  }, []);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    updateTaskDueDate(currentDate, time);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
    updateTaskDueDate(date, currentTime);
  };

  const updateTaskDueDate = (newDate, newTime) => {
    const combinedDate = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      newTime.getHours(),
      newTime.getMinutes()
    );
    const userTimeZone = moment.tz.guess();
    const formattedDate = moment(combinedDate).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss z');
    setTaskDueDate(formattedDate);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
    setShowTimePicker(false);
  };

  const toggleTimePicker = () => {
    setShowTimePicker(!showTimePicker);
    setShowDatePicker(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Add Task to {selectedCard?.name}</Text>
          <TextInput
            style={styles.modalInput}
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder="Task Title"
          />
          <TextInput
            style={[styles.modalInput, styles.taskDescriptionInput]}
            value={taskDescription}
            onChangeText={setTaskDescription}
            placeholder="Task Description"
            multiline={true}
          />
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={toggleDatePicker}
            >
              <Text>{date ? moment(date).format('YYYY-MM-DD') : 'Set Date'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={toggleTimePicker}
            >
              <Text>{time ? moment(time).format(is24Hour ? 'HH:mm' : 'hh:mm A') : 'Set Time'}</Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              testID="datePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={time}
              mode="time"
              is24Hour={is24Hour}
              display="default"
              onChange={onTimeChange}
            />
          )}
          {(Platform.OS === 'ios' && (showDatePicker || showTimePicker)) && (
            <View style={styles.iosPickerButtons}>
              <TouchableOpacity onPress={() => {
                setShowDatePicker(false);
                setShowTimePicker(false);
              }}>
                <Text style={styles.iosPickerButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.button} onPress={onAddTask}>
              <Text style={styles.buttonText}>Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const EditCardModal = ({ visible, onClose, onUpdateCard, onDeleteCard, editedCardName, setEditedCardName, editedCardDescription, setEditedCardDescription }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Edit Card</Text>
        <TextInput
          style={styles.modalInput}
          value={editedCardName}
          onChangeText={setEditedCardName}
          placeholder="Card Name"
        />
        <TextInput
          style={[styles.modalInput, styles.taskDescriptionInput]}
          value={editedCardDescription}
          onChangeText={setEditedCardDescription}
          placeholder="Card Description"
          multiline={true}
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.button} onPress={onUpdateCard}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonDelete]} onPress={onDeleteCard}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonClose]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// Main component
export default function cards() {
  const router = useRouter();
  const { boardId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [isAddCardModalVisible, setIsAddCardModalVisible] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [editingCard, setEditingCard] = useState(null);
  const [editedCardName, setEditedCardName] = useState('');
  const [editedCardDescription, setEditedCardDescription] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  useEffect(() => {
    if (!boardId) {
      console.error('No boardId received');
      return;
    }
    getCards(boardId);
  }, [boardId]);

  async function getCards(boardId) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cards')
        .select('id, name, position, tasks (id, title, description, due_date, position)')
        .eq('board_id', boardId)
        .order('position', { ascending: true });

      if (error) throw error;
      if (!data) throw new Error('No card data received');

      setCards(data);
    } catch (error) {
      Alert.alert('Loading cards failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addCard() {
    if (!newCardName.trim()) {
      Alert.alert('Please enter a card name');
      return;
    }
    try {
      const { error } = await supabase
        .from('cards')
        .insert([{ name: newCardName, board_id: boardId, position: cards.length }]);
      if (error) throw error;
      setNewCardName('');
      setIsAddCardModalVisible(false);
      getCards(boardId);
    } catch (error) {
      Alert.alert('Error adding card', error.message);
    }
  }

  async function updateCard() {
    if (!editedCardName.trim()) {
      Alert.alert('Please enter a card name');
      return;
    }
    try {
      const { error } = await supabase
        .from('cards')
        .update({ 
          name: editedCardName,
          description: editedCardDescription
        })
        .eq('id', editingCard.id);
      if (error) throw error;
      setIsEditModalVisible(false);
      setEditingCard(null);
      setEditedCardName('');
      setEditedCardDescription('');
      getCards(boardId);
    } catch (error) {
      Alert.alert('Error updating card', error.message);
    }
  }
  
  async function addTaskToCard() {
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
          card_id: selectedCard.id, 
          position: selectedCard.tasks.length 
        }]);
      if (error) throw error;
      setTaskTitle('');
      setTaskDescription('');
      setTaskDueDate('');
      setIsTaskModalVisible(false);
      getCards(boardId);
    } catch (error) {
      Alert.alert('Error adding task', error.message);
    }
  }

  async function deleteCard(cardId) {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);
      if (error) throw error;
      getCards(boardId);
    } catch (error) {
      Alert.alert('Error deleting card', error.message);
    }
  }

  const openEditModal = (card) => {
    setEditingCard(card);
    setEditedCardName(card.name);
    setEditedCardDescription(card.description || '');
    setIsEditModalVisible(true);
  };
  
  const openTaskModal = (card) => {
    setSelectedCard(card);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setIsTaskModalVisible(true);
  };

  const openAddCardModal = () => {
    setIsAddCardModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TopBar title="Trello Board" onAddCard={openAddCardModal} />
      
      <ScrollView horizontal={true} contentContainerStyle={styles.boardContainer} showsHorizontalScrollIndicator={false}>
        {cards.map((card) => (
          <View key={card.id} style={styles.cardWrapper}>
            <Card 
              card={card}
              onEditCard={openEditModal}
              onAddTask={openTaskModal}
            />
          </View>
        ))}
      </ScrollView>

      <AddCardModal 
        visible={isAddCardModalVisible}
        onClose={() => setIsAddCardModalVisible(false)}
        onAddCard={addCard}
        newCardName={newCardName}
        setNewCardName={setNewCardName}
      />
      
      <AddTaskModal 
        visible={isTaskModalVisible}
        onClose={() => setIsTaskModalVisible(false)}
        onAddTask={addTaskToCard}
        selectedCard={selectedCard}
        taskTitle={taskTitle}
        setTaskTitle={setTaskTitle}
        taskDescription={taskDescription}
        setTaskDescription={setTaskDescription}
        taskDueDate={taskDueDate}
        setTaskDueDate={setTaskDueDate}
      />

      <EditCardModal 
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onUpdateCard={updateCard}
        onDeleteCard={() => deleteCard(editingCard.id)}
        editedCardName={editedCardName}
        setEditedCardName={setEditedCardName}
      />
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
  cardWrapper: {
    marginRight: 8,
  },
  card: {
    width: 272,
    backgroundColor: '#EBECF0',
    borderRadius: 3,
    padding: 8,
    maxHeight: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
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
  buttonClose: {
    backgroundColor: '#EBECF0',
  },
  buttonDelete: {
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
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: '#EBECF0',
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  iosPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 16,
  },
  iosPickerButtonText: {
    color: '#0079BF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
