// import { useState, useEffect, useCallback } from "react";
// import { useTheme, alpha } from "@mui/material";
// import api from "../../services/api";

// const BASE = "/payout-requests";

// function StatusBadge({ status }) {
//   const theme = useTheme();
//   const key = (status || "pending").toLowerCase();
  
//   const styles = {
//     pending:   { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark, dot: theme.palette.warning.main },
//     completed: { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, dot: theme.palette.success.main },
//     rejected:  { bg: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark, dot: theme.palette.error.main },
//   };

//   const s = styles[key] || styles.pending;
//   return (
//     <span style={{
//       display: "inline-flex", alignItems: "center", gap: 6,
//       background: s.bg, color: s.color,
//       padding: "4px 12px", borderRadius: 20,
//       fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize",
//     }}>
//       <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
//       {key}
//     </span>
//   );
// }

// function formatDate(dateStr) {
//   if (!dateStr) return "—";
//   const d = new Date(dateStr);
//   if (isNaN(d.getTime())) return "—";
//   return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
// }

// function fmt(n) {
//   return Math.max(0, Number(n || 0)).toLocaleString("en-IN");
// }

// function WithdrawModal({ wallet, onClose, onSubmit, loading }) {
//   const theme = useTheme();
//   const [amount,    setAmount]    = useState("");
//   const [bankAcc,   setBankAcc]   = useState(wallet?.accountNumber || "");
//   const [storeName, setStoreName] = useState(wallet?.storeName || "");
//   const [error,     setError]     = useState("");

   
//   const available = Math.max(0, Number(wallet?.available_balance || 0));

//   const handleConfirm = () => {
//   setError("");
//   const num = Number(amount);
//   if (!amount || isNaN(num) || num <= 0) { setError("Please enter a valid amount"); return; }
//   if (available <= 0)  { setError("You have no available balance to withdraw."); return; }
//   if (num > available) { setError(`Insufficient balance. Max available: ₹${available.toLocaleString("en-IN")}`); return; }
//   if (!storeName.trim()) { setError("Please enter your store name"); return; }
//   if (!bankAcc.trim())   { setError("Please enter your bank account number"); return; }
//   onSubmit({ amount: String(num), bank_account: bankAcc.trim(), store_name: storeName.trim() });
// };

//   const inputStyle = {
//     width: "100%", height: 46, padding: "0 14px",
//     border: `1.5px solid ${theme.palette.divider}`, borderRadius: 12,
//     fontSize: "0.875rem", color: theme.palette.text.primary, outline: "none",
//     boxSizing: "border-box", background: theme.palette.background.paper,
//     transition: "border-color 0.2s, box-shadow 0.2s",
//     fontFamily: "'DM Sans', sans-serif",
//   };

//   const focus = e => { e.target.style.borderColor = "#0b8457"; e.target.style.boxShadow = "0 0 0 3px rgba(11,132,87,0.1)"; };
//   const blur  = e => { e.target.style.borderColor = theme.palette.divider; e.target.style.boxShadow = "none"; };

//   return (
//     <div
//       style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
//       onClick={e => e.target === e.currentTarget && onClose()}
//     >
//       <div style={{
//         width: 460, background: theme.palette.background.paper, borderRadius: 20, padding: 28,
//         boxShadow: theme.shadows[10],
//         border: `1px solid ${theme.palette.divider}`,
//         animation: "wm-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",
//         maxHeight: "90vh", overflowY: "auto",
//       }}>
//         <style>{`
//           @keyframes wm-in  { from{opacity:0;transform:scale(0.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
//           @keyframes wm-spin { to { transform: rotate(360deg); } }
//         `}</style>

//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
//           <div>
//             <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: theme.palette.text.primary }}>💸 Request Payout</h2>
//             <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: theme.palette.text.secondary }}>Submit a withdrawal request to the admin</p>
//           </div>
//           <button onClick={onClose} style={{
//             width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${theme.palette.divider}`,
//             background: theme.palette.background.paper, cursor: "pointer", fontSize: "0.9rem",
//             display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.text.secondary,
//           }}>✕</button>
//         </div>

//         <div style={{
//           background: "linear-gradient(135deg, #0b8457 0%, #059669 100%)",
//           borderRadius: 14, padding: "14px 18px", marginBottom: 22, color: "#fff",
//           display: "flex", justifyContent: "space-between", alignItems: "center",
//         }}>
//           <div>
//             <div style={{ fontSize: "0.7rem", fontWeight: 600, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>
//               Available Balance
//             </div>
//             <div style={{ fontSize: "1.7rem", fontWeight: 800, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.5px" }}>
//               ₹{available.toLocaleString("en-IN")}
//             </div>
//           </div>
//           <div style={{ fontSize: "2rem", opacity: 0.7 }}>🏦</div>
//         </div>

//         <label style={{ fontSize: "0.78rem", fontWeight: 600, color: theme.palette.text.primary, display: "block", marginBottom: 6 }}>Amount (₹) *</label>
//         <div style={{ position: "relative", marginBottom: 8 }}>
//           <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: theme.palette.text.secondary, fontWeight: 700, pointerEvents: "none" }}>₹</span>
//           <input
//             type="number" placeholder="0.00" value={amount}
//             onChange={e => setAmount(e.target.value)}
//             onFocus={focus} onBlur={blur}
//             style={{ ...inputStyle, paddingLeft: 32, fontFamily: "'DM Mono', monospace", fontWeight: 600, fontSize: "1rem" }}
//           />
//         </div>

//         <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
//           {[25, 50, 75, 100].map(pct => {
//             const val = Math.floor(available * pct / 100);
//             return (
//               <button key={pct} onClick={() => setAmount(String(val))} style={{
//                 flex: 1, padding: "5px 0", borderRadius: 8,
//                 border: `1.5px solid ${theme.palette.divider}`, background: theme.palette.background.paper,
//                 fontSize: "0.72rem", fontWeight: 700, color: theme.palette.text.primary, cursor: "pointer",
//               }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = "#0b8457"; e.currentTarget.style.color = "#0b8457"; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = theme.palette.divider; e.currentTarget.style.color = theme.palette.text.primary; }}
//               >
//                 {pct}%
//               </button>
//             );
//           })}
//         </div>

//         <label style={{ fontSize: "0.78rem", fontWeight: 600, color: theme.palette.text.primary, display: "block", marginBottom: 6 }}>Store Name *</label>
//         <input
//           type="text" placeholder="Your store name" value={storeName}
//           onChange={e => setStoreName(e.target.value)}
//           onFocus={focus} onBlur={blur}
//           style={{ ...inputStyle, marginBottom: 16 }}
//         />

//         <label style={{ fontSize: "0.78rem", fontWeight: 600, color: theme.palette.text.primary, display: "block", marginBottom: 6 }}>Bank Account Number *</label>
//         <input
//           type="text" placeholder="e.g. 1234567890" value={bankAcc}
//           onChange={e => setBankAcc(e.target.value)}
//           onFocus={focus} onBlur={blur}
//           style={{ ...inputStyle, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}
//         />

//         <div style={{
//           background: alpha(theme.palette.success.main, 0.1), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, borderRadius: 10,
//           padding: "10px 14px", marginBottom: 16, fontSize: "0.78rem", color: theme.palette.success.dark,
//           display: "flex", gap: 8,
//         }}>
//           <span>ℹ️</span>
//           <span>Your request will be reviewed by the admin within 1–3 business days. Make sure your bank details are correct.</span>
//         </div>

//         {error && (
//           <div style={{
//             background: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 10,
//             padding: "9px 14px", marginBottom: 14, fontSize: "0.78rem", color: theme.palette.error.dark,
//           }}>
//             ⚠️ {error}
//           </div>
//         )}

//         <button
//           onClick={handleConfirm}
//           disabled={loading}
//           style={{
//             width: "100%", height: 48,
//             background: loading ? theme.palette.action.disabledBackground : "#0b8457",
//             color: "#fff", border: "none", borderRadius: 12,
//             fontSize: "0.9rem", fontWeight: 700,
//             cursor: loading ? "not-allowed" : "pointer",
//             display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
//             transition: "background 0.2s, box-shadow 0.2s",
//           }}
//           onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 4px 14px rgba(11,132,87,0.35)"; }}
//           onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
//         >
//           {loading ? (
//             <>
//               <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "wm-spin 0.7s linear infinite", display: "inline-block" }} />
//               Submitting…
//             </>
//           ) : "Send Payout Request to Admin"}
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function Wallet() {
//   const theme = useTheme();
//   const [wallet,        setWallet]        = useState(null);
//   const [history,       setHistory]       = useState([]);
//   const [walletLoading, setWalletLoading] = useState(true);
//   const [histLoading,   setHistLoading]   = useState(true);
//   const [showModal,     setShowModal]     = useState(false);
//   const [submitting,    setSubmitting]    = useState(false);
//   const [toast,         setToast]         = useState(null);

//   const showToast = (msg, type = "success") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const fetchWallet = useCallback(async () => {
//     setWalletLoading(true);
//     try {
//       const res = await api.get("/wallet");
//       setWallet(res.data.data);
//     } catch {
//       showToast("Failed to load wallet data", "error");
//     } finally {
//       setWalletLoading(false);
//     }
//   }, []);

//   const fetchHistory = useCallback(async () => {
//     setHistLoading(true);
//     try {
//       const res = await api.get(`${BASE}/my`);
//       const rows = (res.data.data || []).map(r => ({
//         ...r,
//         status: (r.status || "pending").toLowerCase(),
//       }));
//       setHistory(rows);
//     } catch {
//       showToast("Failed to load history", "error");
//     } finally {
//       setHistLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchWallet();
//     fetchHistory();
//   }, [fetchWallet, fetchHistory]);

//   const handleWithdraw = async ({ amount, bank_account, store_name }) => {
//     setSubmitting(true);
//     try {
//       await api.post(BASE, { amount, bank_account, store_name });
//       showToast("Payout request sent to admin successfully!");
//       setShowModal(false);
//       await Promise.all([fetchWallet(), fetchHistory()]);
//     } catch (err) {
//       showToast(err.response?.data?.message || "Request failed", "error");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const avail = Math.max(0, Number(wallet?.available_balance || 0));

//   const statCards = [
//     { label: "Total Earnings",         value: wallet?.total_earnings,       sub: "All-time earnings",     icon: "💼", iconBg: alpha("#9333ea", 0.1), accent: "#9333ea" },
//     { label: "Available to Withdraw",  value: avail,                        sub: "Ready for payout",      icon: "📈", iconBg: alpha("#16a34a", 0.1), accent: "#16a34a", action: true },
//     { label: "Settlement in Progress", value: wallet?.settlement_in_progress,   sub: "Will be released soon", icon: "⏱️", iconBg: alpha("#3b82f6", 0.1), accent: "#3b82f6" },
//     { label: "Pending Orders Value",   value: wallet?.pending_orders_value, sub: "Not delivered yet",     icon: "📦", iconBg: alpha("#f59e0b", 0.1), accent: "#f59e0b" },
//   ];

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
//         .wl-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
//         .wl-wrap { min-height: 100vh; background: ${theme.palette.background.default}; padding: 36px 32px; }

//         .wl-header { margin-bottom: 28px; }
//         .wl-header h1 { font-size: 1.6rem; font-weight: 700; color: ${theme.palette.text.primary}; margin: 0 0 4px; letter-spacing: -0.3px; }
//         .wl-header p  { font-size: 0.875rem; color: ${theme.palette.text.secondary}; margin: 0; }

//         .wl-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }

//         .wl-stat { background: ${theme.palette.background.paper}; border-radius: 16px; border: 1px solid ${theme.palette.divider}; padding: 22px; position: relative; overflow: hidden; transition: box-shadow 0.2s; }
//         .wl-stat:hover { box-shadow: ${theme.shadows[4]}; }
//         .wl-stat-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
//         .wl-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 12px; }
//         .wl-stat-label { font-size: 0.72rem; font-weight: 700; color: ${theme.palette.text.disabled}; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
//         .wl-stat-value { font-size: 1.5rem; font-weight: 800; color: ${theme.palette.text.primary}; font-family: 'DM Mono', monospace; letter-spacing: -0.5px; }
//         .wl-stat-sub { font-size: 0.78rem; color: ${theme.palette.text.secondary}; margin-top: 3px; }

//         .wl-skeleton { background: linear-gradient(90deg,${theme.palette.action.hover} 25%,${theme.palette.divider} 50%,${theme.palette.action.hover} 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
//         @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

//         .wl-withdraw-btn { 
//   margin-top: 14px; 
//   width: 100%; 
//   height: 40px; 
//   background: linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%);
//   color: #000; 
//   border: none; 
//   border-radius: 10px; 
//   font-size: 0.85rem; 
//   font-weight: 700; 
//   cursor: pointer; 
//   transition: all 0.18s ease;
// }

// .wl-withdraw-btn:hover:not(:disabled) { 
//   background: linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%);
//   opacity: 0.9;
//   box-shadow: 0 4px 14px rgba(11,132,87,0.3); 
// }
//         .wl-withdraw-btn:active:not(:disabled) { transform: scale(0.98); }
//         .wl-withdraw-btn:disabled { opacity: 0.45; cursor: not-allowed; }

//         .wl-requests-card { background: ${theme.palette.background.paper}; border-radius: 16px; border: 1px solid ${theme.palette.divider}; padding: 24px 28px; }
//         .wl-req-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
//         .wl-req-title { font-size: 1rem; font-weight: 700; color: ${theme.palette.text.primary}; }
//         .wl-req-badge { background: ${alpha(theme.palette.success.main, 0.1)}; color: ${theme.palette.success.dark}; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; }

//         .wl-table-wrap { overflow-x: auto; margin: 0 -28px; padding: 0 28px; }
//         table.wl-table { width: 100%; border-collapse: collapse; }
//         .wl-table thead tr { border-bottom: 1.5px solid ${theme.palette.divider}; }
//         .wl-table th { padding: 10px 12px; text-align: left; font-size: 0.7rem; font-weight: 700; color: ${theme.palette.text.disabled}; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
//         .wl-table td { padding: 13px 12px; border-bottom: 1px solid ${theme.palette.divider}; font-size: 0.875rem; color: ${theme.palette.text.primary}; vertical-align: middle; }
//         .wl-table tbody tr:last-child td { border-bottom: none; }
//         .wl-table tbody tr:hover { background: ${theme.palette.action.hover}; }

//         .wl-amount-cell { font-family: 'DM Mono', monospace; font-weight: 700; color: ${theme.palette.text.primary}; }
//         .wl-txn-cell { font-family: 'DM Mono', monospace; font-size: 0.78rem; color: ${theme.palette.text.primary}; background: ${theme.palette.action.hover}; padding: 3px 8px; border-radius: 6px; display: inline-block; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

//         .wl-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 20px; color: ${theme.palette.text.disabled}; }
//         .wl-empty-icon { font-size: 2.4rem; opacity: 0.4; margin-bottom: 10px; }
//         .wl-empty-text { font-size: 0.875rem; text-align: center; line-height: 1.6; }

//         .wl-spinner { width: 22px; height: 22px; border: 2.5px solid ${theme.palette.divider}; border-top-color: #0b8457; border-radius: 50%; animation: wl-spin 0.7s linear infinite; margin: 0 auto 10px; }
//         @keyframes wl-spin { to { transform: rotate(360deg); } }

//         .wl-toast { position: fixed; bottom: 28px; right: 28px; display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-radius: 12px; font-size: 0.875rem; font-weight: 500; box-shadow: 0 8px 30px rgba(0,0,0,0.15); animation: wl-slideup 0.3s ease; z-index: 9999; max-width: 320px; }
//         .wl-toast.success { background: #0b8457; color: #fff; }
//         .wl-toast.error   { background: #dc2626; color: #fff; }
//         @keyframes wl-slideup { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

//         @media (max-width: 600px) { .wl-grid { grid-template-columns: 1fr; } .wl-wrap { padding: 20px 16px; } }
//       `}</style>

//       <div className="wl-wrap">
//         <div className="wl-header">
//           <h1>Wallet</h1>
//           <p>Request and track your earnings withdrawals</p>
//         </div>

//         <div className="wl-grid">
//           {statCards.map((card, i) => (
//             <div className="wl-stat" key={i}>
//               <div className="wl-stat-accent" style={{ background: card.accent }} />
//               <div className="wl-stat-icon" style={{ background: card.iconBg }}>{card.icon}</div>
//               <div className="wl-stat-label">{card.label}</div>
//               {walletLoading
//                 ? <div className="wl-skeleton" style={{ height: 28, width: "60%", marginTop: 6, marginBottom: 6 }} />
//                 : <div className="wl-stat-value">₹{fmt(card.value)}</div>
//               }
//               <div className="wl-stat-sub">{card.sub}</div>
//               {card.action && (
//                 <button
//                   className="wl-withdraw-btn"
//                   onClick={() => setShowModal(true)}
//                   disabled={walletLoading}
//                 >
//                   Request Payout
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>

//         <div style={{
//           background: theme.palette.background.paper, borderRadius: 16, border: `1px solid ${theme.palette.divider}`,
//           padding: "18px 22px", marginBottom: 24,
//           display: "flex", alignItems: "center", gap: 16,
//           position: "relative", overflow: "hidden",
//         }}>
//           <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#3b82f6" }} />
//           <div style={{ width: 40, height: 40, borderRadius: 10, background: alpha("#3b82f6", 0.1), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>📋</div>
//           <div>
//             <div style={{ fontSize: "0.72rem", fontWeight: 700, color: theme.palette.text.disabled, textTransform: "uppercase", letterSpacing: "0.6px" }}>Total Requests</div>
//             <div style={{ fontSize: "1.5rem", fontWeight: 800, color: theme.palette.text.primary, fontFamily: "'DM Mono', monospace" }}>{history.length}</div>
//           </div>
//         </div>

//         <div className="wl-requests-card">
//           <div className="wl-req-header">
//             <div className="wl-req-title">Request History</div>
//             <span className="wl-req-badge">{history.length} requests</span>
//           </div>

//           {histLoading ? (
//             <div className="wl-empty"><div className="wl-spinner" />Loading history…</div>
//           ) : history.length === 0 ? (
//             <div className="wl-empty">
//               <div className="wl-empty-icon">📄</div>
//               <div className="wl-empty-text">No payout requests yet.<br />Click "Request Payout" above to get started.</div>
//             </div>
//           ) : (
//             <div className="wl-table-wrap">
//               <table className="wl-table">
//                 <thead>
//                   <tr>
//                     <th>#</th><th>Amount</th><th>Store</th><th>Bank Account</th>
//                     <th>Status</th><th>Transaction ID</th><th>Requested On</th><th>Processed On</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {history.map((item, i) => {
//                     const txnId = item.transaction_id || item.transactionId || null;
//                     return (
//                       <tr key={item.id}>
//                         <td style={{ color: theme.palette.text.disabled, fontSize: "0.8rem" }}>{i + 1}</td>
//                         <td><span className="wl-amount-cell">₹{Number(item.amount).toLocaleString("en-IN")}</span></td>
//                         <td style={{ fontSize: "0.82rem", color: theme.palette.text.primary }}>{item.store_name || "—"}</td>
//                         <td style={{ fontSize: "0.82rem", fontFamily: "monospace", color: theme.palette.text.primary }}>{item.bank_account || "—"}</td>
//                         <td><StatusBadge status={item.status} /></td>
//                         <td>
//                           {txnId
//                             ? <span className="wl-txn-cell" title={txnId}>{txnId}</span>
//                             : <span style={{ color: theme.palette.text.disabled, fontSize: "0.8rem" }}>—</span>
//                           }
//                         </td>
//                         <td style={{ fontSize: "0.82rem", color: theme.palette.text.secondary }}>{formatDate(item.createdAt || item.created_at)}</td>
//                         <td style={{ fontSize: "0.82rem", color: theme.palette.text.secondary }}>
//                           {item.status === "pending"
//                             ? <span style={{ color: theme.palette.text.disabled }}>—</span>
//                             : formatDate(item.processedAt || item.processed_at)
//                           }
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {showModal && (
//         <WithdrawModal
//           wallet={{ ...wallet, available_balance: avail }}
//           onClose={() => setShowModal(false)}
//           onSubmit={handleWithdraw}
//           loading={submitting}
//         />
//       )}

//       {toast && (
//         <div className={`wl-toast ${toast.type}`}>
//           {toast.type === "success" ? "✓" : "✕"} {toast.msg}
//         </div>
//       )}
//     </>
//   );
// }

import { useState, useEffect, useCallback } from "react";
import { useTheme, alpha } from "@mui/material";
import { useDispatch } from "react-redux";
import { showToast } from "../../features/ui/uiSlice";
import api from "../../services/api";
import { Box } from "@mui/material";

const BASE = "/payout-requests";

function StatusBadge({ status }) {
  const theme = useTheme();
  const key = (status || "pending").toLowerCase();

  const styles = {
    pending: { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark, dot: theme.palette.warning.main },
    completed: { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, dot: theme.palette.success.main },
    rejected: { bg: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark, dot: theme.palette.error.main },
  };

  const s = styles[key] || styles.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.bg, color: s.color,
      padding: "4px 12px", borderRadius: 20,
      fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize",
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {key}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmt(n) {
  return Number(n ?? 0).toLocaleString("en-IN");
}

function TransactionsModal({ onClose, payoutRequests = [] }) {
  const theme = useTheme();
  const [txns, setTxns] = useState([]);
  const [txnsLoading, setTxnsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [displayLimit, setDisplayLimit] = useState(50);

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await api.get('/wallet/transactions');
        let fetchedTxns = res.data?.data?.transactions || res.data?.data || [];
        
        fetchedTxns = fetchedTxns.filter(t => t.reference_type !== 'payout');

        const formattedPayouts = payoutRequests.map(req => {
          const formattedStatus = req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Pending';
          return {
            id: `payout-${req.id}`,
            type: 'debit',
            amount: req.amount,
            description: `Payout request made by seller (${formattedStatus})`,
            createdAt: req.createdAt || req.created_at,
            isPayout: true,
          };
        });

        const combined = [...fetchedTxns, ...formattedPayouts].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || 0);
          const dateB = new Date(b.createdAt || b.created_at || 0);
          return dateB - dateA;
        });

        setTxns(combined);
      } catch (err) {
        console.error("Failed to load transactions", err);
      } finally {
        setTxnsLoading(false);
      }
    };
    fetchTxns();
  }, [payoutRequests]);

  const filteredTxns = txns.filter(t => {
    if (filter === 'All') return true;
    if (filter === 'Credits') return t.type === 'credit';
    if (filter === 'Debits') return t.type === 'debit' && !t.isPayout;
    if (filter === 'Payouts') return t.type === 'debit' && t.isPayout;
    return true;
  });

  const displayedTxns = filteredTxns.slice(0, displayLimit);

  const orderGroups = {};
  const otherTxns = [];

  displayedTxns.forEach(t => {
    if (t.order_number) {
      if (!orderGroups[t.order_number]) {
        orderGroups[t.order_number] = [];
      }
      orderGroups[t.order_number].push(t);
    } else {
      otherTxns.push(t);
    }
  });

  const otherTxnsGroups = {};
  otherTxns.forEach(t => {
    const dStr = formatDate(t.createdAt || t.created_at);
    if (!otherTxnsGroups[dStr]) otherTxnsGroups[dStr] = [];
    otherTxnsGroups[dStr].push(t);
  });

  const handleExportCSV = () => {
    const headers = ["Order Number", "Date", "Type", "Amount", "Description"];
    const rows = filteredTxns.map(t => {
      const orderNum = t.order_number ? `#${t.order_number}` : "-";
      const date = formatDate(t.createdAt || t.created_at);
      const amountStr = (t.type === 'credit' ? '+' : '-') + Number(t.amount).toString();
      const desc = `"${(t.description || "—").replace(/"/g, '""')}"`;
      return [orderNum, date, t.type.toUpperCase(), amountStr, desc].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wallet_transactions_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: theme.palette.background.paper, zIndex: 9999 }}
    >
      <div style={{
        width: "100%", height: "100%", background: theme.palette.background.paper, borderRadius: 0, padding: "32px 5%",
        animation: "wm-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        display: "flex", flexDirection: "column", boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: theme.palette.text.primary }}>Wallet Transactions</h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: theme.palette.text.secondary }}>All credits, debits & penalties grouped by Order</p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {['All', 'Credits', 'Debits', 'Payouts'].map(f => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setDisplayLimit(50); }}
                  style={{
                    padding: "4px 14px", borderRadius: 16, border: `1px solid ${filter === f ? "#0b8457" : theme.palette.divider}`,
                    background: filter === f ? alpha("#0b8457", 0.1) : "transparent",
                    color: filter === f ? "#0b8457" : theme.palette.text.secondary,
                    fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={handleExportCSV} style={{
              height: 36, padding: "0 16px", borderRadius: 18, border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.default, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.text.primary,
              transition: "background 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = alpha(theme.palette.divider, 0.1)}
            onMouseLeave={e => e.currentTarget.style.background = theme.palette.background.default}
            >
              📥 Export CSV
            </button>
            <button onClick={onClose} style={{
              width: 36, height: 36, borderRadius: "50%", border: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.default, cursor: "pointer", fontSize: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.text.secondary,
            }}>✕</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8, display: "flex", flexDirection: "column", gap: 16 }}>
          {txnsLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: theme.palette.text.secondary }}>
              <div style={{ width: 28, height: 28, border: "3px solid rgba(11,132,87,0.2)", borderTopColor: "#0b8457", borderRadius: "50%", animation: "wm-spin 0.7s linear infinite", margin: "0 auto 12px" }} />
              Loading transactions...
            </div>
          ) : txns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: theme.palette.text.secondary }}>
              No wallet transactions found.
            </div>
          ) : (
            <>
              {Object.keys(orderGroups).map(orderNum => {
                const group = orderGroups[orderNum];
                const dateStr = formatDate(group[0]?.createdAt || group[0]?.created_at);
                
                return (
                  <div key={orderNum} style={{
                    border: `1px solid ${theme.palette.divider}`, borderRadius: 16,
                    background: theme.palette.background.default, overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: "12px 18px", borderBottom: `1px solid ${theme.palette.divider}`,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: theme.palette.background.paper, backdropFilter: "blur(12px)",
                      position: "sticky", top: 0, zIndex: 10
                    }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: theme.palette.text.primary }}>
                        📦 Order #{orderNum}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: theme.palette.text.secondary, fontWeight: 500 }}>
                        {dateStr}
                      </div>
                    </div>
                    <div>
                      {group.map((t, idx) => (
                        <div key={t.id} style={{
                          padding: "14px 18px",
                          borderBottom: idx < group.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          <div style={{ flex: 1, paddingRight: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                              <span style={{
                                fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 10,
                                background: t.type === 'credit' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                color: t.type === 'credit' ? theme.palette.success.dark : theme.palette.error.dark,
                                textTransform: "uppercase"
                              }}>
                                {t.type}
                              </span>
                              <span style={{ fontSize: "0.9rem", color: theme.palette.text.primary, fontWeight: 600 }}>
                                {t.description || "—"}
                              </span>
                            </div>
                          </div>
                          <div style={{
                            fontSize: "1.1rem", fontWeight: 800, fontFamily: "'DM Mono', monospace",
                            color: t.type === 'credit' ? theme.palette.success.main : theme.palette.error.main,
                            whiteSpace: "nowrap"
                          }}>
                            {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {Object.keys(otherTxnsGroups).map(dateStr => {
                const group = otherTxnsGroups[dateStr];
                return (
                  <div key={dateStr} style={{
                    border: `1px solid ${theme.palette.divider}`, borderRadius: 16,
                    background: theme.palette.background.default, overflow: 'hidden',
                    marginTop: 8
                  }}>
                    <div style={{
                      padding: "12px 18px", borderBottom: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.background.paper, backdropFilter: "blur(12px)",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      position: "sticky", top: 0, zIndex: 10
                    }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: theme.palette.text.primary }}>
                        📋 Other Transactions
                      </div>
                      <div style={{ fontSize: "0.8rem", color: theme.palette.text.secondary, fontWeight: 500 }}>
                        {dateStr}
                      </div>
                    </div>
                    <div>
                      {group.map((t, idx) => (
                        <div key={t.id} style={{
                          padding: "14px 18px",
                          borderBottom: idx < group.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          <div style={{ flex: 1, paddingRight: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                              <span style={{
                                fontSize: "0.7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 10,
                                background: t.type === 'credit' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                color: t.type === 'credit' ? theme.palette.success.dark : theme.palette.error.dark,
                                textTransform: "uppercase"
                              }}>
                                {t.type}
                              </span>
                              <span style={{ fontSize: "0.9rem", color: theme.palette.text.primary, fontWeight: 600 }}>
                                {t.description || "—"}
                              </span>
                            </div>
                          </div>
                          <div style={{
                            fontSize: "1.1rem", fontWeight: 800, fontFamily: "'DM Mono', monospace",
                            color: t.type === 'credit' ? theme.palette.success.main : theme.palette.error.main,
                            whiteSpace: "nowrap"
                          }}>
                            {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {displayLimit < filteredTxns.length && (
                <div style={{ textAlign: "center", marginTop: 24, marginBottom: 32 }}>
                  <button onClick={() => setDisplayLimit(l => l + 50)} style={{
                    padding: "10px 28px", borderRadius: 24, border: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.background.default, cursor: "pointer", fontSize: "0.85rem", fontWeight: 700,
                    color: theme.palette.text.primary, transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = alpha(theme.palette.divider, 0.1); e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = theme.palette.background.default; e.currentTarget.style.transform = "none"; }}
                  >
                    Load More Transactions ({filteredTxns.length - displayLimit} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WithdrawModal({ wallet, onClose, onSubmit, loading, onViewTransactions }) {
  const theme = useTheme();
  const [amount, setAmount] = useState("");
  const [bankAcc, setBankAcc] = useState(wallet?.accountNumber || "");
  const [storeName, setStoreName] = useState(wallet?.storeName || "");
  const [error, setError] = useState("");

  const available = Number(wallet?.available_balance ?? 0);

  const handleConfirm = () => {
    setError("");
    const num = available;
    if (available <= 0) { setError("You have no available balance to withdraw."); return; }
    if (!storeName.trim()) { setError("Please enter your store name"); return; }
    if (!bankAcc.trim()) { setError("Please enter your bank account number"); return; }
    onSubmit({ amount: String(num), bank_account: bankAcc.trim(), store_name: storeName.trim() });
  };

  const inputStyle = {
    width: "100%", height: 46, padding: "0 14px",
    border: `1.5px solid ${theme.palette.divider}`, borderRadius: 12,
    fontSize: "0.875rem", color: theme.palette.text.primary, outline: "none",
    boxSizing: "border-box", background: theme.palette.background.paper,
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  };

  const focus = e => { e.target.style.borderColor = "#0b8457"; e.target.style.boxShadow = "0 0 0 3px rgba(11,132,87,0.1)"; };
  const blur = e => { e.target.style.borderColor = theme.palette.divider; e.target.style.boxShadow = "none"; };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: 460, background: theme.palette.background.paper, borderRadius: 20, padding: 28,
        boxShadow: theme.shadows[10],
        border: `1px solid ${theme.palette.divider}`,
        animation: "wm-in 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <style>{`
          @keyframes wm-in  { from{opacity:0;transform:scale(0.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
          @keyframes wm-spin { to { transform: rotate(360deg); } }
        `}</style>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: theme.palette.text.primary }}>💸 Request Payout</h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: theme.palette.text.secondary }}>Submit a withdrawal request to the admin</p>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", border: `1.5px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper, cursor: "pointer", fontSize: "0.9rem",
            display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.text.secondary,
          }}>✕</button>
        </div>

        <div style={{
          background: "linear-gradient(135deg, #0b8457 0%, #059669 100%)",
          borderRadius: 14, padding: "14px 18px", marginBottom: 22, color: "#fff",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 3 }}>
              Available Balance
            </div>
            <div style={{ fontSize: "1.7rem", fontWeight: 800, fontFamily: "'DM Mono', monospace", letterSpacing: "-0.5px" }}>
              ₹{available.toLocaleString("en-IN")}
            </div>
          </div>
          <div style={{ fontSize: "2rem", opacity: 0.7 }}>🏦</div>
        </div>

        <div style={{ textAlign: "right", marginBottom: 16, marginTop: -14 }}>
          <button
            onClick={onViewTransactions}
            style={{
              background: "none", border: "none", color: "#0b8457",
              fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
              padding: "4px 8px", textDecoration: "underline"
            }}
          >
            View All Transactions →
          </button>
        </div>

        <div style={{
          background: alpha(theme.palette.info.main, 0.1), border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`, borderRadius: 10,
          padding: "10px 14px", marginBottom: 18, fontSize: "0.78rem", color: theme.palette.info.dark, display: "flex", gap: 8
        }}>
          <span>💡</span>
          <span>You are requesting a payout for your entire available balance. Partial withdrawals are not supported.</span>
        </div>

        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: theme.palette.text.primary, display: "block", marginBottom: 6 }}>Store Name *</label>
        <input
          type="text" placeholder="Your store name" value={storeName}
          onChange={e => setStoreName(e.target.value)}
          onFocus={focus} onBlur={blur}
          style={{ ...inputStyle, marginBottom: 16 }}
        />

        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: theme.palette.text.primary, display: "block", marginBottom: 6 }}>Bank Account Number *</label>
        <input
          type="text" placeholder="e.g. 1234567890" value={bankAcc}
          onChange={e => setBankAcc(e.target.value)}
          onFocus={focus} onBlur={blur}
          style={{ ...inputStyle, marginBottom: 16, fontFamily: "'DM Mono', monospace" }}
        />

        <div style={{
          background: alpha(theme.palette.success.main, 0.1), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`, borderRadius: 10,
          padding: "10px 14px", marginBottom: 16, fontSize: "0.78rem", color: theme.palette.success.dark,
          display: "flex", gap: 8,
        }}>
          <span>ℹ️</span>
          <span>Your request will be reviewed by the admin within 1–3 business days. Make sure your bank details are correct.</span>
        </div>

        {error && (
          <div style={{
            background: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 10,
            padding: "9px 14px", marginBottom: 14, fontSize: "0.78rem", color: theme.palette.error.dark,
          }}>
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={loading}
          style={{
            width: "100%", height: 48,
            background: loading ? theme.palette.action.disabledBackground : "linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)",
            color: "#000", border: "none", borderRadius: 12,
            fontSize: "0.9rem", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "opacity 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 4px 14px rgba(15,185,177,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          {loading ? (
            <>
              <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "wm-spin 0.7s linear infinite", display: "inline-block" }} />
              Submitting…
            </>
          ) : "Send Payout Request to Admin"}
        </button>
      </div>
    </div>
  );
}


export default function Wallet() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchWallet = useCallback(async () => {
    setWalletLoading(true);
    try {
      const res = await api.get(`${BASE}/wallet`);

      let storeName = "";
      let accountNumber = "";
      try {
        const sellerUser = JSON.parse(localStorage.getItem("sellerUser") || "{}");
        const sellerId = sellerUser?.id;
        if (sellerId) {
          const sellerRes = await api.get(`/seller/${sellerId}`);
          storeName = sellerRes.data?.data?.storeName || sellerRes.data?.data?.name || "";
          accountNumber = sellerRes.data?.data?.accountNumber || "";
        }
      } catch (e) {
        console.error("Failed to load seller details:", e);
      }

      setWallet({
        ...res.data.data,
        settlement_in_progress: res.data.data?.settlement_in_progress ?? res.data.data?.settlement_balance,
        storeName,
        accountNumber,
      });
    } catch {
      dispatch(showToast({ message: "Failed to load wallet data", severity: "error" }));
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const res = await api.get(`${BASE}/my`);
      const rows = (res.data.data || []).map(r => ({
        ...r,
        status: (r.status || "pending").toLowerCase(),
      }));
      setHistory(rows);
    } catch {
      dispatch(showToast({ message: "Failed to load history", severity: "error" }));
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchHistory();
  }, [fetchWallet, fetchHistory]);

  const handleWithdraw = async ({ amount, bank_account, store_name }) => {
    setSubmitting(true);
    try {
      await api.post(BASE, { amount, bank_account, store_name });
      dispatch(showToast({ message: "Payout request sent to admin successfully!", severity: "success" }));
      setShowModal(false);
      await Promise.all([fetchWallet(), fetchHistory()]);
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.message || "Request failed", severity: "error" }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const res = await api.get(`${BASE}/${id}/invoice`);
      if (res.data && res.data.url) {
        // Fetch the PDF as a blob and trigger a real file save (same as the
        // order invoice's jsPDF doc.save()) instead of opening it in a new tab.
        const fileRes = await fetch(res.data.url, { credentials: "include" });
        if (!fileRes.ok) throw new Error("Invoice fetch failed");
        const blob = await fileRes.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `Payout-Invoice-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      dispatch(showToast({ message: "Failed to download invoice", severity: "error" }));
    }
  };

  const avail = Number(wallet?.available_balance ?? 0);

  const statCards = [
    { label: "Total Earnings", value: wallet?.total_earnings, sub: "All-time earnings", icon: "💼", iconBg: alpha("#9333ea", 0.1), accent: "#9333ea" },
    { label: "Available to Withdraw", value: avail, sub: "Ready for payout", icon: "📈", iconBg: alpha("#16a34a", 0.1), accent: "#16a34a", action: true },
    { label: "Settlement in Progress", value: wallet?.settlement_in_progress, sub: "Will be released soon", icon: "⏱️", iconBg: alpha("#3b82f6", 0.1), accent: "#3b82f6" },
    { label: "Pending Orders Value", value: wallet?.pending_orders_value, sub: "Not delivered yet", icon: "📦", iconBg: alpha("#f59e0b", 0.1), accent: "#f59e0b" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .wl-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
        .wl-wrap { min-height: 100vh; background: ${theme.palette.background.default}; padding: 36px 32px; }

        .wl-header { margin-bottom: 28px; }
        .wl-header h1 { font-size: 1.6rem; font-weight: 700; color: ${theme.palette.text.primary}; margin: 0 0 4px; letter-spacing: -0.3px; }
        .wl-header p  { font-size: 0.875rem; color: ${theme.palette.text.secondary}; margin: 0; }

        .wl-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }

        .wl-stat { background: ${theme.palette.background.paper}; border-radius: 16px; border: 1px solid ${theme.palette.divider}; padding: 22px; position: relative; overflow: hidden; transition: box-shadow 0.2s; }
        .wl-stat:hover { box-shadow: ${theme.shadows[4]}; }
        .wl-stat-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
        .wl-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 12px; }
        .wl-stat-label { font-size: 0.72rem; font-weight: 700; color: ${theme.palette.text.disabled}; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; }
        .wl-stat-value { font-size: 1.5rem; font-weight: 800; color: ${theme.palette.text.primary}; font-family: 'DM Mono', monospace; letter-spacing: -0.5px; }
        .wl-stat-sub { font-size: 0.78rem; color: ${theme.palette.text.secondary}; margin-top: 3px; }

        .wl-skeleton { background: linear-gradient(90deg,${theme.palette.action.hover} 25%,${theme.palette.divider} 50%,${theme.palette.action.hover} 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .wl-withdraw-btn { 
          margin-top: 14px; 
          width: 100%; 
          height: 40px; 
          background: linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%);
          color: #000; 
          border: none; 
          border-radius: 10px; 
          font-size: 0.85rem; 
          font-weight: 700; 
          cursor: pointer; 
          transition: all 0.18s ease;
        }

        .wl-withdraw-btn:hover:not(:disabled) { 
          background: linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%);
          opacity: 0.9;
          box-shadow: 0 4px 14px rgba(11,132,87,0.3); 
        }
        .wl-withdraw-btn:active:not(:disabled) { transform: scale(0.98); }
        .wl-withdraw-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .wl-requests-card { background: ${theme.palette.background.paper}; border-radius: 16px; border: 1px solid ${theme.palette.divider}; padding: 24px 28px; }
        .wl-req-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .wl-req-title { font-size: 1rem; font-weight: 700; color: ${theme.palette.text.primary}; }
        .wl-req-badge { background: ${alpha(theme.palette.success.main, 0.1)}; color: ${theme.palette.success.dark}; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; }

        .wl-table-wrap { overflow-x: auto; margin: 0 -28px; padding: 0 28px; }
        table.wl-table { width: 100%; border-collapse: collapse; }
        .wl-table thead tr { border-bottom: 1.5px solid ${theme.palette.divider}; }
        .wl-table th { padding: 10px 12px; text-align: left; font-size: 0.7rem; font-weight: 700; color: ${theme.palette.text.disabled}; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
        .wl-table td { padding: 13px 12px; border-bottom: 1px solid ${theme.palette.divider}; font-size: 0.875rem; color: ${theme.palette.text.primary}; vertical-align: middle; }
        .wl-table tbody tr:last-child td { border-bottom: none; }
        .wl-table tbody tr:hover { background: ${theme.palette.action.hover}; }

        .wl-amount-cell { font-family: 'DM Mono', monospace; font-weight: 700; color: ${theme.palette.text.primary}; }
        .wl-txn-cell { font-family: 'DM Mono', monospace; font-size: 0.78rem; color: ${theme.palette.text.primary}; background: ${theme.palette.action.hover}; padding: 3px 8px; border-radius: 6px; display: inline-block; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .wl-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 20px; color: ${theme.palette.text.disabled}; }
        .wl-empty-icon { font-size: 2.4rem; opacity: 0.4; margin-bottom: 10px; }
        .wl-empty-text { font-size: 0.875rem; text-align: center; line-height: 1.6; }

        .wl-spinner { width: 22px; height: 22px; border: 2.5px solid ${theme.palette.divider}; border-top-color: #0b8457; border-radius: 50%; animation: wl-spin 0.7s linear infinite; margin: 0 auto 10px; }
        @keyframes wl-spin { to { transform: rotate(360deg); } }

        @media (max-width: 600px) { .wl-grid { grid-template-columns: 1fr; } .wl-wrap { padding: 20px 16px; } }
      `}</style>

      <div className="wl-wrap">
        <div className="wl-header">
          <h1>Wallet</h1>
          <p>Request and track your earnings withdrawals</p>
        </div>

        {wallet && Number(wallet?.available_balance || 0) < 0 && (
          <div style={{
            background: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, borderRadius: 12,
            padding: "16px 20px", marginBottom: 24, fontSize: "0.9rem", color: theme.palette.error.dark, display: "flex", alignItems: "center", gap: 12
          }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span>
            <span>
              Your wallet has a debt of <strong>₹{Math.abs(Number(wallet?.available_balance)).toLocaleString("en-IN")}</strong>.
              This will be deducted from your next settlement.
            </span>
          </div>
        )}

        <div className="wl-grid">
          {statCards.map((card, i) => (
            <div className="wl-stat" key={i}>
              <div className="wl-stat-accent" style={{ background: card.accent }} />
              <div className="wl-stat-icon" style={{ background: card.iconBg }}>{card.icon}</div>
              <div className="wl-stat-label">{card.label}</div>
              {walletLoading
                ? <div className="wl-skeleton" style={{ height: 28, width: "60%", marginTop: 6, marginBottom: 6 }} />
                : <div className="wl-stat-value" style={{ color: card.value < 0 ? '#ef4444' : 'inherit' }}>
                    {card.value < 0 ? '-' : ''}₹{fmt(Math.abs(card.value))}
                  </div>
              }
              <div className="wl-stat-sub">{card.sub}</div>
              {card.action && (
                <>
                  <button
                    className="wl-withdraw-btn"
                    onClick={() => setShowModal(true)}
                    disabled={walletLoading || avail < 0}
                  >
                    {avail < 0 ? 'Wallet in Debt' : 'Request Payout'}
                  </button>
                  <button
                    onClick={() => setShowTxnModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0b8457',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: 8,
                      padding: '2px 0',
                      textDecoration: 'underline',
                      width: '100%',
                      textAlign: 'center',
                      letterSpacing: '0.2px',
                    }}
                  >
                    View All Transactions →
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div style={{
          background: theme.palette.background.paper, borderRadius: 16, border: `1px solid ${theme.palette.divider}`,
          padding: "18px 22px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 16,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#3b82f6" }} />
          <div style={{ width: 40, height: 40, borderRadius: 10, background: alpha("#3b82f6", 0.1), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>📋</div>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: theme.palette.text.disabled, textTransform: "uppercase", letterSpacing: "0.6px" }}>Total Requests</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: theme.palette.text.primary, fontFamily: "'DM Mono', monospace" }}>{history.length}</div>
          </div>
        </div>

        <div className="wl-requests-card">
          <div className="wl-req-header">
            <div className="wl-req-title">Request History</div>
            <span className="wl-req-badge">{history.length} requests</span>
          </div>

          {histLoading ? (
            <div className="wl-empty"><div className="wl-spinner" />Loading history…</div>
          ) : history.length === 0 ? (
            <div className="wl-empty">
              <div className="wl-empty-icon">📄</div>
              <div className="wl-empty-text">No payout requests yet.<br />Click "Request Payout" above to get started.</div>
            </div>
          ) : (
            <div className="wl-table-wrap">
              <table className="wl-table">
                <thead>
                  <tr>
                    <th>#</th><th>Amount</th><th>Store</th><th>Bank Account</th>
                    <th>Status</th><th>Transaction ID</th><th>Requested On</th><th>Processed On</th><th>Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, i) => {
                    const txnId = item.transaction_id || item.transactionId || null;
                    return (
                      <tr key={item.id}>
                        <td style={{ color: theme.palette.text.disabled, fontSize: "0.8rem" }}>{i + 1}</td>
                        <td><span className="wl-amount-cell">₹{Number(item.amount).toLocaleString("en-IN")}</span></td>
                        <td style={{ fontSize: "0.82rem", color: theme.palette.text.primary }}>{item.store_name || "—"}</td>
                        <td style={{ fontSize: "0.82rem", fontFamily: "monospace", color: theme.palette.text.primary }}>{item.bank_account || "—"}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>
                          {txnId
                            ? <span className="wl-txn-cell" title={txnId}>{txnId}</span>
                            : <span style={{ color: theme.palette.text.disabled, fontSize: "0.8rem" }}>—</span>
                          }
                        </td>
                        <td style={{ fontSize: "0.82rem", color: theme.palette.text.secondary }}>{formatDate(item.createdAt || item.created_at)}</td>
                        <td style={{ fontSize: "0.82rem", color: theme.palette.text.secondary }}>
                          {item.status === "pending"
                            ? <span style={{ color: theme.palette.text.disabled }}>—</span>
                            : formatDate(item.processedAt || item.processed_at)
                          }
                        </td>
                        <td>
                          <button
                            onClick={() => handleDownloadInvoice(item.id)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 4,
                              border: `1px solid ${theme.palette.divider}`,
                              background: theme.palette.background.default,
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              color: theme.palette.text.primary,
                            }}
                          >
                            ⬇️ Download
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <WithdrawModal
          wallet={{ ...wallet, available_balance: avail }}
          onClose={() => setShowModal(false)}
          onSubmit={handleWithdraw}
          loading={submitting}
          onViewTransactions={() => {
            setShowModal(false);
            setShowTxnModal(true);
          }}
        />
      )}

      {showTxnModal && (
        <TransactionsModal onClose={() => setShowTxnModal(false)} payoutRequests={history} />
      )}
    </>
  );
}