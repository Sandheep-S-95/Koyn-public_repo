'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createAlert, updateAlert } from '@/lib/actions/alert.actions';
import { toast } from 'sonner';

const AlertModal = ({ alertId, alertData, action, open, setOpen, userEmail }: AlertModalProps & { userEmail: string }) => {
  const isEditing = action === 'edit' && !!alertId;

  const [alertName, setAlertName] = useState(alertData?.alertName || '');
  const [stockIdentifier, setStockIdentifier] = useState(
    alertData ? `${alertData.company}` : ''
  );
  const [alertType, setAlertType] = useState<string>('Price');
  const [condition, setCondition] = useState<'upper' | 'lower'>(alertData?.alertType || 'upper');
  const [threshold, setThreshold] = useState(alertData?.threshold || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (alertData) {
      setAlertName(alertData.alertName || '');
      setStockIdentifier(`${alertData.company}`);
      setCondition(alertData.alertType || 'upper');
      setThreshold(alertData.threshold || '');
    }
  }, [alertData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertName.trim() || !threshold) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const thresholdNum = parseFloat(String(threshold));
      if (isNaN(thresholdNum) || thresholdNum <= 0) {
        toast.error('Please enter a valid threshold value');
        setLoading(false);
        return;
      }

      let result;

      if (isEditing && alertId) {
        result = await updateAlert(userEmail, alertId, {
          alertName: alertName.trim(),
          alertType: condition,
          threshold: thresholdNum,
        });
      } else {
        result = await createAlert(userEmail, {
          symbol: alertData?.symbol || '',
          company: alertData?.company || '',
          alertName: alertName.trim(),
          alertType: condition,
          threshold: thresholdNum,
        });
      }

      if (result.success) {
        toast.success(isEditing ? 'Alert updated successfully' : 'Alert created successfully');
        setOpen(false);
        // Reset form
        if (!isEditing) {
          setAlertName('');
          setThreshold('');
        }
      } else {
        toast.error('Failed to save alert');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="alert-dialog !max-w-md">
        <DialogHeader>
          <DialogTitle className="alert-title">
            {isEditing ? 'Edit Price Alert' : 'Create Price Alert'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Alert Name */}
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Alert Name</label>
            <input
              type="text"
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder="e.g. Alphabet Inc Alert"
              className="form-input"
            />
          </div>

          {/* Stock Identifier */}
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Stock Identifier</label>
            <input
              type="text"
              value={stockIdentifier}
              readOnly
              className="form-input opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Alert Type */}
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Alert type</label>
            <div className="relative">
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="form-input w-full appearance-none pr-10 cursor-pointer"
              >
                <option value="Price">Price</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Condition</label>
            <div className="relative">
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'upper' | 'lower')}
                className="form-input w-full appearance-none pr-10 cursor-pointer"
              >
                <option value="upper">Greater than (&gt;)</option>
                <option value="lower">Less than (&lt;)</option>
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Threshold Value */}
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Threshold value</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="0.00"
                className="form-input w-full pl-8"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="emerald-btn mt-1 disabled:opacity-50"
          >
            {loading
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
                ? 'Update Alert'
                : 'Create Alert'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AlertModal;
