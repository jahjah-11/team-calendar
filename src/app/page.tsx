"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, User, Calendar as CalendarIcon, Users, Trash2, X, Camera, Handshake, LogOut } from "lucide-react";

// รายชื่อกำลังพล (15 นาย)
const INITIAL_MEMBERS = [
  { id: "1", name: "พ.ต.ท.หญิง ดวงกมล สรไกร" },
  { id: "2", name: "ร.ต.อ. ปรีชา จูมแพง" },
  { id: "3", name: "ร.ต.ท. ชัยชนะ ภูอุภัย" },
  { id: "4", name: "ร.ต.ท. อนุกูล กาเผือก" },
  { id: "5", name: "ร.ต.ท. ณัฐศ์ธนันท์ โกษาแสง" },
  { id: "6", name: "ด.ต.หญิง ภัณฑิลา เสนาศรี" },
  { id: "7", name: "ด.ต. เทพสุพรรณ ไชยรบ" },
  { id: "8", name: "ร.ต.ต. อัครา สุวรรณชะลา" },
  { id: "9", name: "ด.ต. เรวัฒน์ นรสาร" },
  { id: "10", name: "จ.ส.ต. ทรงชัย แสงนาโก" },
  { id: "11", name: "ส.ต.อ. ทินกรณ์ หล่าบุตรศรี" },
  { id: "12", name: "ส.ต.อ. สุริโย กิ่งมาลา" },
  { id: "13", name: "ส.ต.ท. อภิเชษฐ์ ทันบาล" },
  { id: "14", name: "ส.ต.ท. ธนพัฒน์ ยืนยง" },
  { id: "15", name: "ส.ต.ต. บุญตะวัน เรืองธรรม" },
];

const INITIAL_SHIFTS = [
  { 
    id: "101", 
    memberId: "1", 
    memberName: "พ.ต.ท.หญิง ดวงกมล สรไกร", 
    date: "2026-10-20", 
    startTime: "08:30",
    endTime: "12:00",
    title: "พิธีเปิดโครงการอาสาสมัคร", 
    type: "attend"
  },
  { 
    id: "102", 
    memberId: "7", 
    memberName: "ด.ต. เทพสุพรรณ ไชยรบ", 
    date: "2026-10-20", 
    startTime: "08:30",
    endTime: "16:30",
    title: "ถ่ายภาพกิจกรรมพิธีเปิด", 
    type: "photo"
  },
  { 
    id: "103", 
    memberId: "11", 
    memberName: "ส.ต.อ. ทินกรณ์ หล่าบุตรศรี", 
    date: "2026-10-21", 
    startTime: "08:00",
    endTime: "16:00",
    title: "ลาป่วย", 
    type: "leave"
  },
];

export default function TeamCalendarPage() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);

  // กำหนดค่าเดือนปัจจุบัน
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 9 คือ ตุลาคม

  // State สำหรับ Modal
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftMemberId, setShiftMemberId] = useState(members[0]?.id || "1");
  const [shiftDate, setShiftDate] = useState("2026-10-20");
  const [shiftStartTime, setShiftStartTime] = useState("08:30");
  const [shiftEndTime, setShiftEndTime] = useState("16:30");
  const [shiftTitle, setShiftTitle] = useState("");
  const [shiftType, setShiftType] = useState<"attend" | "photo" | "general" | "leave">("attend");

  // ฟังก์ชันคำนวณวันในเดือนแบบเต็มเดือน
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIndex = date.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }

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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setMembers([...members, { id: Date.now().toString(), name: newMemberName.trim() }]);
    setNewMemberName("");
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setShifts(shifts.filter((s) => s.memberId !== id));
    if (selectedMember === id) setSelectedMember("all");
  };

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftTitle.trim()) return;
    const member = members.find((m) => m.id === shiftMemberId);
    if (!member) return;

    setShifts([
      ...shifts,
      {
        id: Date.now().toString(),
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

  const handleDeleteShift = (shiftId: string) => {
    setShifts(shifts.filter((s) => s.id !== shiftId));
  };

  // ฟังก์ชันดึงเฉพาะ "ชื่อ" ตัดยศ คำนำหน้า และนามสกุลออก
  const getFirstNameOnly = (fullName: string) => {
    if (!fullName) return "";
    // ตัดยศและคำนำหน้าออก
    const nameWithoutRank = fullName.replace(/^(พ\.ต\.ท\.หญิง|พ\.ต\.ท\.|ร\.ต\.อ\.|ร\.ต\.ท\.|ร\.ต\.ต\.|ด\.ต\.หญิง|ด\.ต\.|จ\.ส\.ต\.|ส\.ต\.อ\.|ส\.ต\.ท\.|ส\.ต\.ต\.|นาย|นาง|นางสาว)\s*/, "").trim();
    // แยกตามช่องว่าง แล้วดึงเฉพาะชื่อแรก
    const parts = nameWithoutRank.split(/\s+/);
    return parts[0] || fullName;
  };

  const filteredShifts =
    selectedMember === "all" ? shifts : shifts.filter((s) => s.memberId === selectedMember);

  const getTaskStyle = (type: string) => {
    switch (type) {
      case "attend":
        return "bg-sky-500/10 border-sky-300 text-sky-900";
      case "photo":
        return "bg-amber-500/15 border-amber-300 text-amber-950 font-medium";
      case "leave":
        return "bg-rose-500/15 border-rose-300 text-rose-950 font-medium";
      default:
        return "bg-slate-100 border-slate-200 text-slate-800";
    }
  };

  const getTaskBadge = (type: string) => {
    switch (type) {
      case "attend":
        return <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-sky-700 bg-sky-100 px-1 py-0.5 rounded"><Handshake className="w-2.5 h-2.5" /> ร่วมงาน</span>;
      case "photo":
        return <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-200 px-1 py-0.5 rounded"><Camera className="w-2.5 h-2.5" /> ช่างภาพ</span>;
      case "leave":
        return <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-800 bg-rose-200 px-1 py-0.5 rounded"><LogOut className="w-2.5 h-2.5" /> การลา</span>;
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
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">ระบบจัดการกะงานและภารกิจจิตอาสา กก.ตชด.๒๓</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="flex items-center gap-1 font-medium text-sky-700">
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" /> ร่วมงาน
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-medium text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> ช่างภาพ
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-medium text-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> การลา
            </span>
          </div>

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

      {/* Main Calendar Card */}
      <main className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Calendar Controller */}
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

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-100/50 text-center text-xs font-semibold text-slate-500 py-2.5">
          <div>อา.</div>
          <div>จ.</div>
          <div>อ.</div>
          <div>พ.</div>
          <div>พฤ.</div>
          <div>ศ.</div>
          <div>ส.</div>
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/20">
          {daysArray.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[100px] md:min-h-[130px] bg-slate-50/40" />;
            }

            const formattedDay = day < 10 ? `0${day}` : `${day}`;
            const formattedMonth = currentMonth + 1 < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
            const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

            const dayShifts = filteredShifts.filter((s) => s.date === dateStr);
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

                {/* Shift Items */}
                <div className="space-y-1 overflow-y-auto max-h-[100px]">
                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`text-[11px] p-1.5 rounded-md border relative group transition ${getTaskStyle(shift.type)}`}
                    >
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition"
                        title="ลบภารกิจ"
                      >
                        <X className="w-3 h-3" />
                      </button>

                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        {getTaskBadge(shift.type)}
                        {shift.startTime && (
                          <span className="text-[9px] text-slate-500 font-medium">
                            {shift.startTime}
                          </span>
                        )}
                      </div>

                      {/* แสดงเฉพาะชื่อเท่านั้น */}
                      <div className="font-semibold text-slate-900 truncate leading-tight" title={shift.memberName}>
                        {getFirstNameOnly(shift.memberName)}
                      </div>
                      <div className="text-[10px] text-slate-600 truncate" title={shift.title}>
                        {shift.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal ลงตารางงานใหม่ */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> ลงตารางเวร / ภารกิจ
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