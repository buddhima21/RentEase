import { useState } from 'react';
import axios from 'axios';

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    invoiceId: '',
    amountPaid: '',
    paymentDate: '',
    paymentMethod: 'Cash'
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update with your actual API endpoint
      const response = await axios.post('http://localhost:8081/api/v1/payments/record', {
        invoiceId: formData.invoiceId,
        amountPaid: parseFloat(formData.amountPaid),
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod
      });

      setMessageType('success');
      setMessage('✅ Payment recorded successfully!');
      setFormData({ invoiceId: '', amountPaid: '', paymentDate: '', paymentMethod: 'Cash' });
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessageType('error');
      setMessage('❌ Failed to record payment. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 shadow-sm p-8">
      <div className="flex items-center gap-3 pb-6 border-b border-emerald-100">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
          <span className="material-symbols-outlined text-xl">payment</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pay Your Rent</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Record your monthly payment</p>
        </div>
      </div>

      {message && (
        <div className={`mt-6 mb-6 p-4 rounded-lg border ${
          messageType === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice ID / Reference */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Invoice Reference #</label>
          <input 
            type="text" 
            required 
            placeholder="e.g. INV-20260325-1234"
            className="w-full p-3 border border-emerald-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            value={formData.invoiceId}
            onChange={(e) => setFormData({...formData, invoiceId: e.target.value})}
          />
        </div>

        {/* Amount Paid */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Amount Paid (LKR)</label>
          <input 
            type="number" 
            required 
            step="0.01"
            placeholder="0.00"
            className="w-full p-3 border border-emerald-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            value={formData.amountPaid}
            onChange={(e) => setFormData({...formData, amountPaid: e.target.value})}
          />
        </div>

        {/* Payment Date */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Date Paid</label>
          <input 
            type="date" 
            required 
            className="w-full p-3 border border-emerald-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            value={formData.paymentDate}
            onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Payment Method</label>
          <select 
            className="w-full p-3 border border-emerald-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-slate-900 transition-all"
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
          >
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="md:col-span-2 bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-base">
            {isLoading ? 'hourglass_bottom' : 'check_circle'}
          </span>
          {isLoading ? 'Processing...' : 'Confirm Payment'}
        </button>
      </form>
    </div>
  );
}
