import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  Save,
  Users,
} from "lucide-react";

export default function SessionReviewPage() {
  const { sessionId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [original, setOriginal] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [bulkSelected, setBulkSelected] = useState(false);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get(
          `/teacher/sessions/${sessionId}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const list = [...(res.data.students || [])].sort((a, b) => {
          const am = Number(String(a.MIS || "").replace(/\D/g, ""));
          const bm = Number(String(b.MIS || "").replace(/\D/g, ""));

          if (am !== bm) return am - bm;

          return String(a.MIS || "").localeCompare(
            String(b.MIS || "")
          );
        });

        setStudents(list);

        // Permanent snapshot of attendance when the review page opened.
        setOriginal(JSON.parse(JSON.stringify(list)));
      } catch (err) {
        console.error("STUDENT FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [sessionId, token]);

  /*
   * Original attendance is always kept separately.
   * This prevents Select All / Deselect All from destroying
   * the original attendance state.
   */
  const originalPresent = useMemo(() => {
    const map = {};

    original.forEach((student) => {
      map[student.id] = !!student.present;
    });

    return map;
  }, [original]);

  /*
   * Attendance calculation:
   *
   * 1. Explicit individual override wins.
   * 2. If Select All is active, everyone is present.
   * 3. Otherwise fall back to the original attendance.
   */
  const isPresent = (id) => {
    if (Object.prototype.hasOwnProperty.call(overrides, id)) {
      return overrides[id];
    }

    return bulkSelected ? true : !!originalPresent[id];
  };

  const visibleStudents = useMemo(() => {
    return students.map((student) => ({
      ...student,
      present: isPresent(student.id),
    }));
  }, [students, overrides, bulkSelected, originalPresent]);

  /*
   * Changed means different from the ORIGINAL attendance.
   * This is deliberately derived instead of stored separately,
   * so Select All / Deselect All cannot create stale state.
   */
  const changedMap = useMemo(() => {
    const map = {};

    visibleStudents.forEach((student) => {
      map[student.id] =
        student.present !== !!originalPresent[student.id];
    });

    return map;
  }, [visibleStudents, originalPresent]);

  const presentCount = visibleStudents.filter(
    (student) => student.present
  ).length;

  const absentCount =
    visibleStudents.length - presentCount;

  const changedCount = Object.values(changedMap).filter(
    Boolean
  ).length;

  const allPresent =
    visibleStudents.length > 0 &&
    presentCount === visibleStudents.length;

  /*
   * Toggle one student.
   *
   * Every student can be toggled freely. Original attendance is only
   * a visual reference and never makes a student immutable.
   */
  const togglePresence = (id) => {
    const current = isPresent(id);
    const next = !current;

    // Every student remains editable, including students who were
    // originally present. Their original state is indicated only by
    // the visual bar in the row.
    setOverrides((prev) => ({
      ...prev,
      [id]: next,
    }));
  };

  /*
   * Single Select All / Deselect All control.
   *
   * Select All:
   *   Everyone becomes present.
   *
   * Deselect All:
   *   Returns to the original attendance while retaining
   *   explicit individual changes made by the teacher.
   */
  const setAllPresence = () => {
    if (allPresent) {
      setBulkSelected(false);
    } else {
      setBulkSelected(true);
      setOverrides({});
    }
  };

  const saveAttendance = async () => {
    setSaving(true);

    const payload = {
      marked: [],
      unmarked: [],
    };

    visibleStudents.forEach((student) => {
      if (!changedMap[student.id]) return;

      if (student.present) {
        payload.marked.push(student.id);
      } else {
        payload.unmarked.push(student.id);
      }
    });

    try {
      const res = await api.post(
        `/teacher/sessions/${sessionId}/mark`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
       * The API response tells us which students were modified.
       * The success screen, however, needs the FINAL attendance,
       * including students whose original state was unchanged.
       */
      const finalPresent = visibleStudents
        .filter((student) => student.present)
        .map((student) => ({
          ...student,
          name:
            student.name ||
            `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        }));

      const finalAbsent = visibleStudents
        .filter((student) => !student.present)
        .map((student) => ({
          ...student,
          name:
            student.name ||
            `${student.firstName || ""} ${student.lastName || ""}`.trim(),
        }));

      setSummary({
        ...res.data.summary,
        markedCount: finalPresent.length,
        unmarkedCount: finalAbsent.length,
        marked: finalPresent,
        unmarked: finalAbsent,
      });
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#dfe4e1] text-[#172d38]">

      {/* BACKGROUND DECORATION */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[280px] top-[8%] h-[650px] w-[650px] rounded-full border border-[#172d38]/[0.055]" />

        <div className="absolute -left-[190px] top-[20%] h-[470px] w-[470px] rounded-full border border-[#527c7a]/[0.075]" />

        <div className="absolute -right-[260px] top-[-120px] h-[620px] w-[620px] rounded-full border border-[#9a804f]/[0.07]" />

        <div className="absolute -right-[180px] bottom-[-150px] h-[520px] w-[520px] rounded-full border border-[#527c7a]/[0.055]" />

        <div className="absolute -left-48 top-0 h-[420px] w-[420px] rounded-full bg-[#527c7a]/[0.045] blur-3xl" />

        <div className="absolute -bottom-48 right-0 h-[480px] w-[480px] rounded-full bg-[#9a804f]/[0.04] blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(23,45,56,0.3) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage:
              "linear-gradient(to bottom right, black, transparent 72%)",
            WebkitMaskImage:
              "linear-gradient(to bottom right, black, transparent 72%)",
          }}
        />

        <div className="absolute left-[8%] top-[17%] h-3 w-3 rotate-45 border border-[#527c7a]/30" />

        <div className="absolute right-[12%] top-[24%] h-2 w-2 rounded-full bg-[#9a804f]/35" />

        <div className="absolute bottom-[19%] left-[12%] h-2 w-2 rounded-full bg-[#527c7a]/30" />

        <div className="absolute bottom-[24%] right-[8%] h-12 w-12 rotate-45 border border-[#172d38]/[0.05]" />
      </div>

      {/* PAGE */}

      <main className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] flex-col px-5 py-4 sm:px-7 lg:px-9">

        {/* HEADER */}

        <header className="flex shrink-0 items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#596965] transition-colors hover:bg-[#edf0ee] hover:text-[#172d38]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to dashboard
          </button>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9a804f]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#78847f]">
              Session review
            </span>
          </div>
        </header>

        {/* TITLE + STATS */}

        <section className="flex shrink-0 flex-col justify-between gap-3 py-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-px w-8 bg-[#9a804f]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#527c7a]">
                Final attendance
              </p>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#172d38]">
              Session review
            </h1>

            <p className="mt-1 text-xs text-[#78847f]">
              Verify the attendance before saving the final record.
            </p>
          </div>

          {!loading && !summary && (
            <div className="flex items-center gap-2">
              <div className="rounded-xl border border-[#c8d1ce] bg-[#edf0ee]/90 px-4 py-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#7b8884]">
                  Present
                </p>

                <p className="mt-0.5 text-lg font-semibold text-[#527c7a]">
                  {presentCount}
                </p>
              </div>

              <div className="rounded-xl border border-[#c8d1ce] bg-[#edf0ee]/90 px-4 py-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#7b8884]">
                  Absent
                </p>

                <p className="mt-0.5 text-lg font-semibold text-[#a64b4b]">
                  {absentCount}
                </p>
              </div>

              <div className="rounded-xl border border-[#c8d1ce] bg-[#edf0ee]/90 px-4 py-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#7b8884]">
                  Changed
                </p>

                <p className="mt-0.5 text-lg font-semibold text-[#9a804f]">
                  {changedCount}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* MAIN CONTENT */}

        <div className="min-h-0 flex-1">

          {/* LOADING */}

          {loading ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-[#c4ceca] bg-[#edf0ee]/90 shadow-[0_10px_35px_rgba(23,45,56,0.06)]">
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#dce8e5]">
                  <Users className="h-5 w-5 animate-pulse text-[#527c7a]" />
                </div>

                <p className="mt-3 text-sm font-semibold text-[#34464b]">
                  Loading students
                </p>

                <p className="mt-1 text-xs text-[#7d8985]">
                  Preparing the attendance record...
                </p>
              </div>
            </div>
          ) : summary ? (

            /* SUCCESS */

            <section className="relative h-full overflow-hidden rounded-2xl border border-[#c4ceca] bg-[#edf0ee]/95 shadow-[0_12px_40px_rgba(23,45,56,0.07)]">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border-[30px] border-[#527c7a]/[0.05]" />

              <div className="relative flex h-full flex-col justify-center px-6 py-8 sm:px-10">

                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#b9cfca] bg-[#dce8e5]">
                    <CheckCircle2 className="h-7 w-7 text-[#527c7a]" />
                  </div>

                  <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#527c7a]">
                    Attendance saved
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#172d38]">
                    Attendance updated successfully
                  </h2>
                </div>

                <div className="mx-auto mt-7 grid w-full max-w-4xl gap-3 sm:grid-cols-2">

                  {/* PRESENT SUMMARY */}

                  <div className="rounded-xl border border-[#9dc1b7] bg-[#d3e9e2] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#3f716d]">
                          Marked present
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-[#244e4b]">
                          {summary.markedCount}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#b9d9d1]">
                        <Check className="h-4 w-4 text-[#326a62]" />
                      </div>
                    </div>

                    {summary.marked.length > 0 && (
                      <ul className="mt-4 max-h-32 space-y-1.5 overflow-y-auto border-t border-[#b9d4cd] pt-3">
                        {summary.marked.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center gap-2 text-xs text-[#52645f]"
                          >
                            <span className="h-1 w-1 rounded-full bg-[#527c7a]" />

                            <span>
                              <b className="font-mono text-[#34464b]">
                                {s.MIS}
                              </b>{" "}
                              — {s.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* ABSENT SUMMARY */}

                  <div className="rounded-xl border border-[#d2a2a2] bg-[#efdada] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#a64b4b]">
                          Marked absent
                        </p>

                        <p className="mt-1 text-2xl font-semibold text-[#713f3f]">
                          {summary.unmarkedCount}
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e3c0c0]">
                        <Circle className="h-4 w-4 text-[#a64b4b]" />
                      </div>
                    </div>

                    {summary.unmarked.length > 0 && (
                      <ul className="mt-4 max-h-32 space-y-1.5 overflow-y-auto border-t border-[#d9baba] pt-3">
                        {summary.unmarked.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center gap-2 text-xs text-[#654747]"
                          >
                            <span className="h-1 w-1 rounded-full bg-[#a64b4b]" />

                            <span>
                              <b className="font-mono text-[#713f3f]">
                                {s.MIS}
                              </b>{" "}
                              — {s.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="mt-7 flex justify-center">
                  <button
                    onClick={() => navigate("/home")}
                    className="flex h-11 items-center gap-2 rounded-xl bg-[#172d38] px-7 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(23,45,56,0.15)] transition-all hover:bg-[#203b45]"
                  >
                    Return to dashboard
                    <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            </section>
          ) : (

            /* ATTENDANCE */

            <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#c4ceca] bg-[#edf0ee]/95 shadow-[0_12px_40px_rgba(23,45,56,0.07)]">

              {/* CONTAINER HEADER */}

              <div className="flex shrink-0 flex-col justify-between gap-3 border-b border-[#d0d8d5] px-5 py-3.5 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dce8e5]">
                    <Users className="h-4 w-4 text-[#527c7a]" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#172d38]">
                      Student attendance
                    </p>

                    <p className="text-[10px] text-[#7d8985]">
                      Review and adjust attendance before saving.
                    </p>
                  </div>
                </div>

                {/* SINGLE BULK BUTTON */}

                <button
                  type="button"
                  onClick={setAllPresence}
                  className={`flex h-8 items-center justify-center gap-1.5 rounded-lg border px-3 text-[10px] font-semibold transition-all ${
                    allPresent
                      ? "border-[#c58b8b] bg-[#f2dddd] text-[#a64b4b] hover:bg-[#ebd0d0]"
                      : "border-[#91b7ae] bg-[#d7e9e4] text-[#3f716d] hover:bg-[#cbe2dc]"
                  }`}
                >
                  {allPresent ? (
                    <Circle className="h-3.5 w-3.5" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}

                  {allPresent ? "Deselect all" : "Select all"}
                </button>
              </div>

              {/* ONLY THIS AREA SCROLLS */}

              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse">

                  <thead className="sticky top-0 z-20 bg-[#e3e8e5]">
                    <tr className="border-b border-[#cbd4d1]">

                      <th className="w-32 px-5 py-3 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-[#697873]">
                        Status
                      </th>

                      <th className="w-40 px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-[#697873]">
                        MIS
                      </th>

                      <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-[#697873]">
                        Student
                      </th>

                      <th className="px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-[#697873]">
                        Class
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleStudents.map((student) => {
                      const originalWasPresent =
                        !!originalPresent[student.id];

                      return (
                        <tr
                          key={student.id}
                          className={`border-b border-[#d2dad7] transition-colors last:border-0 ${
                            student.present
                              ? "bg-[#cfe8e0] hover:bg-[#c4e0d7]"
                              : "bg-[#efd5d5] hover:bg-[#e7caca]"
                          }`}
                        >

                          {/* STATUS */}

                          <td className="relative px-5 py-3">

                            {/*
                             * IMPORTANT:
                             * The bar exists ONLY for students who
                             * were originally present.
                             *
                             * It never disappears.
                             *
                             * Green = currently present
                             * Red   = currently absent
                             */}

                            {originalWasPresent && (
                              <span
                                className={`absolute bottom-2 left-0 top-2 w-1 rounded-r-full ${
                                  student.present
                                    ? "bg-[#527c7a]"
                                    : "bg-[#a64b4b]"
                                }`}
                                title="Originally present"
                              />
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                togglePresence(student.id)
                              }
                              className="group flex items-center gap-2"
                              aria-label={`Mark ${
                                student.present
                                  ? "absent"
                                  : "present"
                              }`}
                            >
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-colors ${
                                  student.present
                                    ? "border-[#72a99d] bg-[#b5d9cf] text-[#326a62]"
                                    : "border-[#c58b8b] bg-[#e3bebe] text-[#a64b4b]"
                                }`}
                              >
                                {student.present ? (
                                  <Check
                                    className="h-4 w-4"
                                    strokeWidth={2.5}
                                  />
                                ) : (
                                  <Circle
                                    className="h-4 w-4"
                                    strokeWidth={2.5}
                                  />
                                )}
                              </span>

                              <span
                                className={`text-[11px] font-bold ${
                                  student.present
                                    ? "text-[#326a62]"
                                    : "text-[#a64b4b]"
                                }`}
                              >
                                {student.present
                                  ? "Present"
                                  : "Absent"}
                              </span>
                            </button>
                          </td>

                          {/* MIS */}

                          <td className="px-4 py-3">
                            <span
                              className={`font-mono text-sm font-bold tracking-wide ${
                                student.present
                                  ? "text-[#244e4b]"
                                  : "text-[#7f3f3f]"
                              }`}
                            >
                              {student.MIS}
                            </span>
                          </td>

                          {/* NAME */}

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">

                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                                  student.present
                                    ? "bg-[#b5d9cf] text-[#326a62]"
                                    : "bg-[#e3bebe] text-[#a64b4b]"
                                }`}
                              >
                                {student.firstName?.[0] || ""}
                                {student.lastName?.[0] || ""}
                              </div>

                              <span
                                className={`text-sm font-semibold ${
                                  student.present
                                    ? "text-[#263f47]"
                                    : "text-[#713f3f]"
                                }`}
                              >
                                {student.firstName}{" "}
                                {student.lastName}
                              </span>
                            </div>
                          </td>

                          {/* CLASS */}

                          <td className="px-4 py-3">
                            <span className="text-xs text-[#6f7c77]">
                              {student.class?.name || "—"}
                            </span>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}

              <div className="flex shrink-0 flex-col justify-between gap-3 border-t border-[#d0d8d5] bg-[#e6eae8]/80 px-5 py-3 sm:flex-row sm:items-center">

                <div className="flex items-center gap-2 text-[10px] text-[#697873]">

                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#527c7a]" />
                    {presentCount} present
                  </span>

                  <span className="text-[#b1bab6]">
                    •
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#a64b4b]" />
                    {absentCount} absent
                  </span>

                  {changedCount > 0 && (
                    <>
                      <span className="text-[#b1bab6]">
                        •
                      </span>

                      <span className="font-semibold text-[#9a804f]">
                        {changedCount} modified
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={saveAttendance}
                  disabled={saving}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#172d38] px-6 text-xs font-semibold text-white shadow-[0_7px_20px_rgba(23,45,56,0.12)] transition-all hover:bg-[#203b45] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />

                  {saving
                    ? "Saving..."
                    : "Save attendance"}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-[#527c7a]/60" />

          <span className="h-px w-8 bg-[#c2cbc7]" />

          <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#78847f]">
            IIIT Pune
          </span>

          <span className="h-px w-8 bg-[#c2cbc7]" />

          <span className="h-1 w-1 rounded-full bg-[#9a804f]/60" />
        </div>
      </main>
    </div>
  );
}