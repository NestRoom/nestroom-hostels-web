/**
 * src/components/payments/RecordPaymentModal.js
 */
"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input, { Select } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import apiClient from '@/lib/apiClient';

export default function RecordPaymentModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [residents, setResidents] = useState([]);
  
  const [formData, setFormData] = useState({
    residentId: '',
    amount: '',
    method: 'UPI',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
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
      await apiClient.post('/payments', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      if (onRefresh) onRefresh();
      onClose();
      setFormData({ residentId: '', amount: '', method: 'UPI', date: new Date().toISOString().split('T')[0], remarks: '' });
    } catch (err) {
      const errorMsg = err.data?.errors?.map(e => `${e.field}: ${e.message}`).join(', ') || err.message || 'Failed to record payment';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record New Payment">
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input 
            label="Amount (₹)" 
            name="amount"
            type="number"
            placeholder="e.g. 8000"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <Select 
            label="Payment Method" 
            name="method"
            value={formData.method}
            onChange={handleChange}
            options={[
              { value: 'UPI', label: 'UPI / PhonePe' },
              { value: 'Cash', label: 'Cash' },
              { value: 'Bank Transfer', label: 'Bank Transfer' },
              { value: 'Card', label: 'Credit/Debit Card' }
            ]}
          />
        </div>

        <Input 
          label="Payment Date" 
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <Input 
          label="Remarks (Optional)" 
          name="remarks"
          placeholder="e.g. March 2024 Rent"
          value={formData.remarks}
          onChange={handleChange}
        />

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
