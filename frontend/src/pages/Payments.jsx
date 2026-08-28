import { useState, useEffect } from 'react';
import { IndianRupee, Calendar, Filter, Receipt, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { formatINR } from '../utils/currency';
import { downloadCSV } from '../utils/csv';

const methodBadge = {
  cash: 'badge-success',
  card: 'badge-info',
  upi: 'badge-warning',
  online: 'badge-neutral'
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchPayments();
  }, [dateRange]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments/all', {
        params: dateRange
      });
      setPayments(response.data.payments);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

  const handleExport = () => {
    downloadCSV(
      `payments-${dateRange.startDate}-to-${dateRange.endDate}.csv`,
      ['Date', 'Member', 'Membership ID', 'Method', 'Amount', 'Remarks'],
      payments.map((p) => [
        format(new Date(p.paymentDate), 'yyyy-MM-dd'),
        p.member.fullName,
        p.member.membershipId,
        p.paymentMethod,
        p.amount,
        p.remarks || ''
      ])
    );
    toast.success('Payments exported');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="spinner w-12 h-12"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track all payment transactions</p>
        </div>
        <button onClick={handleExport} className="btn-secondary self-start sm:self-auto" disabled={payments.length === 0}>
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Total Revenue Card */}
        <div className="card bg-gradient-to-br from-ink-950 to-ink-900 border-none lg:col-span-1">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary-500/15 ring-1 ring-primary-400/25 mb-4">
            <IndianRupee size={20} className="text-primary-400" />
          </div>
          <p className="text-ink-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-white mt-1 tracking-tight">{formatINR(totalAmount)}</p>
          <p className="text-ink-400 text-sm mt-2">
            {payments.length} transaction{payments.length !== 1 ? 's' : ''} in range
          </p>
        </div>

        {/* Filters */}
        <div className="card lg:col-span-2">
          <p className="label mb-3">Filter by date range</p>
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs text-ink-400 mb-1.5 block">Start Date</label>
              <input
                type="date"
                className="input"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs text-ink-400 mb-1.5 block">End Date</label>
              <input
                type="date"
                className="input"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
            <button onClick={fetchPayments} className="btn-primary w-full md:w-auto">
              <Filter size={16} />
              <span>Apply</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="table-head">Date</th>
                <th className="table-head">Member</th>
                <th className="table-head">Member ID</th>
                <th className="table-head">Method</th>
                <th className="table-head">Amount</th>
                <th className="table-head">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center text-sm text-ink-300">
                        <Calendar size={15} className="mr-2 text-ink-500" />
                        {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {payment.member.fullName}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm text-ink-400">
                        {payment.member.membershipId}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`${methodBadge[payment.paymentMethod] || 'badge-neutral'} capitalize`}>
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">
                        {formatINR(payment.amount)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-ink-400 max-w-[14rem] truncate">
                        {payment.remarks || '—'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-ink-400">
                    <Receipt className="mx-auto text-ink-600 mb-3" size={32} />
                    No payments found for the selected period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
