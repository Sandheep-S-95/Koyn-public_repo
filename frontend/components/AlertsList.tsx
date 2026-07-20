'use client';

import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { deleteAlert } from '@/lib/actions/alert.actions';
import { formatPrice, formatChangePercent, getChangeColorClass, getAlertText } from '@/lib/utils';
import { toast } from 'sonner';
import AlertModal from './AlertModal';

const AlertsList = ({ alertData, userEmail }: AlertsListProps & { userEmail: string }) => {
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleDelete = async (alertId: string) => {
    try {
      const result = await deleteAlert(userEmail, alertId);
      if (result.success) {
        toast.success('Alert deleted successfully');
      } else {
        toast.error('Failed to delete alert');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setEditModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="watchlist-title">Alerts</h2>
        <div className="alert-list scrollbar-hide-default">
          {!alertData || alertData.length === 0 ? (
            <div className="alert-empty py-12 flex flex-col items-center justify-center w-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-3 text-gray-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <p className="text-sm">No alerts set up yet.</p>
              <p className="text-xs text-gray-600 mt-1">Click &quot;Add Alert&quot; on a stock to create one.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {alertData.map((alert) => (
                <div key={alert.id} className="alert-item">
                  {/* Alert Name */}
                  <h3 className="alert-name">{alert.alertName}</h3>

                  {/* Stock Details */}
                  <div className="alert-details">
                    <div>
                      <p className="alert-company">{alert.company}</p>
                      <p className="alert-price">{formatPrice(alert.currentPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-gray-500">{alert.symbol}</p>
                      <p className={`text-sm font-medium ${getChangeColorClass(alert.changePercent)}`}>
                        {formatChangePercent(alert.changePercent)}
                      </p>
                    </div>
                  </div>

                  {/* Alert Condition & Actions */}
                  <div className="alert-actions">
                    <div>
                      <span className="text-xs text-gray-500">Alert at:</span>
                      <p className="text-sm font-medium text-emerald-400">{getAlertText(alert)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(alert)}
                        className="alert-update-btn p-2"
                        title="Edit alert"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="alert-delete-btn p-2"
                        title="Delete alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Alert Modal */}
      {editingAlert && (
        <AlertModal
          alertId={editingAlert.id}
          alertData={{
            symbol: editingAlert.symbol,
            company: editingAlert.company,
            alertName: editingAlert.alertName,
            alertType: editingAlert.alertType,
            threshold: String(editingAlert.threshold),
          }}
          action="edit"
          open={editModalOpen}
          setOpen={setEditModalOpen}
          userEmail={userEmail}
        />
      )}
    </>
  );
};

export default AlertsList;
