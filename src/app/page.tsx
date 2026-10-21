"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Users,
  Trash2,
  X,
  Camera,
  Handshake,
  LogOut,
  Info,
  Download,
  BarChart3,
} from "lucide-react";

// === ตั้งค่าการเชื่อมต่อ Supabase ของ กก.ตชด.๒๓ ===
const SUPABASE_URL = "https://ijtahcuddkpkpwqvcnsy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqdGFoY3VkZGtwa3B3cXZjbnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0ODI3NDIsImV4cCI6MjEwODA1ODc0Mn0.iGuwk9kJVpzE0VIVUondEjVzJg1EIsVC62Es-3awvtk";

const getSupabase = () => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};

interface ShiftItem {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  type: "attend" | "photo" | "leave";
}

interface MemberItem {
  id: string;
  name: string;
}

export default function TeamCalendarPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [shifts, setShifts] = useState<ShiftItem[]>([]);

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed (9 = ตุลาคม)

  // Modals & UI States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const [activeGroupDetail, setActiveGroupDetail] = useState<{
    date: string;
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    items: ShiftItem[];
  } | null>(null);

  const [showStats, setShowStats] = useState(true);

  const [shiftMemberId, setShiftMemberId] = useState("");
  const [shiftDate, setShiftDate] = useState("2026-10-20");
  const [shiftStartTime, setShiftStartTime] = useState("08:30");
  const [shiftEndTime, setShiftEndTime] = useState("16:30");
  const [shiftTitle, setShiftTitle] = useState("");
  const [shiftType, setShiftType] = useState<"attend" | "photo" | "leave">("attend");

  // ดึงข้อมูลจาก Supabase เมื่อโหลดหน้าเว็บ
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = getSupabase();
      const { data: membersData, error: memberErr } = await supabase.from("members").select("*");
      if (memberErr) throw memberErr;
      if (membersData) {
        setMembers(membersData);
        if (membersData.length > 0 && !shiftMemberId) {
          setShiftMemberId(membersData[0].id);
        }
      }

      const { data: shiftsData, error: shiftErr } = await supabase.from("shifts").select("*");
      if (shiftErr) throw shiftErr;
      if (shiftsData) {
        const formattedShifts: ShiftItem[] = shiftsData.map((s: any) => ({
          id: s.id,
          memberId: s.member_id,
          memberName: s.member_name,
          date: s.date,
          startTime: s.start_time,
          endTime: s.end_time,
          title: s.title,
          type: s.type,
        }));
        setShifts(formattedShifts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    return days;
  };

  const daysArray = getDaysInMonth(currentYear, currentMonth);
  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newId = Date.now().toString();
    const newMember = { id: newId, name: newMemberName.trim() };

    const supabase = getSupabase();
    const { error } = await supabase.from("members").insert([newMember]);
    if (error) {
      alert("เกิดข้อผิดพลาดในการเพิ่มกำลังพล");
      return;
    }

    setMembers([...members, newMember]);
    setNewMemberName("");
  };

  const handleDeleteMember = async (id: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) {
      alert("เกิดข้อผิดพลาดในการลบกำลังพล");
      return;
    }

    await supabase.from("shifts").delete().eq("member_id", id);

    setMembers(members.filter((m) => m.id !== id));
    setShifts(shifts.filter((s) => s.memberId !== id));
    if (selectedMember === id) setSelectedMember("all");
  };

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftTitle.trim()) return;
    const member = members.find((m) => m.id === shiftMemberId);
    if (!member) return;

    const newId = Date.now().toString();
    const newShiftDb = {
      id: newId,
      member_id: member.id,
      member_name: member.name,
      date: shiftDate,
      start_time: shiftStartTime,
      end_time: shiftEndTime,
      title: shiftTitle.trim(),
      type: shiftType,
    };

    const supabase = getSupabase();
    const { error } = await supabase.from("shifts").insert([newShiftDb]);
    if (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกตารางงาน");
      return;
    }

    setShifts([
      ...shifts,
      {
        id: newId,
        memberId: member.id,
        memberName: member.name,
        date: shiftDate,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        title: shiftTitle.trim(),
        type: shiftType,
      },
    ]);

    setShiftTitle("");
    setIsShiftModalOpen(false);
  };

  const handleDeleteShift = async (shiftId: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.from("shifts").delete().eq("id", shiftId);
    if (error) {
      alert("เกิดข้อผิดพลาดในการลบภารกิจ");
      return;
    }

    const updatedShifts = shifts.filter((s) => s.id !== shiftId);
    setShifts(updatedShifts);

    if (activeGroupDetail) {
      const remainingItems = activeGroupDetail.items.filter((item) => item.id !== shiftId);
      if (remainingItems.length === 0) {
        setActiveGroupDetail(null);
      } else {
        setActiveGroupDetail({
          ...activeGroupDetail,
          items: remainingItems,
        });
      }
    }
  };

  const formatThaiTime = (timeStr: string) => {
    if (!timeStr) return "";
    const cleanTime = timeStr.replace(/\s*น\.?$/i, "").trim();
    const [hours, minutes] = cleanTime.split(/[:.]/);
    if (!hours) return timeStr;
    const formattedHours = hours.padStart(2, "0");
    const formattedMinutes = (minutes || "00").padStart(2, "0");
    return `${formattedHours}.${formattedMinutes} น.`;
  };

  const handleExportCSV = () => {
    if (shifts.length === 0) {
      alert("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    let csvContent = "\uFEFFชื่อ-นามสกุล,วันที่,เวลาเริ่ม,เวลาสิ้นสุด,ประเภทภารกิจ,รายละเอียด\n";

    shifts.forEach((s) => {
      const typeLabel =
        s.type === "attend" ? "ร่วมงาน" : s.type === "photo" ? "ช่างภาพ" : "การลา";
      const row = [
        `"${s.memberName}"`,
        s.date,
        `"${formatThaiTime(s.startTime)}"`,
        `"${formatThaiTime(s.endTime)}"`,
        typeLabel,
        `"${s.title}"`,
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `volunteer-schedule-${currentYear}-${currentMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFirstNameOnly = (fullName: string) => {
    if (!fullName) return "";
    const nameWithoutRank = fullName
      .replace(
        /^(พ\.ต\.ท\.หญิง|พ\.ต\.ท\.|ร\.ต\.อ\.|ร\.ต\.ท\.|ร\.ต\.ต\.|ด\.ต\.หญิง|ด\.ต\.|จ\.ส\.ต\.|ส\.ต\.อ\.|ส\.ต\.ท\.|ส\.ต\.ต\.|นาย|นาง|นางสาว)\s*/,
        ""
      )
      .trim();
    const parts = nameWithoutRank.split(/\s+/);
    return parts[0] || fullName;
  };

  const currentMonthPrefix = `${currentYear}-${(currentMonth + 1).toString().padStart(2, "0")}`;
  const monthShifts = shifts.filter((s) => s.date.startsWith(currentMonthPrefix));

  const totalAttend = monthShifts.filter((s) => s.type === "attend").length;
  const totalPhoto = monthShifts.filter((s) => s.type === "photo").length;
  const totalLeave = monthShifts.filter((s) => s.type === "leave").length;
  const totalAllShifts = monthShifts.length;

  const memberStats = members.map((m) => {
    const mShifts = monthShifts.filter((s) => s.memberId === m.id);
    return {
      id: m.id,
      name: m.name,
      attendCount: mShifts.filter((s) => s.type === "attend").length,
      photoCount: mShifts.filter((s) => s.type === "photo").length,
      leaveCount: mShifts.filter((s) => s.type === "leave").length,
      totalCount: mShifts.length,
    };
  });

  const filteredShifts =
    selectedMember === "all" ? shifts : shifts.filter((s) => s.memberId === selectedMember);

  const getTaskStyle = (type: string) => {
    switch (type) {
      case "attend":
        return "bg-sky-500/10 border-sky-300 text-sky-900 hover:bg-sky-500/20";
      case "photo":
        return "bg-amber-500/15 border-amber-300 text-amber-950 font-medium hover:bg-amber-500/25";
      case "leave":
        return "bg-rose-500/15 border-rose-300 text-rose-950 font-medium hover:bg-rose-500/25";
      default:
        return "bg-slate-100 border-slate-200 text-slate-800";
    }
  };

  const getTaskBadge = (type: string) => {
    switch (type) {
      case "attend":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-700 bg-sky-100 px-1 py-0.5 rounded">
            <Handshake className="w-2.5 h-2.5" /> ร่วมงาน
          </span>
        );
      case "photo":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-200 px-1 py-0.5 rounded">
            <Camera className="w-2.5 h-2.5" /> ช่างภาพ
          </span>
        );
      case "leave":
        return (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-800 bg-rose-200 px-1 py-0.5 rounded">
            <LogOut className="w-2.5 h-2.5" /> การลา
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            ตารางปฏิบัติงานจิตอาสา
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">ระบบจัดการกะงานและภารกิจจิตอาสา กก.ตชด.๒๓ (ออนไลน์)</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
              showStats
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <BarChart3 className="w-4 h-4" /> สถิติประจำเดือน
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition shadow-sm"
            title="ดาวน์โหลดไฟล์ Excel / CSV"
          >
            <Download className="w-4 h-4" /> ส่งออก Excel
          </button>

          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition"
          >
            <Users className="w-4 h-4 text-slate-600" />
            กำลังพล ({members.length})
          </button>

          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px]"
          >
            <option value="all">กำลังพลทุกนาย</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Calendar Main */}
      <main className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg border border-slate-200 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-base md:text-lg px-2">
              {monthNames[currentMonth]} {currentYear + 543}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg border border-slate-200 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> ลงตารางงาน
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-100/50 text-center text-xs font-semibold text-slate-500 py-2.5">
          <div>อา.</div>
          <div>จ.</div>
          <div>อ.</div>
          <div>พ.</div>
          <div>พฤ.</div>
          <div>ศ.</div>
          <div>ส.</div>
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/20">
          {daysArray.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[100px] md:min-h-[130px] bg-slate-50/40" />;
            }

            const formattedDay = day < 10 ? `0${day}` : `${day}`;
            const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
            const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

            const dayShifts = filteredShifts.filter((s) => s.date === dateStr);

            const groupedShiftsMap: { [key: string]: ShiftItem[] } = {};
            dayShifts.forEach((s) => {
              const groupKey = `${s.title}_${s.type}_${s.startTime}`;
              if (!groupedShiftsMap[groupKey]) {
                groupedShiftsMap[groupKey] = [];
              }
              groupedShiftsMap[groupKey].push(s);
            });

            const groupedShifts = Object.values(groupedShiftsMap);
            const isToday = currentYear === 2026 && currentMonth === 9 && day === 20;

            return (
              <div key={day} className={`p-1.5 md:p-2 min-h-[100px] md:min-h-[130px] transition ${isToday ? "bg-blue-50/40" : "bg-white"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-xs font-semibold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-blue-600 text-white" : "text-slate-600"
                    }`}
                  >
                    {day}
                  </span>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[100px]">
                  {groupedShifts.map((group, gIdx) => {
                    const firstItem = group[0];
                    const namesSummary = group.map((item) => getFirstNameOnly(item.memberName)).join(", ");

                    return (
                      <div
                        key={gIdx}
                        onClick={() =>
                          setActiveGroupDetail({
                            date: dateStr,
                            title: firstItem.title,
                            type: firstItem.type,
                            startTime: firstItem.startTime,
                            endTime: firstItem.endTime,
                            items: group,
                          })
                        }
                        className={`text-[11px] p-1.5 rounded-md border cursor-pointer transition ${getTaskStyle(firstItem.type)}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          {getTaskBadge(firstItem.type)}
                          <span className="text-[9px] text-slate-500 font-medium">
                            {formatThaiTime(firstItem.startTime)}
                          </span>
                        </div>

                        <div className="font-semibold text-slate-900 truncate leading-tight">
                          {namesSummary}
                        </div>
                        <div className="text-[10px] text-slate-600 truncate">
                          {firstItem.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* สรุปสถิติประจำเดือน */}
      {showStats && (
        <section className="max-w-7xl mx-auto space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              สรุปสถิติประจำเดือน {monthNames[currentMonth]} {currentYear + 543}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl">
                <span className="text-xs text-sky-700 font-medium block">ร่วมงานทั้งหมด</span>
                <span className="text-2xl font-bold text-sky-900">{totalAttend} <span className="text-xs font-normal">ครั้ง</span></span>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl">
                <span className="text-xs text-amber-800 font-medium block">ภารกิจช่างภาพ</span>
                <span className="text-2xl font-bold text-amber-950">{totalPhoto} <span className="text-xs font-normal">ครั้ง</span></span>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
                <span className="text-xs text-rose-800 font-medium block">สถิติการลา</span>
                <span className="text-2xl font-bold text-rose-950">{totalLeave} <span className="text-xs font-normal">ครั้ง</span></span>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-xs text-slate-600 font-medium block">รวมภารกิจทั้งหมด</span>
                <span className="text-2xl font-bold text-slate-900">{totalAllShifts} <span className="text-xs font-normal">รายการ</span></span>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <h3 className="text-xs font-semibold text-slate-500 mb-2">ตารางสรุปการปฏิบัติงานรายบุคคล</h3>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                    <th className="p-2.5 font-semibold">ชื่อ-นามสกุล</th>
                    <th className="p-2.5 text-center font-semibold text-sky-700">ร่วมงาน</th>
                    <th className="p-2.5 text-center font-semibold text-amber-800">ช่างภาพ</th>
                    <th className="p-2.5 text-center font-semibold text-rose-800">การลา</th>
                    <th className="p-2.5 text-center font-semibold text-slate-900">รวม (ครั้ง)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {memberStats.map((ms) => (
                    <tr key={ms.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-2.5 font-medium text-slate-800">{ms.name}</td>
                      <td className="p-2.5 text-center text-slate-700">{ms.attendCount || "-"}</td>
                      <td className="p-2.5 text-center text-slate-700">{ms.photoCount || "-"}</td>
                      <td className="p-2.5 text-center font-medium text-rose-600">{ms.leaveCount || "-"}</td>
                      <td className="p-2.5 text-center font-bold text-slate-900">{ms.totalCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Modal ป๊อบอัพรายละเอียดภารกิจ */}
      {activeGroupDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Info className="w-5 h-5 text-blue-600" /> รายละเอียดภารกิจ
              </h3>
              <button onClick={() => setActiveGroupDetail(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">ภารกิจ / การลา</span>
                <span className="font-semibold text-slate-800 text-base">{activeGroupDetail.title}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">วันที่</span>
                  <span className="font-medium text-slate-700">{activeGroupDetail.date}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">เวลาปฏิบัติงาน</span>
                  <span className="font-medium text-slate-700">
                    {formatThaiTime(activeGroupDetail.startTime)} - {formatThaiTime(activeGroupDetail.endTime)}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1 font-medium">ประเภท</span>
                {getTaskBadge(activeGroupDetail.type)}
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1.5 font-medium">กำลังพลที่ปฏิบัติงานร่วมกัน ({activeGroupDetail.items.length} นาย)</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {activeGroupDetail.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                      <span className="font-medium text-slate-800">{item.memberName}</span>
                      <button
                        onClick={() => handleDeleteShift(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="ลบรายชื่อนี้ออก"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal ลงตารางงานใหม่ */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> ลงตารางงาน / ภารกิจ
              </h2>
              <button onClick={() => setIsShiftModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShift} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ผู้รับผิดชอบ / กำลังพล</label>
                <select
                  value={shiftMemberId}
                  onChange={(e) => setShiftMemberId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">วันที่ปฏิบัติงาน</label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ประเภทภารกิจ / การลา</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setShiftType("attend")}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition ${
                      shiftType === "attend"
                        ? "bg-sky-500 text-white border-sky-600 ring-2 ring-sky-300"
                        : "bg-sky-50 text-sky-800 border-sky-200"
                    }`}
                  >
                    <Handshake className="w-3.5 h-3.5" /> ร่วมงาน
                  </button>

                  <button
                    type="button"
                    onClick={() => setShiftType("photo")}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition ${
                      shiftType === "photo"
                        ? "bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-300"
                        : "bg-amber-50 text-amber-900 border-amber-200"
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" /> ช่างภาพ
                  </button>

                  <button
                    type="button"
                    onClick={() => setShiftType("leave")}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition ${
                      shiftType === "leave"
                        ? "bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300"
                        : "bg-rose-50 text-rose-900 border-rose-200"
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" /> การลา
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">รายละเอียดภารกิจ / สาเหตุการลา</label>
                <input
                  type="text"
                  placeholder="เช่น ลาป่วย, ลากิจ, พิธีมอบทุนการศึกษา"
                  value={shiftTitle}
                  onChange={(e) => setShiftTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm mt-2"
              >
                บันทึกตารางงาน
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal จัดการกำลังพล */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" /> รายชื่อกำลังพล ({members.length} นาย)
              </h2>
              <button onClick={() => setIsMemberModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mb-4 flex gap-2 pb-4 border-b border-slate-100">
              <input
                type="text"
                placeholder="ยศ และ ชื่อ-นามสกุล"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition shrink-0"
              >
                เพิ่ม
              </button>
            </form>

            <div className="overflow-y-auto flex-1 pr-1 space-y-1.5">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-sm"
                >
                  <span className="font-medium text-slate-800">{m.name}</span>
                  <button
                    onClick={() => handleDeleteMember(m.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition"
                    title="ลบรายชื่อ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}