import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Client } from '../types';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Building,
  FileSpreadsheet,
  Trash2,
  Edit,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '../utils/accountingMath';

export const ClientsView: React.FC<{
  onEditClient: (client: Client) => void;
  onCreateInvoiceForClient: (client: Client) => void;
}> = ({ onEditClient, onCreateInvoiceForClient }) => {
  const {
    clients,
    invoices,
    selectedCurrency,
    setIsClientModalOpen,
    deleteClient,
  } = useAccounting();

  const [search, setSearch] = useState('');

  const filteredClients = clients.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Clients & Accounts Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage billing profiles, default payment terms, and client lifetime revenue
          </p>
        </div>

        <button
          onClick={() => setIsClientModalOpen(true)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients by name, company, email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientInvoices = invoices.filter((i) => i.clientId === client.id);
          const totalInvoiced = clientInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
          const totalOutstanding = clientInvoices
            .filter((i) => i.status === 'sent' || i.status === 'overdue')
            .reduce((sum, i) => sum + i.balanceDue, 0);

          return (
            <div
              key={client.id}
              className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{client.companyName || client.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{client.name}</p>
                  </div>
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Net {client.paymentTermsDays || 30} Days
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                      {client.address.street}, {client.address.city}, {client.address.state}
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Billed</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatCurrency(totalInvoiced, selectedCurrency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Outstanding</span>
                    <span
                      className={`font-mono font-bold ${
                        totalOutstanding > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatCurrency(totalOutstanding, selectedCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => onCreateInvoiceForClient(client)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Invoice Client</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditClient(client)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Client"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete client ${client.name}?`)) {
                        deleteClient(client.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-slate-800">No Clients Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add client accounts to dispatch invoices, track receivable balances, and manage payment terms.
            </p>
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="mt-4 px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Client</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
