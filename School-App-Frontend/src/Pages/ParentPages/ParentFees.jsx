import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../apiConfig";
import { 
  Wallet, 
  Calendar, 
  AlertTriangle, 
  CreditCard, 
  History, 
  Download, 
  CheckCircle,
  QrCode,
  ArrowRight
} from "lucide-react";

export default function ParentFees() {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentStep, setPaymentStep] = useState("selection"); // selection, method, simulate, success

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/parent-portal/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setChildren(res.data.data.children);
      if (res.data.data.children.length > 0) {
        setSelectedChildId(res.data.data.children[0]._id);
        fetchChildFees(res.data.data.children[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildFees = async (childId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/parent-portal/child/${childId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // We only care about fees for this page
      setFeeData(res.data.data.fees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChildChange = (e) => {
    const id = e.target.value;
    setSelectedChildId(id);
    fetchChildFees(id);
  };

  const handlePayment = async () => {
    setPaying(true);
    const pendingFee = feeData.find(f => f.status !== "paid");
    if (!pendingFee) return;

    try {
      await axios.post(`${API_BASE_URL}/parent-portal/pay-fee/${pendingFee._id}`, {
        method: "upi",
        amount: pendingFee.remaining
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setPaymentStep("success");
      fetchChildFees(selectedChildId);
    } catch (err) {
      alert("Payment simulation failed");
    } finally {
      setPaying(false);
    }
  };

  const currentFee = feeData?.find(f => f.status !== "paid") || (feeData && feeData[0]);

  if (loading && !feeData) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Fee Management</h1>
          <p className="text-gray-500 font-medium">View invoices and manage school payments.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
           <span className="text-xs font-bold text-gray-400 pl-3 uppercase tracking-widest">Select Child:</span>
           <select 
            value={selectedChildId} 
            onChange={handleChildChange}
            className="bg-gray-50 border-none text-sm font-bold text-gray-700 rounded-xl px-4 py-2 focus:ring-0 cursor-pointer"
           >
             {children.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── LEFT: INVOICE DETAILS ── */}
        <div className="lg:col-span-2 space-y-6">
          {currentFee ? (
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 overflow-hidden border border-gray-50 relative">
               {/* Watermark/Branding */}
               <div className="absolute top-0 right-0 p-10 opacity-[0.03] select-none pointer-events-none">
                  <Wallet size={300} />
               </div>

               {/* Invoice Header */}
               <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start gap-6 relative">
                  <div className="space-y-4">
                     <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">B</div>
                     <div>
                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">BYTE BUILDERS SCHOOL</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Official Fee Invoice</p>
                     </div>
                  </div>
                  <div className="text-right space-y-1">
                     <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${currentFee.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {currentFee.status === 'paid' ? 'Completed' : 'Pending Payment'}
                     </div>
                     <p className="text-sm font-bold text-gray-800 pt-2">INV-{currentFee._id.slice(-6).toUpperCase()}</p>
                     <p className="text-xs text-gray-400 font-medium italic">{currentFee.month} {currentFee.year}</p>
                  </div>
               </div>

               {/* Invoice Body */}
               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bill To</p>
                        <p className="text-lg font-bold text-gray-800">{children.find(c => c._id === selectedChildId)?.name}</p>
                        <p className="text-sm text-gray-500 font-medium">Standard {children.find(c => c._id === selectedChildId)?.class} - {children.find(c => c._id === selectedChildId)?.section}</p>
                     </div>
                     <div className="md:text-right space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Date</p>
                        <p className="text-lg font-bold text-gray-800">{new Date(currentFee.dueDate).toLocaleDateString()}</p>
                        {currentFee.isOverdue && <p className="text-xs text-rose-500 font-bold italic animate-pulse flex items-center md:justify-end gap-1"><AlertTriangle size={12}/> Payment is Overdue</p>}
                     </div>
                  </div>

                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           <th className="text-left pb-4">Description</th>
                           <th className="text-right pb-4">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        <tr className="group">
                           <td className="py-5 font-bold text-gray-700">Tuition Fees</td>
                           <td className="py-5 text-right font-black text-gray-800">₹{currentFee.tuitionFee}</td>
                        </tr>
                        <tr>
                           <td className="py-5 font-bold text-gray-700">Transport Charges</td>
                           <td className="py-5 text-right font-black text-gray-800">₹{currentFee.transportFee}</td>
                        </tr>
                        <tr>
                           <td className="py-5 font-bold text-gray-700">School Development Fund</td>
                           <td className="py-5 text-right font-black text-gray-800">₹{currentFee.developmentFee}</td>
                        </tr>
                        {currentFee.fine > 0 && (
                          <tr className="text-rose-600">
                             <td className="py-5 font-black flex items-center gap-2">
                                Late Payment Fine 
                                <span className="text-[9px] bg-rose-100 px-2 py-0.5 rounded-full">₹10 / DAY</span>
                             </td>
                             <td className="py-5 text-right font-black tracking-wider text-lg">+ ₹{currentFee.fine}</td>
                          </tr>
                        )}
                     </tbody>
                  </table>

                  <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Payable</p>
                        <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{currentFee.totalWithFine}</p>
                     </div>
                     <div className="text-right">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Paid Amount</p>
                         <p className="text-2xl font-black text-emerald-600">₹{currentFee.paidAmount}</p>
                     </div>
                  </div>
               </div>

               {/* Action Footer */}
               {currentFee.status !== 'paid' && (
                 <div className="px-10 py-8 bg-indigo-50/50 flex flex-col md:flex-row items-center gap-6 justify-between border-t border-indigo-100">
                    <div className="flex items-center gap-3 text-indigo-700">
                       <Calendar size={20} />
                       <p className="text-sm font-bold">Please complete payment to avoid further fines.</p>
                    </div>
                    <button 
                      onClick={() => setPaymentStep("method")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center gap-3 active:scale-95"
                    >
                       Pay Securely <ArrowRight size={20} />
                    </button>
                 </div>
               )}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
               <CheckCircle size={50} className="text-emerald-500 mx-auto mb-6" />
               <h3 className="text-xl font-bold text-gray-800">No Pending Fees</h3>
               <p className="text-gray-500 mt-2">All school dues are cleared for this child.</p>
            </div>
          )}

          {/* HISTORY SECTION */}
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-100/50 border border-gray-50">
             <div className="flex items-center gap-3 mb-8">
                <History size={20} className="text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-800">Payment History</h3>
             </div>
             <div className="space-y-4">
                {feeData?.filter(f => f.status === 'paid').map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-indigo-100 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                           <CheckCircle size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-gray-800 tracking-tight">{h.month} {h.year} Fee</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Trans ID Index- {h._id.slice(-4)}</p>
                        </div>
                     </div>
                     <div className="text-right flex items-center gap-6">
                        <p className="text-lg font-black text-gray-900">₹{h.totalWithFine}</p>
                        <button className="text-indigo-500 p-2 hover:bg-white rounded-lg transition">
                           <Download size={18} />
                        </button>
                     </div>
                  </div>
                ))}
                {feeData?.filter(f => f.status === 'paid').length === 0 && <p className="text-center py-8 text-gray-400 font-medium italic">No payment history found.</p>}
             </div>
          </div>
        </div>

        {/* ── RIGHT: PAYMENT INTERFACE ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 p-8 sticky top-8 space-y-8">
             <h3 className="text-xl font-black text-gray-800 flex items-center gap-3">
                <CreditCard size={20} className="text-indigo-600" />
                Payment Portal
             </h3>

             {paymentStep === "selection" && (
                <div className="space-y-4">
                   <div className="p-10 bg-indigo-50 rounded-[2.5rem] text-center space-y-2">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total to Pay</p>
                      <p className="text-5xl font-black text-indigo-700 tracking-tighter">
                        ₹{currentFee && currentFee.status !== 'paid' ? currentFee.remaining : "0"}
                      </p>
                   </div>
                   <p className="text-xs text-center text-gray-400 font-medium">Safe and secure 256-bit SSL encrypted payments.</p>
                   <button 
                    disabled={!currentFee || currentFee.status === 'paid'}
                    onClick={() => setPaymentStep("method")}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
                   >
                     Initialize Payment
                   </button>
                </div>
             )}

             {paymentStep === "method" && (
                <div className="space-y-6">
                   <p className="text-sm font-bold text-gray-500 mb-2">Choose Payment Method</p>
                   <div className="space-y-3">
                      {[
                        { id: 'upi', name: 'UPI (QR Scan / VPA)', icon: QrCode },
                        { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
                      ].map(m => (
                        <button 
                          key={m.id}
                          onClick={() => setPaymentStep("simulate")}
                          className="w-full p-5 bg-gray-50 hover:bg-white border border-gray-100 hover:border-indigo-600 rounded-2xl flex items-center gap-4 transition-all group"
                        >
                          <div className="w-12 h-12 bg-white group-hover:bg-indigo-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                             <m.icon size={22} />
                          </div>
                          <span className="font-bold text-gray-700 group-hover:text-gray-900 flex-1 text-left">{m.name}</span>
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0" />
                        </button>
                      ))}
                   </div>
                   <button 
                    onClick={() => setPaymentStep("selection")}
                    className="w-full text-xs font-bold text-gray-400 hover:text-gray-600 transition"
                   >
                     Go Back
                   </button>
                </div>
             )}

             {paymentStep === "simulate" && (
                <div className="space-y-8 text-center py-6">
                   <div className="relative mx-auto w-48 h-48">
                      <div className="absolute inset-0 bg-indigo-600 rounded-3xl opacity-5 animate-pulse"></div>
                      <div className="relative h-full flex items-center justify-center border-2 border-dashed border-indigo-200 rounded-3xl">
                         <QrCode size={100} className="text-indigo-600 opacity-20" />
                         <div className="absolute inset-x-0 bottom-6 flex justify-center">
                            <div className="text-[10px] font-black text-indigo-600 bg-white px-3 py-1 rounded-full shadow-md">SCAN TO PAY</div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2">
                       <h4 className="text-xl font-bold text-gray-800">Processing Transaction...</h4>
                       <p className="text-xs text-gray-400 font-medium">Please do not close this window.</p>
                   </div>

                   <button 
                    onClick={handlePayment}
                    disabled={paying}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                   >
                     {paying ? "Verifying Payment..." : "Simulate Success"}
                   </button>
                </div>
             )}

             {paymentStep === "success" && (
                <div className="space-y-8 text-center py-6 animate-in zoom-in-95 duration-500">
                   <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle size={48} />
                   </div>
                   <div className="space-y-2">
                       <h4 className="text-2xl font-black text-gray-900">Payment Successful!</h4>
                       <p className="text-xs text-gray-400 font-medium leading-relaxed">
                          Your receipt has been generated and the records have been updated for Admin review.
                       </p>
                   </div>
                   <button 
                    onClick={() => setPaymentStep("selection")}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 transition-all"
                   >
                     Done
                   </button>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
