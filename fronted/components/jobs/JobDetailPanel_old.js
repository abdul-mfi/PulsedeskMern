// function JobDetailPanel({ job, onClose }) {
//   const dispatch = useDispatch();
//   const { user } = useSelector(s => s.auth);
//   const [comment, setComment] = useState('');
//   const [progress, setProgress] = useState(job?.progress || 0);
//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => { if (job) setProgress(job.progress); }, [job]);

//   if (!job) return null;
//   const cfg = getStatusConfig(job.status);
//   const days = getDaysLeft(job.due_date);

//   const action = async (fn, msg) => {
//     setSubmitting(true);
//     try { await fn(); dispatch(showToast({ message: msg, type: 'success' })); }
//     catch (e) { dispatch(showToast({ message: 'Action failed', type: 'error' })); }
//     finally { setSubmitting(false); }
//   };

//   const saveProgress = () => action(()=>dispatch(updateJob({ id:job.id, progress })).unwrap(), 'Progress updated');
//   const doAccept  = () => action(()=>dispatch(acceptJob(job.id)).unwrap(), 'Job accepted — clock started!');
//   const doComplete= () => action(()=>dispatch(completeJob(job.id)).unwrap(), 'Submitted for review');
//   const postComment = async () => {
//     if (!comment.trim()) return;
//     await API.post(`/jobs/${job.id}/comments`, { content: comment });
//     setComment('');
//     dispatch(showToast({ message: 'Comment added', type: 'success' }));
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex justify-end" onClick={e=>e.target===e.currentTarget&&onClose()}>
//       <div className="bg-white w-[520px] h-full shadow-2xl border-l border-gray-100 flex flex-col overflow-hidden">
//         {/* Header */}
//         <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
//           <div>
//             <div className="font-semibold text-gray-900 leading-snug">{job.title}</div>
//             <div className="text-xs text-gray-400 mt-0.5">{job.client_name} · {job.type?.replace(/_/g,' ')}</div>
//           </div>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">×</button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-5">
//           {/* Countdown ring + status */}
//           <div className="flex items-center gap-5 bg-gray-50 rounded-xl p-4 mb-5">
//             <RingProgress percent={job.progress} color={cfg.color} size={72} strokeWidth={5} label={`${job.progress}%`} />
//             <div>
//               <StatusPill status={job.status} />
//               <div className="text-2xl font-bold font-mono mt-2" style={{ color: days < 0 ? '#DC2626' : days <= 2 ? '#CA8A04' : '#0F1117' }}>
//                 {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days} days left`}
//               </div>
//               <div className="text-xs text-gray-400">Due {fmtDate(job.due_date)}</div>
//             </div>
//           </div>

//           {/* Progress slider */}
//           {(user?.role === 'EMPLOYEE' || user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
//             <div className="mb-5">
//               <label className="label">Update Progress</label>
//               <div className="flex items-center gap-3">
//                 <input type="range" min={0} max={100} step={5} value={progress} onChange={e=>setProgress(parseInt(e.target.value))} className="flex-1 accent-brand" />
//                 <span className="text-sm font-mono font-semibold w-10 text-right">{progress}%</span>
//                 <Button size="sm" onClick={saveProgress} disabled={submitting}>Save</Button>
//               </div>
//             </div>
//           )}

//           {/* Milestones */}
//           {job.milestones?.length > 0 && (
//             <div className="mb-5">
//               <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Milestones</div>
//               <div className="flex flex-wrap gap-2">
//                 {job.milestones.map((m, i) => (
//                   <span key={m.id || i} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${m.status==='DONE'?'bg-green-50 text-green-700 border-green-200':m.status==='IN_PROGRESS'?'bg-blue-50 text-blue-700 border-blue-200':'bg-gray-50 text-gray-500 border-gray-200'}`}>{m.title}</span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Assignee */}
//           <div className="mb-5 grid grid-cols-2 gap-3">
//             <div>
//               <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Assigned to</div>
//               <div className="flex items-center gap-2">
//                 <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: job.assignee_color }}>{job.assignee_initials}</div>
//                 <span className="text-sm font-medium">{job.assignee_name}</span>
//               </div>
//             </div>
//             <div>
//               <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Scope</div>
//               <div className="text-sm font-mono font-semibold">{job.scope_hours}h · {job.working_days} days</div>
//             </div>
//           </div>

//           {/* Action buttons */}
//           <div className="flex flex-wrap gap-2 mb-5">
//             {job.status === 'PENDING' && user?.id === job.assignee_id && (
//               <><Button onClick={doAccept} disabled={submitting}>✓ Accept Job</Button><Button variant="ghost" onClick={()=>dispatch(rejectJob({id:job.id,reason:'Scope mismatch'}))}>Reject</Button></>
//             )}
//             {['ACTIVE','AT_RISK','OVERDUE'].includes(job.status) && (
//               <Button onClick={doComplete} disabled={submitting}>Mark Complete</Button>
//             )}
//           </div>

//           {/* Comment box */}
//           <div className="mb-5">
//             <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Add Comment</div>
//             <div className="flex gap-2">
//               <input className="input flex-1" placeholder="Type a comment…" value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>e.key==='Enter'&&postComment()} />
//               <Button size="sm" onClick={postComment}>Post</Button>
//             </div>
//           </div>

//           {/* Comments */}
//           {job.comments?.length > 0 && (
//             <div>
//               <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Comments</div>
//               <div className="flex flex-col gap-3">
//                 {job.comments.map(c => (
//                   <div key={c.id} className="flex gap-2.5">
//                     <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: c.user_color || '#4F46E5' }}>{c.user_initials}</div>
//                     <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
//                       <div className="text-xs font-medium text-gray-700">{c.user_name}</div>
//                       <div className="text-xs text-gray-600 mt-0.5">{c.content}</div>
//                       <div className="text-[10px] text-gray-400 mt-1">{fmtDate(c.created_at, { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }