import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, X, CheckCircle, Clock, Trash2 } from 'lucide-react';
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
      await answerQuestion(selected.id, { answer, answered_by: 'Dr. Patil (Agri Specialist)' });
      addToast('Question answered!', 'ok');
      setSelected(null);
      setAnswer('');
      fetchQs();
    } catch (e) { addToast(e.response?.data?.message || 'Failed to submit answer', 'err'); }
    finally { setSaving(false); }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this farmer question?')) return;
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

  const handleTemplate = (tmplText) => {
    setAnswer(prev => prev ? `${prev}\n\n${tmplText}` : tmplText);
  };

  return (
    <>
      <div className="responsive-page-head">
        <div>
          <h1>Community Expert Q&A</h1>
          <p>Provide expert advisory answers for crop problems submitted by farmers ({pg.total_questions || 0} questions total)</p>
        </div>
      </div>

      <div className={`responsive-expert-grid ${selected ? 'selected' : 'unselected'}`}>
        {/* Table / Questions List */}
        <div className="card">
          <div className="tbl-toolbar">
            <div style={{ flex: 1, color: 'var(--text-1)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="var(--primary)" /> Farmer Questions
            </div>
            
            <select
              className="sel"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Questions</option>
              <option value="pending">Pending Reply</option>
              <option value="answered">Answered</option>
            </select>
          </div>

          {loading ? (
            <div className="spin-wrap"><div className="spinner" /><span>Loading questions...</span></div>
          ) : questions.length === 0 ? (
            <div className="empty">
              <MessageSquare size={48} />
              <h3>No Questions Found</h3>
              <p>No questions match the filter criteria.</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>FARMER</th>
                    <th>QUESTION</th>
                    <th>STATUS</th>
                    <th>DATE</th>
                    <th style={{ textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => {
                    const initials = q.user_name?.substring(0,1).toUpperCase() || 'F';
                    const avatarColor = avatarColors[i % avatarColors.length];
                    const isSelected = selected?.id === q.id;

                    return (
                      <tr 
                        key={q.id}
                        onClick={() => { setSelected(q); setAnswer(q.answer || ''); }}
                        style={{ cursor: 'pointer', background: isSelected ? 'rgba(34, 197, 94, 0.08)' : undefined }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar" style={{ background: avatarColor }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{q.user_name || 'Farmer'}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{q.user_mobile || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-2)', maxWidth: '280px' }}>
                          <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {q.question}
                          </div>
                        </td>
                        <td>
                          {!q.answer ? (
                            <span className="badge b-amber"><Clock size={12} /> Pending</span>
                          ) : (
                            <span className="badge b-green"><CheckCircle size={12} /> Answered</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{fmtDate(q.created_at)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <button className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-ghost'}`}>
                              {q.answer ? 'View' : 'Reply'}
                            </button>
                            <button
                              className="btn btn-sm btn-danger btn-icon"
                              onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
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
                <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{'<'}</button>
                <button className="pg-btn active">{page}</button>
                <button className="pg-btn" onClick={() => setPage(p => Math.min(pg.total_pages, p + 1))} disabled={page === pg.total_pages}>{'>'}</button>
              </div>
            </div>
          )}
        </div>

        {/* Reply Panel */}
        {selected && (
          <div className="card" style={{ background: 'var(--bg-1)', position: 'sticky', top: '20px' }}>
            <div className="card-head">
              <div className="card-title">
                <MessageSquare size={18} /> Reply Panel
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="card-body">
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                  Question from {selected.user_name} ({selected.user_mobile})
                </div>
                <div style={{ color: 'var(--text-1)', fontSize: '14px', lineHeight: 1.5 }}>
                  "{selected.question}"
                </div>
              </div>

              {selected.answer && (
                <div style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Current Answer ({selected.answered_by || 'Admin'})
                  </div>
                  <div style={{ color: 'var(--text-2)', fontSize: '13px', whiteSpace: 'pre-wrap' }}>
                    {selected.answer}
                  </div>
                </div>
              )}

              {/* Quick Template Buttons */}
              <div style={{ marginBottom: '16px' }}>
                <div className="form-label" style={{ marginBottom: '8px' }}>Quick Smart Advice Templates</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleTemplate('• बुरशीजन्य रोगासाठी: Copper Oxychloride (२ ग्रॅम/लिटर) फवारणी करा.')}>
                    🧪 Fungicide Advice
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleTemplate('• किडींच्या नियंत्रणासाठी: Imidacloprid (०.५ मि.ली./लिटर) स्प्रे करा.')}>
                    🐛 Insecticide Advice
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => handleTemplate('• पिकाच्या वाढीसाठी: NPK 19:19:19 विद्राव्य खत पाण्यातून द्या.')}>
                    🌱 NPK Fertigation
                  </button>
                </div>
              </div>

              <form onSubmit={handleAnswer}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Expert Advisory Answer</label>
                  <textarea
                    className="textarea"
                    rows="6"
                    placeholder="Type detailed agricultural guidance for farmer..."
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Send size={15} /> {saving ? 'Sending...' : 'Submit Expert Reply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
