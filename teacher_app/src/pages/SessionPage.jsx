import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";

export default function SessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  // =========================================================
  // QR
  // =========================================================

  const [qrImage, setQrImage] = useState(null);
  const [qrExpiry, setQrExpiry] = useState(null);

  // =========================================================
  // SESSION
  // =========================================================

  const [sessionEndTime, setSessionEndTime] = useState(null);
  const [sessionRemaining, setSessionRemaining] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  // =========================================================
  // LIVE ATTENDANCE
  // =========================================================

  const [presentStudents, setPresentStudents] = useState([]);

  // =========================================================
  // EXTEND
  // =========================================================

  const [extendMinutes, setExtendMinutes] = useState(5);
  const [extending, setExtending] = useState(false);

  // =========================================================
  // NOTIFICATION
  // =========================================================

  const [note, setNote] = useState("");

  // =========================================================
  // INTERVALS
  // =========================================================

  const qrInterval = useRef(null);
  const sesInterval = useRef(null);
  const liveInterval = useRef(null);

  // =========================================================
  // LIVE ATTENDANCE SCROLL
  // =========================================================

  const attendanceScrollRef = useRef(null);
  const autoScrollFrameRef = useRef(null);

  // =========================================================
  // HELPERS
  // =========================================================

  const clearAllIntervals = () => {
    if (qrInterval.current) {
      clearInterval(qrInterval.current);
      qrInterval.current = null;
    }

    if (sesInterval.current) {
      clearInterval(sesInterval.current);
      sesInterval.current = null;
    }

    if (liveInterval.current) {
      clearInterval(liveInterval.current);
      liveInterval.current = null;
    }
  };

  const notify = (msg) => {
    setNote(msg);

    setTimeout(() => {
      setNote("");
    }, 2000);
  };

  // =========================================================
  // SORT STUDENTS BY MIS
  // =========================================================

  const sortStudentsByMIS = (students) => {
    return [...students].sort((a, b) => {
      const misA = String(a.MIS ?? "").trim();
      const misB = String(b.MIS ?? "").trim();

      const numA = parseInt(misA.replace(/\D/g, ""), 10);

      const numB = parseInt(misB.replace(/\D/g, ""), 10);

      if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
        return numA - numB;
      }

      return misA.localeCompare(misB);
    });
  };

  // =========================================================
  // GET UNIQUE STUDENT KEY
  // =========================================================

  const getStudentKey = (student) => {
    if (student.MIS != null) {
      return `MIS-${String(student.MIS).trim()}`;
    }

    if (student.id != null) {
      return `ID-${String(student.id)}`;
    }

    return null;
  };

  // =========================================================
  // FETCH QR
  // =========================================================

  const fetchQr = async () => {
    try {
      const res = await api.get(`/teacher/sessions/${sessionId}/qr`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.qrImage) {
        setQrImage(res.data.qrImage);
      }

      if (res.data.validTo) {
        setQrExpiry(new Date(res.data.validTo).getTime());
      }
    } catch (err) {
      console.error("QR ERROR:", err);
    }
  };

  // =========================================================
  // FETCH LIVE ATTENDANCE
  //
  // IMPORTANT:
  // We MERGE the API result with the existing students.
  // We do NOT replace the existing list.
  //
  // This prevents extending the session from erasing
  // students who were already marked present.
  // =========================================================

  const fetchLive = async () => {
    try {
      const res = await api.get(`/teacher/sessions/${sessionId}/live`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const incoming = Array.isArray(res.data.presentStudents)
        ? res.data.presentStudents
        : [];

      setPresentStudents((previousStudents) => {
        const studentMap = new Map();

        // ---------------------------------------------------
        // FIRST: keep everything already displayed
        // ---------------------------------------------------

        previousStudents.forEach((student) => {
          const key = getStudentKey(student);

          if (key) {
            studentMap.set(key, student);
          }
        });

        // ---------------------------------------------------
        // SECOND: add/update students from API
        // ---------------------------------------------------

        incoming.forEach((student) => {
          const key = getStudentKey(student);

          if (key) {
            studentMap.set(key, student);
          }
        });

        // ---------------------------------------------------
        // SORT AFTER MERGING
        // ---------------------------------------------------

        return sortStudentsByMIS(Array.from(studentMap.values()));
      });
    } catch (err) {
      console.error("LIVE ERROR:", err);

      // IMPORTANT:
      // Do not clear existing attendance if the API fails.
      // The existing live list remains untouched.
    }
  };

  // =========================================================
  // START TIMERS
  // =========================================================

  const startTimers = () => {
    clearAllIntervals();

    // =======================================================
    // QR EXPIRY
    // =======================================================

    qrInterval.current = setInterval(() => {
      setQrExpiry((currentExpiry) => {
        if (!currentExpiry) {
          return currentExpiry;
        }

        const left = currentExpiry - Date.now();

        if (left <= 0) {
          fetchQr();
        }

        return currentExpiry;
      });
    }, 1000);

    // =======================================================
    // SESSION TIMER
    // =======================================================

    sesInterval.current = setInterval(() => {
      setSessionEndTime((endTime) => {
        if (!endTime) {
          return endTime;
        }

        const left = Math.max(Math.floor((endTime - Date.now()) / 1000), 0);

        setSessionRemaining(left);

        if (left <= 0) {
          setSessionEnded(true);
          clearAllIntervals();
        }

        return endTime;
      });
    }, 1000);

    // =======================================================
    // LIVE ATTENDANCE
    // =======================================================

    liveInterval.current = setInterval(() => {
      fetchLive();
    }, 3000);

    // Initial refresh.
    // This MERGES instead of replacing existing attendance.
    fetchLive();
  };

  // =========================================================
  // EXTEND SESSION
  // =========================================================

  const extendSession = async () => {
    try {
      setExtending(true);

      // IMPORTANT:
      // Do NOT clear presentStudents here.
      // Existing attendance must survive extension.

      const res = await api.post(
        `/teacher/sessions/${sessionId}/extend`,
        {
          extraMinutes: extendMinutes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newEnd = new Date(res.data.newEnd).getTime();

      setSessionEndTime(newEnd);

      setSessionEnded(false);

      setSessionRemaining(
        Math.max(Math.floor((newEnd - Date.now()) / 1000), 0),
      );

      // Refresh QR only.
      await fetchQr();

      // Restart timers.
      //
      // fetchLive() inside startTimers() now MERGES
      // with the existing attendance instead of erasing it.
      startTimers();

      notify("Session extended");
    } catch (err) {
      console.error("EXTEND ERROR:", err);
      notify("Unable to extend session");
    } finally {
      setExtending(false);
    }
  };

  // =========================================================
  // END SESSION
  // =========================================================

  const endSessionNow = async () => {
    try {
      await api.post(
        `/teacher/sessions/${sessionId}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSessionEnded(true);

      clearAllIntervals();
    } catch (err) {
      console.error("END ERROR:", err);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const initialise = async () => {
      try {
        const session = window.history.state?.usr?.session;

        if (session?.endTime && mounted) {
          const endTime = new Date(session.endTime).getTime();

          setSessionEndTime(endTime);

          setSessionRemaining(
            Math.max(Math.floor((endTime - Date.now()) / 1000), 0),
          );
        }

        await Promise.all([fetchQr(), fetchLive()]);
      } catch (err) {
        console.error("INITIAL LOAD ERROR:", err);
      }
    };

    initialise();

    return () => {
      mounted = false;

      clearAllIntervals();

      if (autoScrollFrameRef.current) {
        cancelAnimationFrame(autoScrollFrameRef.current);

        autoScrollFrameRef.current = null;
      }
    };
  }, []);

  // =========================================================
  // START TIMERS WHEN SESSION IS READY
  // =========================================================

  useEffect(() => {
    if (sessionEndTime && qrExpiry && !sessionEnded) {
      startTimers();
    }

    return () => {
      clearAllIntervals();
    };
  }, [sessionEndTime, qrExpiry, sessionEnded]);

  // =========================================================
  // LIVE ATTENDANCE AUTO SCROLL
  //
  // Slow/medium TV-style continuous scrolling.
  // No manual scrolling required.
  // =========================================================

  useEffect(() => {
    const container = attendanceScrollRef.current;

    if (!container) {
      return;
    }

    if (autoScrollFrameRef.current) {
      cancelAnimationFrame(autoScrollFrameRef.current);
    }

    let animationFrame;
    let lastTime = performance.now();

    // Pixels per second.
    // 18 gives a readable but clearly moving
    // TV-style attendance display.
    const SCROLL_SPEED = 18;

    const animate = (currentTime) => {
      const el = attendanceScrollRef.current;

      if (!el) {
        return;
      }

      const deltaTime = currentTime - lastTime;

      lastTime = currentTime;

      const maxScroll = el.scrollHeight - el.clientHeight;

      if (maxScroll > 0) {
        const movement = (SCROLL_SPEED * deltaTime) / 1000;

        el.scrollTop += movement;

        // Restart at top when the list reaches
        // the bottom.
        if (el.scrollTop >= maxScroll) {
          el.scrollTop = 0;
        }
      }

      animationFrame = requestAnimationFrame(animate);

      autoScrollFrameRef.current = animationFrame;
    };

    const startTimeout = setTimeout(() => {
      lastTime = performance.now();

      animationFrame = requestAnimationFrame(animate);

      autoScrollFrameRef.current = animationFrame;
    }, 500);

    return () => {
      clearTimeout(startTimeout);

      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      if (autoScrollFrameRef.current) {
        cancelAnimationFrame(autoScrollFrameRef.current);

        autoScrollFrameRef.current = null;
      }
    };
  }, [presentStudents.length]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const format = (sec) => {
    const minutes = Math.floor(sec / 60);

    const seconds = sec % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="h-screen overflow-hidden bg-[#e8efec] text-[#17313d] relative">
      {/* =====================================================
          BACKGROUND TEXTURE
      ====================================================== */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-[-100px] w-[500px] h-[500px] rounded-full border border-[#c9d8d4]" />

        <div className="absolute top-[-180px] right-[-80px] w-[520px] h-[520px] rounded-full border border-[#d1ddd9]" />

        <div className="absolute bottom-[-240px] left-[30%] w-[500px] h-[500px] rounded-full border border-[#d1ddd9]" />
      </div>

      {/* =====================================================
          NOTIFICATION
      ====================================================== */}

      {note && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl bg-[#17313d] text-white text-sm shadow-xl">
          {note}
        </div>
      )}

      {/* =====================================================
          PAGE
      ====================================================== */}

      <div className="relative z-10 h-full px-8 py-6 flex flex-col">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <header className="flex items-end justify-between mb-5 shrink-0">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span className="block w-11 h-px bg-[#a78b4b]" />

              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#4d7880]">
                Live session
              </span>
            </div>

            <h1 className="text-[36px] leading-none font-semibold tracking-tight">
              Attendance
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#657b80] pb-1">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

              <circle cx="9" cy="7" r="4" />

              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>

            <span>
              {presentStudents.length}{" "}
              {presentStudents.length === 1 ? "student" : "students"} present
            </span>
          </div>
        </header>

        {/* ===================================================
            MAIN
        ==================================================== */}

        <main className="flex-1 min-h-0 grid grid-cols-[410px_minmax(0,1fr)_410px] gap-7">
          {/* =================================================
              LIVE ATTENDANCE
          ================================================== */}

          <section className="min-h-0 rounded-[22px] border border-[#c7d5d1] bg-[#edf3f1]/95 shadow-[0_18px_45px_rgba(39,65,70,0.08)] overflow-hidden flex flex-col">
            <div className="px-7 py-5 border-b border-[#d0dcda] flex items-center justify-between shrink-0">
              <div>
                <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#4d7880]">
                  Live
                </p>

                <h2 className="text-[21px] font-semibold mt-1">Attendance</h2>
              </div>

              <div className="w-12 h-12 rounded-[15px] bg-[#dcebea] flex items-center justify-center text-[#34727a] font-semibold">
                {presentStudents.length}
              </div>
            </div>

            {/* =================================================
                LIVE LIST
            ================================================== */}

            <div
              ref={attendanceScrollRef}
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-5 py-4 scrollbar-thin scrollbar-thumb-[#b6c9c5] scrollbar-track-transparent"
              style={{
                scrollbarWidth: "thin",
              }}
            >
              {presentStudents.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-[#829296]">
                    Waiting for attendance...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {presentStudents.map((stu) => {
                    const key = getStudentKey(stu);

                    return (
                      <div
                        key={key}
                        className="rounded-[17px] border border-[#ccd9d6] bg-[#f5f8f7] px-4 py-3 flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-[16px] font-semibold text-[#17313d] leading-tight">
                            {stu.MIS}
                          </p>

                          <p className="text-[14px] text-[#71868b] mt-1 truncate">
                            {stu.firstName} {stu.lastName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              QR
          ================================================== */}

          <section className="min-h-0 rounded-[22px] border border-[#c7d5d1] bg-[#edf3f1]/90 shadow-[0_18px_45px_rgba(39,65,70,0.08)] relative overflow-hidden flex flex-col items-center">
            <div
              className="absolute inset-0 opacity-50 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(#d7e1df 1px, transparent 1px),
                  linear-gradient(90deg, #d7e1df 1px, transparent 1px)
                `,
                backgroundSize: "36px 36px",
              }}
            />

            <div className="relative z-10 flex flex-col items-center h-full w-full pt-4">
              <div className="w-11 h-11 rounded-[14px] bg-[#dcebea] flex items-center justify-center text-[#4a7d83] mb-3">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="6" height="6" />

                  <rect x="15" y="3" width="6" height="6" />

                  <rect x="3" y="15" width="6" height="6" />

                  <path d="M15 15h3v3h-3zM18 18h3v3h-3zM21 15v3M15 21h3" />
                </svg>
              </div>

              <p className="text-[12px] font-bold tracking-[0.2em] uppercase text-[#4b7880]">
                Scan to mark attendance
              </p>

              <h2 className="text-[23px] font-semibold mt-2">
                Live attendance QR
              </h2>

              {!sessionEnded && (
                <div className="flex-1 min-h-0 flex items-center justify-center pb-7">
                  {qrImage ? (
                    <div className="bg-white p-5 rounded-[24px] border border-[#cfdad8] shadow-[0_20px_50px_rgba(32,54,59,0.12)]">
                      <div className="bg-white rounded-[17px] border border-[#d8e0de] p-3">
                        <img
                          src={qrImage}
                          alt="Attendance QR"
                          className="w-[min(34vw,430px)] h-[min(34vw,430px)] max-w-[430px] max-h-[430px] min-w-[300px] min-h-[300px] object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[#7d9093]">Loading QR...</div>
                  )}
                </div>
              )}

              {sessionEnded && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#e8dfc9] flex items-center justify-center text-[#9a7b38]">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <circle cx="12" cy="12" r="9" />

                        <path d="M12 7v5l3 2" />
                      </svg>
                    </div>

                    <p className="mt-5 text-xs font-bold tracking-[0.18em] uppercase text-[#967d43]">
                      Session complete
                    </p>

                    <h3 className="text-2xl font-semibold mt-2">
                      Attendance session ended
                    </h3>
                  </div>
                </div>
              )}

              <div className="shrink-0 pb-4 flex items-center gap-3 text-[10px] tracking-[0.25em] text-[#839497]">
                <span className="w-2 h-2 rounded-full bg-[#5b9294]" />
                <span className="w-10 h-px bg-[#b8c7c4]" />
                IIIT PUNE
                <span className="w-10 h-px bg-[#b8c7c4]" />
                <span className="w-2 h-2 rounded-full bg-[#a78b4b]" />
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT SIDE
          ================================================== */}

          <aside className="min-h-0 flex flex-col gap-5">
            {/* TIMER */}

            <div className="rounded-[22px] bg-[#17313d] text-white px-7 py-6 shadow-[0_18px_45px_rgba(28,52,60,0.16)] relative overflow-hidden shrink-0">
              <div className="absolute -top-28 right-[-70px] w-52 h-52 rounded-full border-[18px] border-white/[0.04]" />

              <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[15px] bg-white/[0.08] flex items-center justify-center text-[#9bc5c5]">
                    <svg
                      width="23"
                      height="23"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />

                      <path d="M12 7v5l3 2" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#9bbabb]">
                      Session
                    </p>

                    <p className="text-[15px] text-[#c7d3d3] mt-1">
                      Time remaining
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[58px] leading-none font-light tracking-tight">
                    {sessionRemaining != null
                      ? format(sessionRemaining)
                      : "..."}
                  </p>

                  <p className="text-[10px] tracking-[0.18em] uppercase text-[#88a3a5] mt-3">
                    Minutes : Seconds
                  </p>
                </div>
              </div>
            </div>

            {/* PRESENT COUNT */}

            <div className="rounded-[22px] border border-[#c7d5d1] bg-[#edf3f1]/95 px-7 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[15px] bg-[#dcebea] flex items-center justify-center text-[#4a8184]">
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />

                    <circle cx="9" cy="7" r="4" />

                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />

                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>

                <div>
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#718589]">
                    Present
                  </p>

                  <p className="text-[15px] font-semibold mt-1">
                    Live attendance
                  </p>
                </div>
              </div>

              <span className="text-[28px] font-medium">
                {presentStudents.length}
              </span>
            </div>

            {/* SESSION CONTROLS */}

            <div className="mt-auto rounded-[22px] border border-[#c7d5d1] bg-[#edf3f1]/95 px-7 py-6 shrink-0">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#718589]">
                Session controls
              </p>

              <p className="text-[15px] text-[#70868a] mt-3 leading-relaxed">
                End the attendance session manually when you're finished.
              </p>

              {!sessionEnded ? (
                <button
                  onClick={endSessionNow}
                  className="mt-5 w-full h-12 rounded-[14px] border border-[#e4b0ad] bg-[#f8e9e7] text-[#ad4d48] font-semibold text-sm hover:bg-[#f4dfdc] transition"
                >
                  <span className="inline-flex items-center justify-center gap-3">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />

                      <path d="M9 9l6 6M15 9l-6 6" />
                    </svg>
                    End session now
                  </span>
                </button>
              ) : (
                <div className="mt-5 space-y-3">
                  <div className="flex gap-3">
                    <select
                      value={extendMinutes}
                      onChange={(e) => setExtendMinutes(Number(e.target.value))}
                      className="h-12 flex-1 rounded-[14px] border border-[#cbd8d5] bg-white px-4 text-sm outline-none"
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} min
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={extendSession}
                      disabled={extending}
                      className="h-12 px-5 rounded-[14px] bg-[#17313d] text-white text-sm font-semibold disabled:opacity-60"
                    >
                      {extending ? "Extending..." : "Extend"}
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/session/${sessionId}/review`)}
                    className="w-full h-12 rounded-[14px] bg-[#17313d] text-white font-semibold text-sm"
                  >
                    Review attendance
                  </button>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>

      {/* =====================================================
          SCROLLBAR
      ====================================================== */}

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 7px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #b6c9c5;
          border-radius: 999px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #91aaa5;
        }
      `}</style>
    </div>
  );
}
