/**
 * src/components/residents/AddResidentModal.js
 */
"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/apiClient';

export default function AddResidentModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rooms, setRooms] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roomId: '',
    joinDate: new Date().toISOString().split('T')[0],
    securityDeposit: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadVacantRooms();
    }
  }, [isOpen]);

  const loadVacantRooms = async () => {
    try {
      const data = await apiClient.get('/rooms?status=VACANT');
      // Also include partially vacant
      const partiallyVacant = await apiClient.get('/rooms?status=PARTIALLY VACANT');
      setRooms([...data.rooms, ...partiallyVacant.rooms]);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/residents', {
        ...formData,
        securityDeposit: parseFloat(formData.securityDeposit)
      });
      if (onRefresh) onRefresh();
      onClose();
      // Reset
      setFormData({ name: '', email: '', phone: '', roomId: '', joinDate: new Date().toISOString().split('T')[0], securityDeposit: '' });
    } catch (err) {
      const errorMsg = err.data?.errors?.map(e => `${e.field}: ${e.message}`).join(', ') || err.message || 'Failed to add resident';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Resident">
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
        
        <Input 
          label="Full Name" 
          name="name"
          placeholder="Resident name" 
          value={formData.name}
          onChange={handleChange}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input 
            label="Email Address" 
            name="email"
            type="email"
            placeholder="resident@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input 
            label="Phone Number" 
            name="phone"
            type="tel"
            placeholder="e.g. 9876543210"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <Select 
          label="Assign Room" 
          name="roomId"
          value={formData.roomId}
          onChange={handleChange}
          required
          options={rooms.map(r => ({ 
            value: r.id, 
            label: `Room ${r.number} (${r.sharing} - Rent: ₹${r.rent})` 
          }))}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input 
            label="Join Date" 
            name="joinDate"
            type="date"
            value={formData.joinDate}
            onChange={handleChange}
            required
          />
          <Input 
            label="Security Deposit (₹)" 
            name="securityDeposit"
            type="number"
            placeholder="e.g. 5000"
            value={formData.securityDeposit}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
