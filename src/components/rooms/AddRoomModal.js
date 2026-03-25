/**
 * src/components/rooms/AddRoomModal.js
 */
"use client";
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/apiClient';
import { useRooms } from '@/context/RoomsContext';

export default function AddRoomModal({ isOpen, onClose }) {
  const { refreshRooms } = useRooms();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    number: '',
    type: 'SINGLE',
    sharing: 1,
    rent: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/rooms', {
        number: formData.number,
        sharing: formData.type,
        capacity: parseInt(formData.sharing),
        rent: parseFloat(formData.rent)
      });
      await refreshRooms();
      onClose();
      // Reset form
      setFormData({ number: '', type: 'SINGLE', sharing: 1, rent: '' });
    } catch (err) {
      if (err.data?.errors) {
        const fullMsg = err.data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        setError(fullMsg);
      } else {
        setError(err.message || 'Failed to add room');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Room">
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
        
        <Input 
          label="Room Number" 
          name="number"
          placeholder="e.g. 101" 
          value={formData.number}
          onChange={handleChange}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select 
            label="Room Type" 
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={[
              { value: 'SINGLE', label: 'Single' },
              { value: 'DOUBLE', label: 'Double' },
              { value: 'TRIPLE', label: 'Triple' },
              { value: 'DORM', label: 'Dorm' }
            ]}
          />
          <Input 
            label="Sharing Capacity" 
            name="sharing"
            type="number"
            value={formData.sharing}
            onChange={handleChange}
            required
          />
        </div>

        <Input 
          label="Monthly Rent (₹)" 
          name="rent"
          type="number"
          placeholder="e.g. 8000"
          value={formData.rent}
          onChange={handleChange}
          required
        />

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Room'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
