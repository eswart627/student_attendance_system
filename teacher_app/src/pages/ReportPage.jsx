import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { AuthContext } from "@/context/AuthContext";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Filter,
  GraduationCap,
  Search,
  Users,
  X,
} from "lucide-react";

export default function ReportPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const [percentageFilter, setPercentageFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // all | below75 | critical
  const [attendanceFilter, setAttendanceFilter] = useState("all");

  // name | mis | percentage
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const loadReport = async () => {
      try {
        const res = await api.get("/teacher/report", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setReport(res.data.report || []);
      } catch (err) {
        console.error("Report Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [token]);

  const clearFilters = () => {
    setPercentageFilter("");
    setSearchQuery("");
    setAttendanceFilter("all");
    setSortField("name");
    setSortOrder("asc");
  };

  const toggleAttendanceFilter = (filter) => {
    if (attendanceFilter === filter) {
      setAttendanceFilter("all");
    } else {
      setAttendanceFilter(filter);
    }
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    setSelectedClass(null);
    clearFilters();
  };

  const selectClass = (cls) => {
    setSelectedClass(cls);
    clearFilters();
  };

  const getFilteredStudents = () => {
    if (!selectedClass) return [];

    let students = [...(selectedClass.students || [])];

    if (attendanceFilter === "below75") {
      students = students.filter(
        (student) => Number(student.percentage || 0) < 75
      );
    }

    if (attendanceFilter === "critical") {
      students = students.filter(
        (student) => Number(student.percentage || 0) < 40
      );
    }

    if (percentageFilter !== "") {
      const maxPercentage = parseFloat(percentageFilter);

      if (!isNaN(maxPercentage)) {
        students = students.filter(
          (student) =>
            Number(student.percentage || 0) <= maxPercentage
        );
      }
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      students = students.filter((student) => {
        const name =
          `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();

        const mis = String(student.MIS || "").toLowerCase();

        return name.includes(query) || mis.includes(query);
      });
    }

    students.sort((a, b) => {
      if (sortField === "name") {
        const nameA =
          `${a.firstName || ""} ${a.lastName || ""}`.trim();

        const nameB =
          `${b.firstName || ""} ${b.lastName || ""}`.trim();

        return sortOrder === "asc"
          ? nameA.localeCompare(nameB, undefined, {
              sensitivity: "base",
            })
          : nameB.localeCompare(nameA, undefined, {
              sensitivity: "base",
            });
      }

      if (sortField === "mis") {
        return sortOrder === "asc"
          ? String(a.MIS || "").localeCompare(
              String(b.MIS || ""),
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            )
          : String(b.MIS || "").localeCompare(
              String(a.MIS || ""),
              undefined,
              {
                numeric: true,
                sensitivity: "base",
              }
            );
      }

      if (sortField === "percentage") {
        return sortOrder === "asc"
          ? Number(a.percentage || 0) -
              Number(b.percentage || 0)
          : Number(b.percentage || 0) -
              Number(a.percentage || 0);
      }

      return 0;
    });

    return students;
  };

  const filteredStudents = useMemo(
    () => getFilteredStudents(),
    [
      selectedClass,
      percentageFilter,
      searchQuery,
      attendanceFilter,
      sortField,
      sortOrder,
    ]
  );

  const totalStudents = selectedClass?.students?.length || 0;

  const averagePercentage =
    totalStudents > 0
      ? selectedClass.students.reduce(
          (sum, student) =>
            sum + Number(student.percentage || 0),
          0
        ) / totalStudents
      : 0;

  const lowAttendanceCount =
    selectedClass?.students?.filter(
      (student) => Number(student.percentage || 0) < 75
    ).length || 0;

  const criticalAttendanceCount =
    selectedClass?.students?.filter(
      (student) => Number(student.percentage || 0) < 40
    ).length || 0;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const hasFilters =
    percentageFilter !== "" ||
    searchQuery.trim() !== "" ||
    attendanceFilter !== "all";

  if (loading) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-[#142a35] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-48 -top-48 h-[650px] w-[650px] rounded-full border border-[#527c7a]/20" />
          <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full border border-[#9a804f]/10" />
          <div className="absolute -right-56 top-[-160px] h-[650px] w-[650px] rounded-full border border-[#527c7a]/15" />
          <div className="absolute -bottom-56 right-[-180px] h-[700px] w-[700px] rounded-full border border-[#9a804f]/10" />

          <div
            className="absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(180,210,205,0.55) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="absolute left-[25%] top-[20%] h-32 w-32 rounded-full bg-[#527c7a]/10 blur-3xl" />
          <div className="absolute bottom-[20%] right-[20%] h-44 w-44 rounded-full bg-[#9a804f]/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#527c7a]/40 bg-[#203c47]">
              <ClipboardList className="h-6 w-6 animate-pulse text-[#7da9a3]" />
            </div>

            <p className="mt-4 text-sm font-semibold text-[#dce8e5]">
              Loading attendance report
            </p>

            <p className="mt-1 text-xs text-[#8ea5a5]">
              Preparing student attendance data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#142a35] text-[#dce7e4]">
      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[330px] top-[-180px] h-[720px] w-[720px] rounded-full border border-[#527c7a]/20" />

        <div className="absolute -left-[245px] top-[-95px] h-[550px] w-[550px] rounded-full border border-[#527c7a]/10" />

        <div className="absolute -left-[170px] top-[-20px] h-[400px] w-[400px] rounded-full border border-[#9a804f]/10" />

        <div className="absolute -right-[330px] top-[5%] h-[700px] w-[700px] rounded-full border border-[#527c7a]/15" />

        <div className="absolute -right-[235px] top-[14%] h-[500px] w-[500px] rounded-full border border-[#9a804f]/10" />

        <div className="absolute -right-[280px] bottom-[-300px] h-[700px] w-[700px] rounded-full border border-[#527c7a]/15" />

        <div className="absolute left-[7%] top-[22%] h-5 w-5 rotate-45 border border-[#527c7a]/30" />

        <div className="absolute left-[18%] bottom-[15%] h-2 w-2 rounded-full bg-[#9a804f]/50" />

        <div className="absolute right-[14%] top-[28%] h-3 w-3 rotate-45 border border-[#9a804f]/30" />

        <div className="absolute right-[8%] bottom-[19%] h-2 w-2 rounded-full bg-[#527c7a]/50" />

        <div className="absolute left-[45%] top-[11%] h-1.5 w-1.5 rounded-full bg-[#527c7a]/40" />

        <div className="absolute left-[62%] bottom-[9%] h-1.5 w-1.5 rounded-full bg-[#9a804f]/40" />

        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(180,210,205,0.6) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            maskImage:
              "linear-gradient(135deg, black 0%, rgba(0,0,0,.7) 45%, transparent 85%)",
            WebkitMaskImage:
              "linear-gradient(135deg, black 0%, rgba(0,0,0,.7) 45%, transparent 85%)",
          }}
        />

        <div className="absolute -left-32 top-[35%] h-96 w-96 rounded-full bg-[#527c7a]/10 blur-[100px]" />

        <div className="absolute right-[5%] top-[10%] h-80 w-80 rounded-full bg-[#9a804f]/[0.07] blur-[110px]" />

        <div className="absolute bottom-[-80px] left-[35%] h-72 w-72 rounded-full bg-[#527c7a]/[0.07] blur-[100px]" />
      </div>

      {/* PAGE */}

      <main className="relative z-10 mx-auto flex h-full w-full max-w-[1700px] flex-col px-5 py-5 sm:px-7 lg:px-9">

        {/* HEADER */}

        <header className="shrink-0">
          <div className="flex items-start justify-between gap-4">

            <div className="flex items-start gap-3">
              {/* BACK BUTTON */}

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                  mt-1 flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-xl border border-[#39535c]
                  bg-[#1d3540]/90
                  text-[#8da5a3]
                  shadow-lg
                  transition-all duration-200
                  hover:border-[#527c7a]
                  hover:bg-[#294650]
                  hover:text-[#c8dad6]
                  active:scale-95
                "
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-px w-8 bg-[#9a804f]" />

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#76a39d]">
                    Academic analytics
                  </p>
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#edf4f2]">
                  Attendance Report
                </h1>

                <p className="mt-1 text-xs text-[#8ea4a3]">
                  Review attendance performance across your courses and classes.
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-[#39515a] bg-[#1d3540]/80 px-3 py-2 shadow-lg sm:flex">
              <BarChart3 className="h-4 w-4 text-[#79a7a0]" />

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#71898d]">
                  Courses
                </p>

                <p className="text-sm font-semibold text-[#dce8e5]">
                  {report.length}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}

        <div className="mt-5 min-h-0 flex-1">
          <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[240px_285px_minmax(0,1fr)]">

            {/* COURSES */}

            <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#38515a] bg-[#1b333e]/95 shadow-[0_18px_45px_rgba(0,0,0,0.20)] backdrop-blur-sm">
              <div className="shrink-0 border-b border-[#304a54] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#294a50]">
                    <BookOpen className="h-4 w-4 text-[#7da9a3]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-[#e2ecea]">
                      Courses
                    </h2>

                    <p className="text-[10px] text-[#81989a]">
                      Select a course
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {report.length === 0 ? (
                  <div className="flex h-full min-h-40 items-center justify-center text-center">
                    <div>
                      <BookOpen className="mx-auto h-7 w-7 text-[#647b7e]" />

                      <p className="mt-2 text-xs font-medium text-[#8ca09f]">
                        No courses available
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {report.map((course) => {
                      const active =
                        selectedCourse?.courseId === course.courseId;

                      const classCount = course.classes?.length || 0;

                      return (
                        <button
                          key={course.courseId}
                          type="button"
                          onClick={() => selectCourse(course)}
                          className={`
                            group relative w-full rounded-xl border p-3.5
                            text-left transition-all duration-200
                            ${
                              active
                                ? "border-[#527c7a] bg-[#294a4d] shadow-[0_8px_25px_rgba(0,0,0,0.16)]"
                                : "border-[#304952] bg-[#203a45] hover:border-[#48646a] hover:bg-[#27434d]"
                            }
                          `}
                        >
                          {active && (
                            <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#70a39c]" />
                          )}

                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className={`truncate text-sm font-semibold ${
                                  active
                                    ? "text-[#e1efeb]"
                                    : "text-[#cad8d6]"
                                }`}
                              >
                                {course.courseName}
                              </p>

                              <p className="mt-1 font-mono text-[10px] font-semibold tracking-wide text-[#7f9799]">
                                {course.courseCode}
                              </p>
                            </div>

                            <ChevronRight
                              className={`
                                h-4 w-4 shrink-0 transition-all
                                ${
                                  active
                                    ? "translate-x-0 text-[#7da9a3]"
                                    : "-translate-x-1 text-[#60787c] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                }
                              `}
                            />
                          </div>

                          <div className="mt-3 flex items-center gap-1.5">
                            <span className="rounded-md bg-[#2a4149] px-2 py-1 text-[9px] font-semibold text-[#8ca09f]">
                              {classCount}{" "}
                              {classCount === 1
                                ? "class"
                                : "classes"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* CLASSES */}

            <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#38515a] bg-[#1b333e]/95 shadow-[0_18px_45px_rgba(0,0,0,0.20)] backdrop-blur-sm">
              <div className="shrink-0 border-b border-[#304a54] px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#514937]">
                    <GraduationCap className="h-4 w-4 text-[#c0a873]" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-[#e2ecea]">
                      Classes
                    </h2>

                    <p className="truncate text-[10px] text-[#81989a]">
                      {selectedCourse
                        ? selectedCourse.courseName
                        : "Select a course first"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {!selectedCourse ? (
                  <div className="flex h-full min-h-40 items-center justify-center text-center">
                    <div>
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#263e48]">
                        <ChevronRight className="h-5 w-5 text-[#71898d]" />
                      </div>

                      <p className="mt-3 text-xs font-semibold text-[#9badab]">
                        Select a course
                      </p>

                      <p className="mt-1 max-w-[180px] text-[10px] leading-relaxed text-[#748b8e]">
                        Choose a course to view its classes.
                      </p>
                    </div>
                  </div>
                ) : selectedCourse.classes?.length === 0 ? (
                  <div className="flex h-full min-h-40 items-center justify-center text-center">
                    <div>
                      <GraduationCap className="mx-auto h-7 w-7 text-[#647b7e]" />

                      <p className="mt-2 text-xs font-medium text-[#8ca09f]">
                        No classes available
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCourse.classes.map((cls) => {
                      const active =
                        selectedClass?.classId === cls.classId;

                      return (
                        <button
                          key={cls.classId}
                          type="button"
                          onClick={() => selectClass(cls)}
                          className={`
                            group relative w-full rounded-xl border p-3.5
                            text-left transition-all duration-200
                            ${
                              active
                                ? "border-[#527c7a] bg-[#294a4d] shadow-[0_8px_25px_rgba(0,0,0,0.16)]"
                                : "border-[#304952] bg-[#203a45] hover:border-[#48646a] hover:bg-[#27434d]"
                            }
                          `}
                        >
                          {active && (
                            <span className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#70a39c]" />
                          )}

                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p
                                className={`truncate text-sm font-semibold ${
                                  active
                                    ? "text-[#e1efeb]"
                                    : "text-[#cad8d6]"
                                }`}
                              >
                                {cls.className}
                              </p>

                              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#7f9799]">
                                <Users className="h-3 w-3" />

                                <span>
                                  {cls.students?.length || 0} students
                                </span>
                              </div>
                            </div>

                            <ChevronRight
                              className={`
                                mt-0.5 h-4 w-4 shrink-0 transition-all
                                ${
                                  active
                                    ? "text-[#7da9a3]"
                                    : "text-[#60787c] opacity-0 group-hover:opacity-100"
                                }
                              `}
                            />
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-[#344e57] pt-2.5">
                            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#71888b]">
                              Total classes
                            </span>

                            <span className="text-xs font-semibold text-[#a5b7b4]">
                              {cls.totalClasses}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* STUDENT TABLE */}

            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#38515a] bg-[#1b333e]/95 shadow-[0_18px_45px_rgba(0,0,0,0.20)] backdrop-blur-sm">

              {/* HEADER */}

              <div className="shrink-0 border-b border-[#304a54] px-5 py-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#294a50]">
                      <Users className="h-4 w-4 text-[#7da9a3]" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-[#e2ecea]">
                        Student Attendance
                      </h2>

                      <p className="truncate text-[10px] text-[#81989a]">
                        {selectedClass
                          ? `${selectedClass.className} · ${totalStudents} students`
                          : "Select a class to view students"}
                      </p>
                    </div>
                  </div>

                  {selectedClass && (
                    <div className="grid grid-cols-3 gap-2">

                      {/* AVERAGE */}

                      <button
                        type="button"
                        onClick={() =>
                          setAttendanceFilter("all")
                        }
                        className={`
                          min-w-[70px] rounded-lg border px-3 py-2
                          text-left transition-all duration-200
                          ${
                            attendanceFilter === "all"
                              ? "border-[#527c7a] bg-[#294a4d] shadow-md"
                              : "border-[#36545a] bg-[#223f48] hover:border-[#527c7a] hover:bg-[#294a4d]"
                          }
                        `}
                      >
                        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#789094]">
                          Average
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#91bbb4]">
                          {averagePercentage.toFixed(1)}%
                        </p>

                        <p className="mt-0.5 text-[8px] text-[#71888b]">
                          All students
                        </p>
                      </button>

                      {/* BELOW 75% */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleAttendanceFilter("below75")
                        }
                        className={`
                          min-w-[70px] rounded-lg border px-3 py-2
                          text-left transition-all duration-200
                          ${
                            attendanceFilter === "below75"
                              ? "border-[#a9956d] bg-[#494333] shadow-md"
                              : "border-[#594e3b] bg-[#39362c] hover:border-[#a9956d] hover:bg-[#494333]"
                          }
                        `}
                      >
                        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#a9956d]">
                          Below 75%
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#c1aa78]">
                          {lowAttendanceCount}
                        </p>

                        <p className="mt-0.5 text-[8px] text-[#958a6e]">
                          {attendanceFilter === "below75"
                            ? "Click to clear"
                            : "Click to view"}
                        </p>
                      </button>

                      {/* CRITICAL */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleAttendanceFilter("critical")
                        }
                        className={`
                          min-w-[70px] rounded-lg border px-3 py-2
                          text-left transition-all duration-200
                          ${
                            attendanceFilter === "critical"
                              ? "border-[#bd7777] bg-[#4a3035] shadow-md"
                              : "border-[#604345] bg-[#3b2c31] hover:border-[#bd7777] hover:bg-[#4a3035]"
                          }
                        `}
                      >
                        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#bd7777]">
                          Critical
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-[#d18b8b]">
                          {criticalAttendanceCount}
                        </p>

                        <p className="mt-0.5 text-[8px] text-[#a66f73]">
                          {attendanceFilter === "critical"
                            ? "Click to clear"
                            : "Click to view"}
                        </p>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {!selectedClass ? (
                <div className="flex min-h-0 flex-1 items-center justify-center px-6">
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#36505a] bg-[#203a45]">
                      <GraduationCap className="h-6 w-6 text-[#71898d]" />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-[#a9bbb8]">
                      Select a class
                    </h3>

                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#778f91]">
                      Choose a class from the panel on the left to view detailed student attendance.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* FILTER BAR */}

                  <div className="shrink-0 border-b border-[#304a54] bg-[#182f3a]/80 px-5 py-3">
                    <div className="flex flex-col gap-2 xl:flex-row xl:items-center">

                      {/* SEARCH */}

                      <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#70878a]" />

                        <input
                          type="text"
                          placeholder="Search by MIS or student name..."
                          value={searchQuery}
                          onChange={(e) =>
                            setSearchQuery(e.target.value)
                          }
                          className="
                            h-9 w-full rounded-lg
                            border border-[#39535c]
                            bg-[#213b46]
                            pl-9 pr-3
                            text-xs text-[#d7e3e1]
                            outline-none transition
                            placeholder:text-[#70878a]
                            focus:border-[#638f89]
                            focus:ring-2
                            focus:ring-[#527c7a]/20
                          "
                        />
                      </div>

                      {/* PERCENTAGE */}

                      <div className="relative w-full xl:w-48">
                        <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#70878a]" />

                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Attendance ≤ %"
                          value={percentageFilter}
                          onChange={(e) =>
                            setPercentageFilter(e.target.value)
                          }
                          className="
                            h-9 w-full rounded-lg
                            border border-[#39535c]
                            bg-[#213b46]
                            pl-9 pr-3
                            text-xs text-[#d7e3e1]
                            outline-none transition
                            placeholder:text-[#70878a]
                            focus:border-[#638f89]
                            focus:ring-2
                            focus:ring-[#527c7a]/20
                          "
                        />
                      </div>

                      {/* SORT FIELD */}

                      <select
                        value={sortField}
                        onChange={(e) => {
                          setSortField(e.target.value);
                          setSortOrder("asc");
                        }}
                        className="
                          h-9 w-full xl:w-36 rounded-lg
                          border border-[#39535c]
                          bg-[#213b46]
                          px-3
                          text-[10px] font-semibold
                          text-[#a7b8b5]
                          outline-none transition
                          focus:border-[#638f89]
                          focus:ring-2
                          focus:ring-[#527c7a]/20
                        "
                      >
                        <option value="name">
                          Sort: Name
                        </option>

                        <option value="mis">
                          Sort: MIS
                        </option>

                        <option value="percentage">
                          Sort: %
                        </option>
                      </select>

                      {/* SORT ORDER */}

                      <button
                        type="button"
                        onClick={() =>
                          setSortOrder((current) =>
                            current === "asc"
                              ? "desc"
                              : "asc"
                          )
                        }
                        className="
                          flex h-9 items-center justify-center gap-2
                          rounded-lg border border-[#39535c]
                          bg-[#213b46]
                          px-3
                          text-[10px] font-semibold text-[#9db0ad]
                          transition
                          hover:border-[#55757a]
                          hover:bg-[#294650]
                          hover:text-[#d7e3e1]
                        "
                      >
                        {sortOrder === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-[#78a69f]" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-[#78a69f]" />
                        )}

                        {sortField === "name"
                          ? sortOrder === "asc"
                            ? "A → Z"
                            : "Z → A"
                          : sortField === "mis"
                          ? sortOrder === "asc"
                            ? "Low → High"
                            : "High → Low"
                          : sortOrder === "asc"
                          ? "Low → High"
                          : "High → Low"}
                      </button>

                      {/* CLEAR FILTERS */}

                      {hasFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="
                            flex h-9 items-center justify-center gap-1.5
                            rounded-lg border border-[#594046]
                            bg-[#33282e]
                            px-3
                            text-[10px] font-semibold
                            text-[#bd8585]
                            transition
                            hover:border-[#754c52]
                            hover:bg-[#432f35]
                            hover:text-[#d59696]
                          "
                        >
                          <X className="h-3.5 w-3.5" />
                          Clear Filters
                        </button>
                      )}
                    </div>

                    {/* FILTER STATUS */}

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-[9px] text-[#70878a]">
                        Showing{" "}
                        <span className="font-semibold text-[#9db0ad]">
                          {filteredStudents.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-[#9db0ad]">
                          {totalStudents}
                        </span>{" "}
                        students
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-[#294a4d] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#80aaa4]">
                          {sortField === "name"
                            ? sortOrder === "asc"
                              ? "Name A–Z"
                              : "Name Z–A"
                            : sortField === "mis"
                            ? sortOrder === "asc"
                              ? "MIS Low–High"
                              : "MIS High–Low"
                            : sortOrder === "asc"
                            ? "% Low–High"
                            : "% High–Low"}
                        </span>

                        {attendanceFilter === "below75" && (
                          <span className="rounded-md bg-[#494333] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#c1aa78]">
                            Below 75%
                          </span>
                        )}

                        {attendanceFilter === "critical" && (
                          <span className="rounded-md bg-[#4a3035] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#d18b8b]">
                            Critical
                          </span>
                        )}

                        {searchQuery.trim() !== "" && (
                          <span className="rounded-md bg-[#294a4d] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#80aaa4]">
                            Search
                          </span>
                        )}

                        {percentageFilter !== "" && (
                          <span className="rounded-md bg-[#294a4d] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#80aaa4]">
                            Percentage
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TABLE */}

                  <div className="min-h-0 flex-1 overflow-auto">
                    <table className="w-full min-w-[650px] border-collapse">
                      <thead className="sticky top-0 z-20">
                        <tr className="border-b border-[#304a54] bg-[#203b46]">

                          <th
                            onClick={() => handleSort("mis")}
                            className="cursor-pointer px-5 py-3 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-[#80979a] transition hover:text-[#b2c5c1]"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              MIS

                              {sortField === "mis" &&
                                (sortOrder === "asc" ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowDown className="h-3 w-3" />
                                ))}
                            </span>
                          </th>

                          <th
                            onClick={() => handleSort("name")}
                            className="cursor-pointer px-4 py-3 text-left text-[9px] font-bold uppercase tracking-[0.13em] text-[#80979a] transition hover:text-[#b2c5c1]"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              Student

                              {sortField === "name" &&
                                (sortOrder === "asc" ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowDown className="h-3 w-3" />
                                ))}
                            </span>
                          </th>

                          <th className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-[0.13em] text-[#80979a]">
                            Present
                          </th>

                          <th className="px-4 py-3 text-center text-[9px] font-bold uppercase tracking-[0.13em] text-[#80979a]">
                            Total
                          </th>

                          <th
                            onClick={() =>
                              handleSort("percentage")
                            }
                            className="cursor-pointer px-5 py-3 text-right text-[9px] font-bold uppercase tracking-[0.13em] text-[#80979a] transition hover:text-[#b2c5c1]"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              Attendance

                              {sortField === "percentage" &&
                                (sortOrder === "asc" ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowDown className="h-3 w-3" />
                                ))}
                            </span>
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredStudents.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-16 text-center"
                            >
                              <Search className="mx-auto h-7 w-7 text-[#627a7e]" />

                              <p className="mt-3 text-xs font-semibold text-[#9aacaa]">
                                No students found
                              </p>

                              <p className="mt-1 text-[10px] text-[#70878a]">
                                Try adjusting your search or filters.
                              </p>

                              {hasFilters && (
                                <button
                                  type="button"
                                  onClick={clearFilters}
                                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#39535c] bg-[#213b46] px-3 py-2 text-[10px] font-semibold text-[#91aaa7] transition hover:border-[#55757a] hover:bg-[#294650]"
                                >
                                  <X className="h-3 w-3" />
                                  Clear Filters
                                </button>
                              )}
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((stu) => {
                            const percentage = Number(
                              stu.percentage || 0
                            );

                            const isCritical =
                              percentage < 40;

                            const isWarning =
                              percentage >= 40 &&
                              percentage < 75;

                            return (
                              <tr
                                key={stu.id}
                                className="
                                  group
                                  border-b border-[#29434d]
                                  bg-[#1b333e]/60
                                  transition-colors
                                  hover:bg-[#213e49]
                                "
                              >
                                <td className="px-5 py-3">
                                  <span className="font-mono text-xs font-bold tracking-wide text-[#8eaba8]">
                                    {stu.MIS}
                                  </span>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#29434d]">
                                      <CircleUserRound className="h-4 w-4 text-[#789294]" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-semibold text-[#ccd9d7]">
                                        {stu.firstName}{" "}
                                        {stu.lastName}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-[#294a4d] px-2 py-1 text-xs font-semibold text-[#8db7b0]">
                                    {stu.present}
                                  </span>
                                </td>

                                <td className="px-4 py-3 text-center">
                                  <span className="text-xs font-medium text-[#819797]">
                                    {stu.total}
                                  </span>
                                </td>

                                <td className="px-5 py-3">
                                  <div className="flex flex-col items-end gap-1.5">
                                    <span
                                      className={`
                                        text-xs font-bold
                                        ${
                                          isCritical
                                            ? "text-[#d18b8b]"
                                            : isWarning
                                            ? "text-[#c1a66f]"
                                            : "text-[#8db7b0]"
                                        }
                                      `}
                                    >
                                      {percentage.toFixed(2)}%
                                    </span>

                                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#30474f]">
                                      <div
                                        className={`
                                          h-full rounded-full transition-all
                                          ${
                                            isCritical
                                              ? "bg-[#a95e64]"
                                              : isWarning
                                              ? "bg-[#a88d59]"
                                              : "bg-[#5f938c]"
                                          }
                                        `}
                                        style={{
                                          width: `${Math.min(
                                            Math.max(
                                              percentage,
                                              0
                                            ),
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* FOOTER */}

                  <div className="flex shrink-0 items-center justify-between border-t border-[#304a54] bg-[#182f3a]/80 px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[9px] text-[#748b8e]">
                        <span className="h-2 w-2 rounded-full bg-[#5f938c]" />
                        75%+
                      </span>

                      <span className="flex items-center gap-1.5 text-[9px] text-[#748b8e]">
                        <span className="h-2 w-2 rounded-full bg-[#a88d59]" />
                        40–74%
                      </span>

                      <span className="flex items-center gap-1.5 text-[9px] text-[#748b8e]">
                        <span className="h-2 w-2 rounded-full bg-[#a95e64]" />
                        Below 40%
                      </span>
                    </div>

                    <span className="text-[9px] text-[#71888b]">
                      {selectedClass.totalClasses} total classes
                    </span>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 items-center justify-center gap-2 py-2">
          <span className="h-1 w-1 rounded-full bg-[#527c7a]" />

          <span className="h-px w-8 bg-[#38515a]" />

          <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#71888b]">
            IIIT Pune
          </span>

          <span className="h-px w-8 bg-[#38515a]" />

          <span className="h-1 w-1 rounded-full bg-[#9a804f]" />
        </div>
      </main>
    </div>
  );
}