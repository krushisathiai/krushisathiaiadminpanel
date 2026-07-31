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
      <div className="page-head">
        <div>
          <h1>Expert Q&A</h1>
          <p>{pg.total_questions || 0} total questions</p>
        </div>
      </div>

      <div className={`responsive-expert-grid ${selected ? 'selected' : 'unselected'}`}>
        {/* Table */}
        <div className="card">
          <div className="tbl-toolbar">
            <div style={{ flex: 1, color: '#111827', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#059669" /> Farmer Questions
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setStatus(''); setPage(1); }}
                className={`btn btn-sm ${status === '' ? 'btn-secondary' : 'btn-ghost'}`}
              >
                <Filter size={14} /> All
              </button>
              <button
                onClick={() => { setStatus('pending'); setPage(1); }}
                className={`btn btn-sm ${status === 'pending' ? 'btn-ghost' : 'btn-ghost'}`}
                style={status === 'pending' ? { background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' } : {}}
              >
                <Clock size={14} /> Pending
              </button>
              <button
                onClick={() => { setStatus('answered'); setPage(1); }}
                className={`btn btn-sm ${status === 'answered' ? 'btn-ghost' : 'btn-ghost'}`}
                style={status === 'answered' ? { background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' } : {}}
              >
                <CheckCircle size={14} /> Answered
              </button>
            </div>
          </div>

          {loading ? (
            <div className="spin-wrap">
              <div className="spinner" />
            </div>
          ) : questions.length === 0 ? (
            <div className="empty">
              <MessageSquare size={48} />
              <h3>No Questions</h3>
              <p>{status === 'pending' ? 'No pending questions' : status === 'answered' ? 'All answered!' : 'No questions yet'}</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                    <th style={{ width: '40px' }}>#</th>
                    <th>FARMER</th>
                    <th>QUESTION</th>
                    <th>STATUS</th>
                    <th>ASKED</th>
                    <th style={{ textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => {
                    const num = (page - 1) * 10 + i + 1;
                    const initials = q.user_name?.substring(0,1).toUpperCase() || 'U';
                    const avatarColor = avatarColors[i % avatarColors.length];
                    const isSelected = selected?.id === q.id;
                    
                    return (
                      <tr key={q.id} className={isSelected ? 'selected-row' : ''} onClick={() => setSelected(q)} style={{ cursor: 'pointer', background: isSelected ? 'var(--primary-pale)' : '' }}>
                        <td style={{ textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>{num}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px' }}>
                              {initials}
                            </div>
                            <div style={{ color: '#111827', fontWeight: 500, fontSize: '14px' }}>{q.user_name || 'Unknown'}</div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-sub)', fontSize: '13px', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.question}
                        </td>
                        <td>
                          {!q.answer ? (
                            <span className="badge b-amber">Pending</span>
                          ) : (
                            <span className="badge b-green">Answered</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{fmtDate(q.created_at)}</td>
                        <td>
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
            <div className="tbl-footer">
              <div className="pg-info">
                Page {pg.current_page} of {pg.total_pages}
              </div>
              <div className="pagination">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="pg-btn"
                >
                  {'<'}
                </button>
                <button className="pg-btn active">{page}</button>
                <button 
                  onClick={() => setPage(p => Math.min(pg.total_pages, p + 1))} 
                  disabled={page === pg.total_pages} 
                  className="pg-btn"
                >
                  {'>'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reply Panel */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: '24px', padding: 0 }}>
            <div className="modal-hd" style={{ padding: '16px 20px', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
              <h2>{selected.answer ? 'View Answer' : 'Reply to Farmer'}</h2>
              <button className="close-btn" onClick={() => { setSelected(null); setAnswer(''); }}><X size={18} /></button>
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
                  <label className="form-label" style={{ marginBottom: '8px' }}>Your Answer</label>
                  <textarea
                    rows={5}
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Type your expert advice here..."
                    className="textarea"
                    style={{ marginBottom: '16px' }}
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
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
