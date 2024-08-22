import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CircularMenu = ({ visible, onClose, onEdit, onDelete }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={[styles.menuItem, styles.editItem]} onPress={onEdit}>
          <Icon name="pencil" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.deleteItem]} onPress={onDelete}>
          <Icon name="trash" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.cancelItem]} onPress={onClose}>
          <Icon name="close" size={24} color="#ffffff" />
          <Text style={styles.menuText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  menuItem: {
    width: '50%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editItem: {
    backgroundColor: '#4CAF50',
  },
  deleteItem: {
    backgroundColor: '#F44336',
  },
  cancelItem: {
    backgroundColor: '#2196F3',
    width: '100%',
  },
  menuText: {
    color: '#ffffff',
    marginTop: 5,
  },
});

export default CircularMenu;
