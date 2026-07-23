import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, X, CheckCircle, Clock, Filter } from 'lucide-react';
import { getExpertQuestions, answerQuestion } from '../api/adminApi';
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

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const STATUS_TABS = [
    { val: '', label: 'All', icon: Filter },
    { val: 'pending', label: 'Pending', icon: Clock },
    { val: 'answered', label: 'Answered', icon: CheckCircle },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Expert Q&A</h1>
          <p>{pg.total_questions || 0} total questions</p>
        </div>
        <div className="flex items-center gap-2">
          {STATUS_TABS.map(({ val, label, icon: Icon }) => (
            <button
              key={val}
              className={`btn btn-sm ${status === val ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setStatus(val); setPage(1); }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16 }}>
        {/* Table */}
        <div className="card">
          {loading ? (
            <div className="spin-wrap"><div className="spinner" /><span>Loading...</span></div>
          ) : questions.length === 0 ? (
            <div className="empty">
              <MessageSquare />
              <h3>No Questions</h3>
              <p>{status === 'pending' ? 'No pending questions' : status === 'answered' ? 'All answered!' : 'No questions yet'}</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Farmer</th>
                    <th>Question</th>
                    <th>Status</th>
                    <th>Asked</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr key={q.id} style={{ background: selected?.id === q.id ? 'rgba(34,197,94,.06)' : '' }}>
                      <td className="tc-5 fs-12">{(page - 1) * 10 + i + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar">{q.user_name?.[0]}</div>
                          <div>
                            <div className="fw-600 tc-1 fs-13">{q.user_name}</div>
                            <div className="tc-5 fs-12">{q.user_mobile}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: 280 }}>
                        <div className="fw-600 tc-1 fs-13" style={{ marginBottom: 3 }}>{q.question}</div>
                        {q.answer && (
                          <div className="tc-5 fs-12">
                            <CheckCircle size={11} style={{ display: 'inline', marginRight: 3, color: 'var(--green-500)' }} />
                            Answered by {q.answered_by}
                          </div>
                        )}
                      </td>
                      <td>
                        {q.answer
                          ? <span className="badge b-green"><CheckCircle size={11} /> Answered</span>
                          : <span className="badge b-amber"><Clock size={11} /> Pending</span>
                        }
                      </td>
                      <td className="tc-5 fs-12">{fmtDate(q.created_at)}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${selected?.id === q.id ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => { setSelected(q); setAnswer(q.answer || ''); }}
                        >
                          <MessageSquare size={13} />
                          {q.answer ? 'Edit' : 'Answer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pg.total_pages > 1 && (
            <div className="tbl-footer">
              <span className="pg-info">Page {pg.current_page} of {pg.total_pages}</span>
              <div className="pagination">
                <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
                <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === pg.total_pages}>›</button>
              </div>
            </div>
          )}
        </div>

        {/* Answer Panel */}
        {selected && (
          <div className="answer-panel">
            <div className="answer-panel-head">
              <h3><Send size={16} /> Answer Question</h3>
              <button
                className="modal-close"
                onClick={() => { setSelected(null); setAnswer(''); }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="answer-panel-body">
              <div className="question-bubble">
                <div className="question-bubble-label">Question from {selected.user_name}</div>
                {selected.question}
              </div>
              <form onSubmit={handleAnswer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Your Expert Answer</label>
                  <textarea
                    className="textarea"
                    placeholder="Write a detailed, helpful answer for the farmer..."
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    required
                    style={{ minHeight: 180 }}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setAnswer(''); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving || !answer.trim()}>
                    {saving ? 'Saving...' : <><Send size={13} /> Submit Answer</>}
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
