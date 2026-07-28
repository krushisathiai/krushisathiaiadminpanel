import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, X, CheckCircle, Clock, Filter, Square, ChevronDown, CheckSquare, Trash2 } from 'lucide-react';
import { getExpertQuestions, answerQuestion, deleteExpertQuestion } from '../api/adminApi';
import { useToast } from '../context/ToastContext';

export default function ExpertQuestions() {
  const [questions, setQuestions] = useState([]);
  const [pg, setPg] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchQs = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getExpertQuestions({ page, limit: 10, status });
      if (r.data.success) { setQuestions(r.data.questions); setPg(r.data.pagination); }
    } catch { addToast('Failed to load questions', 'err'); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchQs(); }, [fetchQs]);

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSaving(true);
    try {
      await answerQuestion(selected.id, { answer, answered_by: 'Admin' });
      addToast('Question answered!', 'ok');
      setSelected(null);
      setAnswer('');
      fetchQs();
    } catch (e) { addToast(e.response?.data?.message || 'Failed', 'err'); }
    finally { setSaving(false); }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await deleteExpertQuestion(id);
      if (res.data.success) {
        addToast('Question deleted successfully', 'ok');
        if (selected?.id === id) setSelected(null);
        fetchQs();
      }
    } catch (e) {
      addToast('Failed to delete question', 'err');
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const avatarColors = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'];

  return (
    <>
      <div className="responsive-page-head">
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Expert Q&A</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>{pg.total_questions || 0} total questions</p>
        </div>
      </div>

      <div className={`responsive-expert-grid ${selected ? 'selected' : 'unselected'}`}>
        {/* Table */}
        <div className="card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          
          <div className="tbl-toolbar" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: '#fff' }}>
            <div style={{ flex: 1, color: '#111827', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#059669" /> Farmer Questions
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setStatus(''); setPage(1); }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', background: status === '' ? '#f3f4f6' : '#fff', color: '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Filter size={14} /> All
              </button>
              <button
                onClick={() => { setStatus('pending'); setPage(1); }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #fde68a', background: status === 'pending' ? '#fffbeb' : '#fff', color: status === 'pending' ? '#d97706' : '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Clock size={14} /> Pending
              </button>
              <button
                onClick={() => { setStatus('answered'); setPage(1); }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #a7f3d0', background: status === 'answered' ? '#ecfdf5' : '#fff', color: status === 'answered' ? '#059669' : '#374151', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle size={14} /> Answered
              </button>
            </div>
          </div>

          {loading ? (
            <div className="spin-wrap" style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : questions.length === 0 ? (
            <div className="empty" style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <h3>No Questions</h3>
              <p>{status === 'pending' ? 'No pending questions' : status === 'answered' ? 'All answered!' : 'No questions yet'}</p>
            </div>
          ) : (
            <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                    <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                    <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px' }}>#</th>
                    <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>FARMER</th>
                    <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>QUESTION</th>
                    <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>STATUS</th>
                    <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>ASKED</th>
                    <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => {
                    const num = (page - 1) * 10 + i + 1;
                    const initials = q.user_name?.substring(0,1).toUpperCase() || 'U';
                    const avatarColor = avatarColors[i % avatarColors.length];
                    const isSelected = selected?.id === q.id;
                    
                    return (
                      <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6', background: isSelected ? '#f8fafc' : '#fff', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setSelected(q)} onMouseEnter={e => !isSelected && (e.currentTarget.style.background = '#f9fafb')} onMouseLeave={e => !isSelected && (e.currentTarget.style.background = '#fff')}>
                        <td style={{ padding: '16px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                        <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>{num}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px' }}>
                              {initials}
                            </div>
                            <div style={{ color: '#111827', fontWeight: 500, fontSize: '14px' }}>{q.user_name || 'Unknown'}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: '#4b5563', fontSize: '13px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.question}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {!q.answer ? (
                            <span style={{ color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Pending</span>
                          ) : (
                            <span style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Answered</span>
                          )}
                        </td>
                        <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px' }}>{fmtDate(q.created_at)}</td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <button style={{ padding: '6px 12px', background: isSelected ? '#3b82f6' : '#f3f4f6', color: isSelected ? '#fff' : '#374151', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                              {q.answer ? 'View' : 'Reply'}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                              style={{ padding: '6px 8px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                              title="Delete Question"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && questions.length > 0 && pg.total_pages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #e5e7eb', background: '#fff', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ color: '#6b7280', fontSize: '14px' }}>
                Page {pg.current_page} of {pg.total_pages}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '6px', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>{'<'}</button>
                <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#059669', color: '#fff', borderRadius: '6px', fontWeight: 500 }}>{page}</button>
                <button onClick={() => setPage(p => Math.min(pg.total_pages, p + 1))} disabled={page === pg.total_pages} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '6px', color: page === pg.total_pages ? '#d1d5db' : '#374151', cursor: page === pg.total_pages ? 'not-allowed' : 'pointer' }}>{'>'}</button>
              </div>
            </div>
          )}
        </div>

        {/* Reply Panel */}
        {selected && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden', position: 'sticky', top: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: '15px' }}>{selected.answer ? 'View Answer' : 'Reply to Farmer'}</div>
              <button onClick={() => { setSelected(null); setAnswer(''); }} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {selected.user_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div style={{ color: '#111827', fontWeight: 600, fontSize: '14px' }}>{selected.user_name}</div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>{fmtDate(selected.created_at)}</div>
                </div>
              </div>
              
              <div style={{ padding: '12px 16px', background: '#f3f4f6', borderRadius: '8px', color: '#374151', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px', borderLeft: '4px solid #9ca3af' }}>
                {selected.question}
              </div>

              {selected.answer ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckSquare size={12} /></div>
                    <div style={{ color: '#059669', fontWeight: 600, fontSize: '13px' }}>Answered by {selected.answered_by}</div>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#ecfdf5', borderRadius: '8px', color: '#065f46', fontSize: '14px', lineHeight: '1.5', border: '1px solid #a7f3d0' }}>
                    {selected.answer}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAnswer}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>Your Answer</label>
                  <textarea
                    rows={5}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your expert advice here..."
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical', marginBottom: '16px', fontFamily: 'inherit' }}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={saving}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                  >
                    <Send size={16} />
                    {saving ? 'Sending...' : 'Send Answer'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
