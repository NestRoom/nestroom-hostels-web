/**
 * src/components/services/NewTicketModal.js
 */
"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/apiClient';

export default function NewTicketModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [residents, setResidents] = useState([]);
  
  const [formData, setFormData] = useState({
    residentId: '',
    title: '',
    description: '',
    category: 'MAINTENANCE',
    priority: 'MEDIUM'
  });

  useEffect(() => {
    if (isOpen) {
      loadResidents();
    }
  }, [isOpen]);

  const loadResidents = async () => {
    try {
      const data = await apiClient.get('/residents?status=ACTIVE');
      setResidents(data.residents);
    } catch (err) {
      console.error('Failed to load residents:', err);
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
      await apiClient.post('/services/tickets', formData);
      if (onRefresh) onRefresh();
      onClose();
      setFormData({ residentId: '', title: '', description: '', category: 'MAINTENANCE', priority: 'MEDIUM' });
    } catch (err) {
      const errorMsg = err.data?.errors?.map(e => `${e.field}: ${e.message}`).join(', ') || err.message || 'Failed to create ticket';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Service Ticket">
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
        
        <Select 
          label="Resident" 
          name="residentId"
          value={formData.residentId}
          onChange={handleChange}
          required
          options={residents.map(r => ({ 
            value: r.id, 
            label: `${r.name} (ID: ${r.phone})` 
          }))}
        />

        <Input 
          label="Title" 
          name="title"
          placeholder="Brief summary of the issue" 
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select 
            label="Category" 
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={[
              { value: 'MAINTENANCE', label: 'Maintenance' },
              { value: 'WIFI', label: 'Wi-Fi / Internet' },
              { value: 'LAUNDRY', label: 'Laundry' },
              { value: 'MESS', label: 'Mess / Food' },
              { value: 'OTHERS', label: 'Others' }
            ]}
          />
          <Select 
            label="Priority" 
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' }
            ]}
          />
        </div>

        <Input 
          label="Description" 
          name="description"
          placeholder="Details about the problem..."
          value={formData.description}
          onChange={handleChange}
          required
        />

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
