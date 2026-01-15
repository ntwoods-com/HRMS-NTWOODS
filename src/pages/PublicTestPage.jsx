import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { testQuestionsGet, testSubmitPublic, testTokenValidate } from '../api/test';

function fmtDateTime(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

// Anti-leave detection hook
function useAntiLeave(enabled, onViolation) {
  const violationCountRef = useRef(0);
  const maxViolations = 3;

  useEffect(() => {
    if (!enabled) return;

    // Visibility change detection (tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        violationCountRef.current += 1;
        if (onViolation) {
          onViolation(violationCountRef.current, maxViolations);
        }
        toast.error(`⚠️ Warning ${violationCountRef.current}/${maxViolations}: Do not switch tabs during the test!`);
      }
    };

    // Blur detection (window focus lost)
    const handleBlur = () => {
      violationCountRef.current += 1;
      if (onViolation) {
        onViolation(violationCountRef.current, maxViolations);
      }
      toast.error(`⚠️ Warning ${violationCountRef.current}/${maxViolations}: Do not leave the test window!`);
    };

    // Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error('Right-click is disabled during the test');
    };

    // Prevent copy/paste
    const handleCopy = (e) => {
      e.preventDefault();
      toast.error('Copy is disabled during the test');
    };

    // Prevent keyboard shortcuts
    const handleKeyDown = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+A, F12, etc.
      if (
        (e.ctrlKey && ['c', 'v', 'a', 'u', 's'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        toast.error('This action is disabled during the test');
      }
    };

    // Beforeunload warning
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'You have an ongoing test. Are you sure you want to leave?';
      return e.returnValue;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, onViolation]);

  return { violationCount: violationCountRef.current, maxViolations };
}

export function PublicTestPage() {
  const location = useLocation();
  const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [valid, setValid] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedAt, setSubmittedAt] = useState('');
  const [questions, setQuestions] = useState([]);
  const [blocked, setBlocked] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  const [fullName, setFullName] = useState('');
  const [applyingFor, setApplyingFor] = useState('');
  const [source, setSource] = useState('');
  const [answers, setAnswers] = useState({});

  // Anti-leave detection - only active when test is started and not submitted
  const handleViolation = useCallback((count, max) => {
    setViolationCount(count);
    if (count >= max) {
      setBlocked(true);
      toast.error('Test blocked due to multiple tab switches. Contact HR.');
    }
  }, []);

  useAntiLeave(testStarted && !submitted && !blocked, handleViolation);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        if (!token) {
          if (cancelled) return;
          setValid(false);
          setExpiresAt('');
          setSubmitted(false);
          setSubmittedAt('');
          setQuestions([]);
          setAnswers({});
          return;
        }

        const v = await testTokenValidate({ token });
        if (cancelled) return;

        setValid(Boolean(v.valid));
        setExpiresAt(v.expiresAt || '');
        setSubmitted(Boolean(v.submitted));
        setSubmittedAt('');
        setQuestions([]);
        setAnswers({});

        if (!v.valid || v.submitted) return;

        const q = await testQuestionsGet({ token });
        if (cancelled) return;

        if (q.alreadySubmitted) {
          setSubmitted(true);
          setSubmittedAt('');
          return;
        }

        setQuestions(q.questions || []);
      } catch (e) {
        if (cancelled) return;
        setValid(false);
        setExpiresAt('');
        setSubmitted(false);
        setSubmittedAt('');
        setQuestions([]);
        toast.error(e?.message || 'Failed to load test');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit() {
    if (loading || submitting) return;
    try {
      if (!token) return;
      if (!String(fullName).trim()) {
        toast.error('Full Name required');
        return;
      }
      if (!String(applyingFor).trim()) {
        toast.error('Applying For required');
        return;
      }
      if (!String(source).trim()) {
        toast.error('Source required');
        return;
      }

      for (const q of questions) {
        const v = answers[q.id];
        if (!String(v ?? '').trim()) {
          toast.error(`Answer required for question ${q.id}`);
          return;
        }
      }

      setSubmitting(true);
      const res = await testSubmitPublic({
        token,
        fullName: String(fullName).trim(),
        applyingFor: String(applyingFor).trim(),
        source: String(source).trim(),
        answers,
      });

      setSubmitted(true);
      setSubmittedAt(res?.submittedAt || '');
      toast.success('Test submitted');
    } catch (e) {
      const msg = e?.message || 'Submit failed';
      if (String(msg).toUpperCase().includes('ALREADY_SUBMITTED')) {
        setSubmitted(true);
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Start test function
  const handleStartTest = () => {
    if (!fullName.trim() || !applyingFor.trim() || !source.trim()) {
      toast.error('Please fill all candidate details before starting the test');
      return;
    }
    setTestStarted(true);
    toast.success('Test started! Do not switch tabs or leave this window.');
  };

  return (
    <div className="container" style={{ maxWidth: 860, userSelect: testStarted ? 'none' : 'auto' }}>
      {/* Blocked Overlay */}
      {blocked && (
        <div className="test-blocked-overlay">
          <div className="test-blocked-icon">🚫</div>
          <div className="test-blocked-title">Test Blocked</div>
          <div className="test-blocked-message">
            Your test has been blocked due to multiple tab switches or leaving the test window.
            Please contact HR for further assistance.
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 10 }}>
        <h2 style={{ marginTop: 0 }}>Online Test</h2>

        {loading ? (
          <div className="small">Loading...</div>
        ) : !token ? (
          <div className="small">Missing token in URL.</div>
        ) : !valid ? (
          <div className="small">Invalid or expired token.</div>
        ) : submitted ? (
          <div className="card" style={{ background: '#fafafa' }}>
            <strong>Test submitted</strong>
            <div className="small" style={{ marginTop: 8 }}>
              Thank you. Your response has been submitted.
            </div>
            {submittedAt ? <div className="small" style={{ marginTop: 6 }}>Submitted: {fmtDateTime(submittedAt)}</div> : null}
          </div>
        ) : (
          <>
            {/* Warning Banner */}
            {testStarted && !blocked && (
              <div className="test-warning-banner">
                <div className="test-warning-icon">⚠️</div>
                <div className="test-warning-content">
                  <div className="test-warning-title">Important: Do not leave this page!</div>
                  <div className="test-warning-text">
                    Switching tabs, minimizing browser, or leaving this window will be recorded.
                    After 3 violations, your test will be blocked.
                    {violationCount > 0 && (
                      <strong style={{ display: 'block', marginTop: 4, color: '#dc2626' }}>
                        Violations: {violationCount}/3
                      </strong>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="small">Token valid{expiresAt ? ` (expires: ${fmtDateTime(expiresAt)})` : ''}</div>

            <div style={{ height: 12 }} />

            <div className="card" style={{ background: '#fafafa' }}>
              <strong>Candidate Details</strong>
              <div style={{ height: 10 }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                <div>
                  <div className="small">Full Name <span style={{ color: '#ef4444' }}>*</span></div>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    disabled={submitting || testStarted}
                  />
                </div>
                <div>
                  <div className="small">Applying For <span style={{ color: '#ef4444' }}>*</span></div>
                  <input
                    value={applyingFor}
                    onChange={(e) => setApplyingFor(e.target.value)}
                    placeholder="Applying For"
                    disabled={submitting || testStarted}
                  />
                </div>
                <div>
                  <div className="small">Source <span style={{ color: '#ef4444' }}>*</span></div>
                  <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source" disabled={submitting || testStarted} />
                </div>
              </div>

              {/* Start Test Button - Only show if not started */}
              {!testStarted && (
                <div style={{ marginTop: 16 }}>
                  <button 
                    className="button primary" 
                    type="button" 
                    onClick={handleStartTest}
                    disabled={!fullName.trim() || !applyingFor.trim() || !source.trim()}
                  >
                    ▶ Start Test
                  </button>
                  <div className="small" style={{ marginTop: 8, color: 'var(--gray-500)' }}>
                    Fill your details above and click Start Test to begin
                  </div>
                </div>
              )}
            </div>

            {/* Questions - Only show after test started */}
            {testStarted && !blocked && (
              <>
                <div style={{ height: 12 }} />

                <div className="card" style={{ background: '#fafafa' }}>
                  <strong>Questions</strong>

                  <div style={{ height: 10 }} />

                  {questions.length === 0 ? (
                    <div className="small">No questions loaded.</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                      {questions.map((q) => (
                        <div key={q.id} className="card" style={{ background: '#fff' }}>
                          <div style={{ fontWeight: 700 }}>{q.id}.</div>
                          <div className="small" style={{ marginTop: 6 }}>
                            {q.prompt}
                          </div>
                          <div style={{ height: 8 }} />
                          <input
                            value={answers[q.id] ?? ''}
                            onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                            placeholder="Your answer"
                            disabled={submitting}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ height: 12 }} />
                  <button className="button primary" type="button" onClick={onSubmit} disabled={submitting || questions.length === 0}>
                    {submitting ? 'Submitting...' : 'Submit Test'}
                  </button>
                </div>

                <div className="small" style={{ marginTop: 12, color: '#ef4444', fontWeight: 500 }}>
                  ⚠️ Do not refresh, switch tabs, or leave this page. One attempt only.
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

