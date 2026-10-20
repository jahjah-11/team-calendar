"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, User, Calendar as CalendarIcon, Users, Trash2, X, Camera, Handshake } from "lucide-react";

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

// ตัวอย่างตารางงานที่มีสีภารกิจ
const INITIAL_SHIFTS = [
  { 
    id: "101", 
    memberId: "1", 
    memberName: "พ.ต.ท.หญิง ดวงกมล สรไกร", 
    date: "2026-10-20", 
    title: "พิธีเปิดโครงการอาสาสมัคร", 
    type: "attend" // สีฟ้า: ร่วมงาน
  },
  { 
    id: "102", 
    memberId: "7", 
    memberName: "ด.ต. เทพสุพรรณ ไชยรบ", 
    date: "2026-10-20", 
    title: "ถ่ายภาพกิจกรรมพิธีเปิด", 
    type: "photo" // สีเหลือง: ช่างภาพ
  },
  { 
    id: "103", 
    memberId: "11", 
    memberName: "ส.ต.อ. ทินกรณ์ หล่าบุตรศรี", 
    date: "2026-10-21", 
    title: "เวรประจำจุดตรวจ", 
    type: "general" // ปกติ
  },
];

export default function TeamCalendarPage() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [shifts, setShifts] = useState(INITIAL_SHIFTS);

  // State สำหรับ Modal จัดการกำลังพล
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  // State สำหรับ Modal ลงตารางงาน
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftMemberId, setShiftMemberId] = useState(members[0]?.id || "1");
  const [shiftDate, setShiftDate] = useState("2026-10-20");
  const [shiftTitle, setShiftTitle] = useState("");
  const [shiftType, setShiftType] = useState<"attend" | "photo" | "general">("attend");

  // ฟังก์ชันเพิ่มกำลังพลใหม่
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
    };

    setMembers([...members, newMember]);
    setNewMemberName("");
  };

  // ฟังก์ชันลบกำลังพล
  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    setShifts(shifts.filter((s) => s.memberId !== id));
    if (selectedMember === id) setSelectedMember("all");
  };

  // ฟังก์ชันเพิ่มตารางงานใหม่
  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftTitle.trim()) return;

    const member = members.find((m) => m.id === shiftMemberId);
    if (!member) return;

    const newShift = {
      id: Date.now().toString(),
      memberId: member.id,
      memberName: member.name,
      date: shiftDate,
      title: shiftTitle.trim(),
      type: shiftType,
    };

    setShifts([...shifts, newShift]);
    setShiftTitle("");
    setIsShiftModalOpen(false);
  };

  // ฟังก์ชันลบตารางงาน
  const handleDeleteShift = (shiftId: string) => {
    setShifts(shifts.filter((s) => s.id !== shiftId));
  };

  // กรองตารางงานตามสมาชิก
  const filteredShifts =
    selectedMember === "all" ? shifts : shifts.filter((s) => s.memberId === selectedMember);

  // สไตล์ภารกิจ
  const getTaskStyle = (type: string) => {
    switch (type) {
      case "attend":
        return "bg-sky-500/10 border-sky-400 text-sky-900"; // สีฟ้า: ร่วมงาน
      case "photo":
        return "bg-amber-500/20 border-amber-400 text-amber-950 font-medium"; // สีเหลือง: ช่างภาพ
      default:
        return "bg-slate-100 border-slate-200 text-slate-800";
    }
  };

  const getTaskBadge = (type: string) => {
    switch (type) {
      case "attend":
        return <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded"><Handshake className="w-3 h-3" /> ร่วมงาน</span>;
      case "photo":
        return <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded"><Camera className="w-3 h-3" /> ช่างภาพ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-blue-600" />
            ตารางเวรปฏิบัติราชการ (Duty Roster)
          </h1>
          <p className="text-sm text-slate-500 mt-1">ระบบจัดการกะงานและภารกิจกำลังพล</p>
        </div>

        {/* Legend คำอธิบายสี + ปุ่มจัดการกำลังพล + ตัวกรอง */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="flex items-center gap-1 font-medium text-sky-700">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> ร่วมงาน (ฟ้า)
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 font-medium text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> ช่างภาพ (เหลือง)
            </span>
          </div>

          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-sm font-medium transition"
          >
            <Users className="w-4 h-4 text-slate-600" />
            กำลังพล ({members.length} นาย)
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
              <User className="w-4 h-4" /> ดูเฉพาะ:
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[220px]"
            >
              <option value="all">กำลังพลทุกนาย</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Calendar Card */}
      <main className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Calendar Controller */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white rounded-lg border border-slate-200 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-lg px-2">ตุลาคม 2026</span>
            <button className="p-2 hover:bg-white rounded-lg border border-slate-200 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> ลงตารางงาน
          </button>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-100/50 text-center text-xs font-semibold text-slate-500 py-3">
          <div>อาทิตย์</div>
          <div>จันทร์</div>
          <div>อังคาร</div>
          <div>พุธ</div>
          <div>พฤหัสบดี</div>
          <div>ศุกร์</div>
          <div>เสาร์</div>
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-7 min-h-[440px] divide-x divide-y divide-slate-100">
          {[18, 19, 20, 21, 22, 23, 24].map((day) => {
            const dateStr = `2026-10-${day}`;
            const dayShifts = filteredShifts.filter((s) => s.date === dateStr);
            const isToday = day === 20;

            return (
              <div key={day} className={`p-2 min-h-[140px] transition ${isToday ? "bg-blue-50/30" : "bg-white"}`}>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? "bg-blue-600 text-white" : "text-slate-600"
                    }`}
                  >
                    {day}
                  </span>
                  {isToday && <span className="text-[10px] text-blue-600 font-bold">วันนี้</span>}
                </div>

                {/* Shift Items */}
                <div className="space-y-1.5">
                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`text-xs p-2 rounded-lg border relative group transition ${getTaskStyle(
                        shift.type
                      )}`}
                    >
                      <button
                        onClick={() => handleDeleteShift(shift.id)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition"
                        title="ลบภารกิจ"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="mb-1">{getTaskBadge(shift.type)}</div>
                      <div className="font-semibold text-slate-900 leading-tight">{shift.memberName}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{shift.title}</div>
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

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ประเภทภารกิจ (เลือกสีแสดงผล)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShiftType("attend")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition ${
                      shiftType === "attend"
                        ? "bg-sky-500 text-white border-sky-600 ring-2 ring-sky-300"
                        : "bg-sky-50 text-sky-800 border-sky-200"
                    }`}
                  >
                    <Handshake className="w-4 h-4" /> ร่วมงาน (สีฟ้า)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShiftType("photo")}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition ${
                      shiftType === "photo"
                        ? "bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-300"
                        : "bg-amber-50 text-amber-900 border-amber-200"
                    }`}
                  >
                    <Camera className="w-4 h-4" /> ช่างภาพ (สีเหลือง)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">รายละเอียดภารกิจ / เวร</label>
                <input
                  type="text"
                  placeholder="เช่น พิธีมอบทุนการศึกษา (09:00 น.)"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition shrink-0"
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