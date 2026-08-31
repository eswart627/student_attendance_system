import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import DashboardLayout from "@/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Clock3,
  Mail,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { user, token, offset } = useContext(AuthContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [duration, setDuration] = useState(3);

  const [time, setTime] = useState(Date.now() + offset);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now() + offset);
    }, 1000);

    return () => clearInterval(interval);
  }, [offset]);

  // Fetch courses
  useEffect(() => {
    if (!token) return;

    api
      .get("/teacher/sessions/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data.courses || []))
      .catch((err) => console.error(err));
  }, [token]);

  const toggleClass = (cls) => {
    setSelectedClasses((prev) =>
      prev.includes(cls)
        ? prev.filter((c) => c !== cls)
        : [...prev, cls]
    );
  };

  const handleStartSession = () => {
    if (!selectedCourse || selectedClasses.length === 0) return;

    const payload = {
      courseId: selectedCourse.id,
      classIds: selectedClasses.map((cls) => cls.id),
      duration,
    };

    api
      .post("/teacher/sessions/start", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const session = res.data.session;
        navigate(`/session/${session.id}`, {
          state: { session },
        });
      })
      .catch((err) => console.error(err));
  };

  const initials = `${user?.firstName?.[0] || ""}${
    user?.lastName?.[0] || ""
  }`;

  const totalClasses = courses.reduce(
    (total, course) => total + (course.Classes?.length || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="relative min-h-screen overflow-hidden bg-[#dfe4e1] text-[#172d38]">

        {/* =========================================================
            BACKGROUND DESIGN
        ========================================================== */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">

          {/* Large subtle circles */}
          <div className="absolute -left-[260px] top-[12%] h-[620px] w-[620px] rounded-full border border-[#172d38]/[0.07]" />

          <div className="absolute -left-[190px] top-[20%] h-[480px] w-[480px] rounded-full border border-[#527c7a]/[0.09]" />

          <div className="absolute -right-[280px] bottom-[5%] h-[650px] w-[650px] rounded-full border border-[#9a804f]/[0.08]" />

          <div className="absolute -right-[190px] bottom-[14%] h-[480px] w-[480px] rounded-full border border-[#9a804f]/[0.06]" />

          {/* Soft blobs */}
          <div className="absolute -left-48 top-0 h-[450px] w-[450px] rounded-full bg-[#527c7a]/[0.08] blur-3xl" />

          <div className="absolute -bottom-48 right-0 h-[500px] w-[500px] rounded-full bg-[#9a804f]/[0.07] blur-3xl" />

          {/* Fine dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(23,45,56,0.28) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
              maskImage:
                "linear-gradient(to bottom right, black, transparent 70%)",
              WebkitMaskImage:
                "linear-gradient(to bottom right, black, transparent 70%)",
            }}
          />

          {/* Geometric accents */}
          <div className="absolute left-[8%] top-[17%] h-3 w-3 rotate-45 border border-[#527c7a]/30" />

          <div className="absolute right-[11%] top-[28%] h-2 w-2 rounded-full bg-[#9a804f]/35" />

          <div className="absolute bottom-[18%] left-[12%] h-2 w-2 rounded-full bg-[#527c7a]/30" />

          <div className="absolute bottom-[25%] right-[7%] h-12 w-12 rotate-45 border border-[#172d38]/[0.06]" />
        </div>

        {/* =========================================================
            MAIN CONTENT
        ========================================================== */}
        <main className="relative z-10 mx-auto max-w-6xl px-5 py-6 sm:px-7 lg:px-9">

          {/* =======================================================
              FACULTY PROFILE
          ======================================================== */}
          <section className="relative overflow-hidden rounded-[24px] border border-[#c3cdca] bg-[#172d38] shadow-[0_14px_45px_rgba(23,45,56,0.14)]">

            {/* Hero decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">

              <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full border-[45px] border-[#527c7a]/10" />

              <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border border-[#9a804f]/15" />

              <div className="absolute bottom-[-110px] left-[35%] h-56 w-56 rotate-45 border border-white/[0.04]" />

              <div
                className="absolute inset-0 opacity-[0.035]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "42px 42px",
                }}
              />
            </div>

            <div className="relative px-6 py-6 sm:px-8 sm:py-7 lg:px-9">

              {/* Faculty identity */}
              <div className="flex items-center gap-4">

                <Avatar className="h-16 w-16 shrink-0 border-2 border-white/15 shadow-lg">
                  <AvatarFallback className="bg-[#e4e8e5] text-lg font-semibold text-[#172d38]">
                    {initials || "FA"}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">

                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#86aaa6]">
                    Faculty
                  </p>

                  <h1 className="truncate text-2xl font-semibold tracking-tight text-[#f1f3f1] sm:text-[28px]">
                    {user?.firstName
                      ? `${user.firstName} ${user.lastName || ""}`
                      : "Faculty Member"}
                  </h1>

                  <p className="mt-1 text-sm text-[#aab9b7]">
                    {user?.department || "Faculty Department"}
                  </p>

                </div>
              </div>

              {/* Faculty details */}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4">

                {user?.email && (
                  <div className="flex items-center gap-2 text-xs text-[#b7c5c2]">
                    <Mail className="h-3.5 w-3.5 text-[#86aaa6]" />
                    <span>{user.email}</span>
                  </div>
                )}

                {user?.facultyId && (
                  <div className="flex items-center gap-2 text-xs text-[#b7c5c2]">
                    <span className="text-[#718884]">
                      Faculty ID
                    </span>

                    <span className="font-mono font-medium text-[#b7c5c2]">
                      {user.facultyId}
                    </span>
                  </div>
                )}

              </div>

            </div>
          </section>

          {/* =======================================================
    ATTENDANCE
======================================================= */}
<section className="mt-6">
  <div className="mb-3 flex items-center gap-3">
    <span className="h-px w-7 bg-[#9a804f]" />

    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#527c7a]">
      Attendance
    </span>
  </div>

  <Card className="overflow-hidden rounded-2xl border-[#c4ceca] bg-[#edf0ee]/95 shadow-[0_10px_35px_rgba(23,45,56,0.07)]">
    <CardContent className="p-5 sm:p-6">

      {/* Top row */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Course */}
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7a8783]">
                Course
              </p>

              <p className="mt-1 text-sm font-semibold text-[#172d38]">
                Choose a course
              </p>
            </div>

            {selectedCourse && (
              <span className="font-mono text-[10px] text-[#7b8985]">
                {selectedCourse.code}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;

              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedClasses([]);
                  }}
                  className={`group flex min-w-[170px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                    isSelected
                      ? "border-[#527c7a] bg-[#dce8e5] shadow-[0_3px_10px_rgba(82,124,122,0.08)]"
                      : "border-[#cbd3d0] bg-[#f5f6f5] hover:border-[#a3b5b1] hover:bg-white"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold ${
                      isSelected
                        ? "bg-[#527c7a] text-white"
                        : "bg-[#e0e5e2] text-[#53635f]"
                    }`}
                  >
                    {course.code?.slice(0, 2)?.toUpperCase() || "CR"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-xs font-semibold ${
                        isSelected
                          ? "text-[#294746]"
                          : "text-[#34464b]"
                      }`}
                    >
                      {course.name}
                    </p>

                    <p className="mt-0.5 font-mono text-[9px] text-[#7d8985]">
                      {course.code}
                    </p>
                  </div>

                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-[#527c7a]" />
                  )}
                </button>
              );
            })}

            {courses.length === 0 && (
              <p className="text-xs text-[#7b8783]">
                No courses available.
              </p>
            )}
          </div>
        </div>

        {/* Session controls */}
        {selectedCourse && (
          <div className="flex shrink-0 items-end gap-2 border-t border-[#d5dcda] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a8783]">
                Duration
              </label>

              <select
                value={duration}
                onChange={(e) =>
                  setDuration(Number(e.target.value))
                }
                className="h-10 w-[130px] rounded-lg border border-[#c4ceca] bg-[#f5f6f5] px-3 text-xs font-semibold text-[#293b40] outline-none transition-all focus:border-[#527c7a] focus:ring-4 focus:ring-[#527c7a]/10"
              >
                {Array.from(
                  { length: 10 },
                  (_, i) => i + 1
                ).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "minute" : "minutes"}
                  </option>
                ))}
              </select>
            </div>

            <Button
              disabled={selectedClasses.length === 0}
              className="h-10 rounded-lg bg-[#172d38] px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#203b45] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleStartSession}
            >
              Start attendance
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Class selection */}
      {selectedCourse && (
        <div className="mt-5 border-t border-[#d4dbd8] pt-5">

          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7a8783]">
                Class
              </p>

              <p className="mt-1 text-xs text-[#74807c]">
                Select the class for this session.
              </p>
            </div>

            {selectedClasses.length > 0 && (
              <span className="rounded-full bg-[#dce8e5] px-2.5 py-1 text-[10px] font-semibold text-[#527c7a]">
                {selectedClasses.length} selected
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedCourse.Classes?.map((cls) => {
              const isSelected =
                selectedClasses.includes(cls);

              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => toggleClass(cls)}
                  className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 transition-all ${
                    isSelected
                      ? "border-[#527c7a] bg-[#dce8e5]"
                      : "border-[#cbd3d0] bg-[#f5f6f5] hover:border-[#a3b5b1] hover:bg-white"
                  }`}
                >
                  <span className="text-xs font-semibold text-[#34464b]">
                    {cls.name}
                  </span>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-[#527c7a]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
</section>


          {/* =======================================================
              FOOTER
          ======================================================== */}
          <div className="mt-8 flex items-center justify-center gap-2 pb-3">

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
    </DashboardLayout>
  );
}