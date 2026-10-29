"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Users,
  Trash2,
  X,
  Download,
  BarChart3,
  ListOrdered,
  Edit3,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  FileSpreadsheet,
  RefreshCw,
  Info,
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
  type: "attend" | "photo" | "leave" | "general" | "duty" | "senior_officer" | "admin_officer" | "assistant_admin" | "admin_nco" | "sod_nco";
}

interface MemberItem {
  id: string;
  name: string;
}

export default function TeamCalendarPage() {
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [shifts, setShifts] = useState<ShiftItem[]>([]);

  const [activeTab, setActiveTab] = useState<"volunteer" | "duty">("volunteer");

  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9);
  const [todayFormattedDate, setTodayFormattedDate] = useState<string>("2026-10-29");

  useEffect(() => {
    const todayObj = new Date();
    setCurrentYear(todayObj.getFullYear());
    setCurrentMonth(todayObj.getMonth());
    setTodayFormattedDate(todayObj.toISOString().split("T")[0]);
  }, []);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftItem | null>(null);

  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({});

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
  const [shiftDate, setShiftDate] = useState("2026-10-29");
  const [shiftStartTime, setShiftStartTime] = useState("08:30");
  const [shiftEndTime, setShiftEndTime] = useState("16:30");
  const [shiftTitle, setShiftTitle] = useState("");
  const [shiftType, setShiftType] = useState<any>("attend");

  useEffect(() => {
    if (todayFormattedDate) {
      setShiftDate(todayFormattedDate);
    }
  }, [todayFormattedDate]);

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const parseExcelDate = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === "number") {
      if (val < 45000 || val > 50000) return null;
      const utc_days = Math.floor(val - 25569);
      const utc_value = utc_days * 86400;
      const dateInfo = new Date(utc_value * 1000);
      const year = dateInfo.getUTCFullYear();
      const month = String(dateInfo.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateInfo.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    const strVal = String(val).trim();
    if (strVal.includes("วันที่") || strVal.includes("ชื่อ")) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) return strVal;

    const parts = strVal.split(/[\/\-\.]/);
    if (parts.length === 3) {
      let d = parts[0].padStart(2, "0");
      let m = parts[1].padStart(2, "0");
      let y = parts[2];
      if (y.length === 2) y = "20" + y;
      if (parseInt(y) > 2500) y = String(parseInt(y) - 543);
      return `${y}-${m}-${d}`;
    }

    return null;
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const validMonth = (currentMonth ?? 9) + 1;
    const currentMonthKey = `${currentYear}-${validMonth.toString().padStart(2, "0")}`;
    setExpandedMonths((prev) => ({
      ...prev,
      [currentMonthKey]: true,
    }));
  }, [currentYear, currentMonth]);

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
          memberId: s.member_id || "general",
          memberName: s.member_name || "ประกาศทั่วไป",
          date: s.date || "2026-10-29",
          startTime: s.start_time || "",
          endTime: s.end_time || "",
          title: s.title || "",
          type: s.type || "attend",
        }));
        setShifts(formattedShifts);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ฟังก์ชันซ่อมแซมและจับคู่รายชื่อเวร
  const handleRematchShifts = async () => {
    const supabase = getSupabase();
    let updatedCount = 0;

    // ดึงข้อมูลสมาชิกและตารางเวรล่าสุด
    const { data: currentMembers } = await supabase.from("members").select("*");
    const { data: currentShifts } = await supabase.from("shifts").select("*");

    if (!currentMembers || !currentShifts) return;

    for (const s of currentShifts) {
      if (s.member_id === "duty_group" || !s.member_id) {
        const matched = currentMembers.find(m => 
          m.name.trim() === s.member_name?.trim() || 
          m.name.includes(s.member_name) || 
          s.member_name?.includes(m.name)
        );

        if (matched) {
          await supabase.from("shifts").update({ member_id: matched.id, member_name: matched.name }).eq("id", s.id);
          updatedCount++;
        }
      }
    }

    alert(`จับคู่รายชื่อสำเร็จ ${updatedCount} รายการ! ตอนนี้ลองกดเลือกดูรายบุคคลได้เลยครับ`);
    fetchData();
  };

  // ฟังก์ชันอัปโหลด Excel ปรับปรุงใหม่ (สร้าง member ให้อัตโนมัติหากไม่มี)
  const handleDutyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        const supabase = getSupabase();

        // 1. ดึงรายชื่อกำลังพลปัจจุบัน
        const { data: existingMembers } = await supabase.from("members").select("*");
        const memberMap = new Map<string, string>();
        (existingMembers || []).forEach(m => memberMap.set(m.name.trim(), m.id));

        const newShiftsToInsert: any[] = [];
        const newMembersToInsert: any[] = [];

        for (const row of data) {
          const rawName = String(row["ชื่อ-นามสกุล"] || row["ชื่อ"] || "").trim();
          const rawDate = row["วันที่"] || row["date"];
          const formattedDate = parseExcelDate(rawDate);

          if (!rawName || !formattedDate || rawName.includes("ชื่อ-นามสกุล")) continue;

          let memberId = memberMap.get(rawName);

          // ถ้ายังไม่มีรายชื่อในตาราง members ให้สร้างขึ้นมาใหม่ทันที
          if (!memberId) {
            // ลองหาชื่อใกล้เคียง
            const matchedKey = Array.from(memberMap.keys()).find(k => k.includes(rawName) || rawName.includes(k));
            if (matchedKey) {
              memberId = memberMap.get(matchedKey);
            } else {
              memberId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
              memberMap.set(rawName, memberId);
              newMembersToInsert.push({ id: memberId, name: rawName });
            }
          }

          newShiftsToInsert.push({
            id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
            member_id: memberId,
            member_name: rawName,
            date: formattedDate,
            start_time: "08:30",
            end_time: "16:30",
            title: "เวรแผนก",
            type: "duty",
          });
        }

        // 2. เพิ่มรายชื่อใหม่เข้าตาราง members
        if (newMembersToInsert.length > 0) {
          await supabase.from("members").insert(newMembersToInsert);
        }

        // 3. เพิ่มข้อมูลเวรเข้าตาราง shifts
        if (newShiftsToInsert.length > 0) {
          const { error } = await supabase.from("shifts").insert(newShiftsToInsert);
          if (error) throw error;
          alert(`นำเข้าตารางเวรสำเร็จ ${newShiftsToInsert.length} รายการ (เพิ่มรายชื่อกำลังพลใหม่ ${newMembersToInsert.length} นาย)!`);
          fetchData();
        } else {
          alert("ไม่พบข้อมูลในไฟล์ Excel หรือรูปแบบคอลัมน์ไม่ถูกต้อง (ต้องมีคอลัมน์ 'ชื่อ-นามสกุล' และ 'วันที่')");
        }
      } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์ Excel");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const getDaysInMonth = (year: number, month: number) => {
    const safeMonth = month ?? 9;
    const firstDayIndex = new Date(year, safeMonth, 1).getDay();
    const totalDays = new Date(year, safeMonth + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  const daysArray = getDaysInMonth(currentYear, currentMonth);

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

  const toggleMonthExpansion = (monthKey: string) => {
    setExpandedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
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
    if (activeTab === "volunteer" && !shiftTitle.trim()) return;

    let memberId = shiftMemberId;
    let memberName = "";

    const targetType = activeTab === "duty" ? shiftType : shiftType;

    if (targetType === "general") {
      memberId = "general";
      memberName = "แจ้งงานทั่วไป";
    } else {
      const member = members.find((m) => m.id === shiftMemberId);
      if (!member) return;
      memberName = member.name;
    }

    let titleText = shiftTitle.trim();
    if (activeTab === "duty") {
      switch (shiftType) {
        case "senior_officer": titleText = "นายร้อยตำรวจเวรผู้ใหญ่"; break;
        case "admin_officer": titleText = "นายร้อยเวรอำนวยการ"; break;
        case "assistant_admin": titleText = "ผู้ช่วยนายร้อยเวรอำนวยการ"; break;
        case "admin_nco": titleText = "สิบเวร อำนวยการ"; break;
        case "sod_nco": titleText = "สิบเวร ศปก."; break;
        default: titleText = "เวรประจำวัน";
      }
    }

    const newId = Date.now().toString();
    const newShiftDb = {
      id: newId,
      member_id: memberId,
      member_name: memberName,
      date: shiftDate,
      start_time: shiftStartTime,
      end_time: shiftEndTime,
      title: titleText,
      type: targetType,
    };

    const supabase = getSupabase();
    const { error } = await supabase.from("shifts").insert([newShiftDb]);
    if (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      return;
    }

    setShifts([
      ...shifts,
      {
        id: newId,
        memberId: memberId,
        memberName: memberName,
        date: shiftDate,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        title: titleText,
        type: targetType,
      },
    ]);

    setShiftTitle("");
    setIsShiftModalOpen(false);
  };

  const handleOpenEdit = (shift: ShiftItem) => {
    setEditingShift(shift);
    setIsEditModalOpen(true);
  };

  const handleUpdateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShift) return;

    let memberId = editingShift.memberId;
    let memberName = editingShift.memberName;

    if (editingShift.type === "general") {
      memberId = "general";
      memberName = "แจ้งงานทั่วไป";
    } else {
      const member = members.find((m) => m.id === editingShift.memberId);
      if (member) {
        memberName = member.name;
        memberId = member.id;
      }
    }

    let titleText = editingShift.title.trim();
    switch (editingShift.type) {
      case "senior_officer": titleText = "นายร้อยตำรวจเวรผู้ใหญ่"; break;
      case "admin_officer": titleText = "นายร้อยเวรอำนวยการ"; break;
      case "assistant_admin": titleText = "ผู้ช่วยนายร้อยเวรอำนวยการ"; break;
      case "admin_nco": titleText = "สิบเวร อำนวยการ"; break;
      case "sod_nco": titleText = "สิบเวร ศปก."; break;
      case "duty": titleText = "เวรแผนก"; break;
    }

    const updatedDbData = {
      member_id: memberId,
      member_name: memberName,
      date: editingShift.date,
      start_time: editingShift.startTime,
      end_time: editingShift.endTime,
      title: titleText,
      type: editingShift.type,
    };

    const supabase = getSupabase();
    const { error } = await supabase
      .from("shifts")
      .update(updatedDbData)
      .eq("id", editingShift.id);

    if (error) {
      alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
      return;
    }

    setShifts(
      shifts.map((s) =>
        s.id === editingShift.id
          ? { ...editingShift, memberId, memberName, title: titleText }
          : s
      )
    );

    setIsEditModalOpen(false);
    setEditingShift(null);
    setActiveGroupDetail(null);
  };

  const handleDeleteShift = async (shiftId: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.from("shifts").delete().eq("id", shiftId);
    if (error) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
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

  const formatThaiDateShort = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    const thaiYear = parseInt(y) + 543;
    const shortYear = thaiYear.toString().slice(-2);
    const monthNamesShort = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const monthIndex = parseInt(m) - 1;
    const monthName = monthNamesShort[monthIndex] || "";
    return `${parseInt(d)} ${monthName} ${shortYear}`;
  };

  const formatMonthYearLabel = (monthKey: string) => {
    if (!monthKey) return "";
    const [yStr, mStr] = monthKey.split("-");
    const y = parseInt(yStr);
    const m = parseInt(mStr) - 1;
    const safeMonthName = monthNames[m] || "มกราคม";
    return `${safeMonthName} ${y + 543}`;
  };

  const handleExportCSV = () => {
    if (shifts.length === 0) {
      alert("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    let csvContent = "\uFEFFชื่อ-นามสกุล,วันที่,เวลาเริ่ม,เวลาสิ้นสุด,ประเภท,รายละเอียด\n";
    const targetShifts = shifts.filter((s) => (activeTab === "duty" ? s.type !== "attend" && s.type !== "photo" && s.type !== "leave" && s.type !== "general" : s.type === "attend" || s.type === "photo" || s.type === "leave" || s.type === "general"));

    targetShifts.forEach((s) => {
      const row = [
        `"${s.memberName}"`,
        s.date,
        `"${formatThaiTime(s.startTime)}"`,
        `"${formatThaiTime(s.endTime)}"`,
        s.title,
        `"${s.title}"`,
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab === "duty" ? "duty-schedule" : "volunteer-schedule"}-${currentYear}-${(currentMonth ?? 0) + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFirstNameOnly = (fullName: string, type: string) => {
    if (type === "general") return "📢 ประกาศทั่วไป";
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

  const groupShiftsByTitle = (shiftItems: ShiftItem[]) => {
    const groupedMap = new Map<string, {
      title: string;
      type: string;
      startTime: string;
      endTime: string;
      items: ShiftItem[];
      names: string[];
    }>();

    shiftItems.forEach((item) => {
      const key = `${item.title.trim()}_${item.type}_${item.startTime}_${item.endTime}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          title: item.title,
          type: item.type,
          startTime: item.startTime,
          endTime: item.endTime,
          items: [],
          names: [],
        });
      }
      const group = groupedMap.get(key)!;
      group.items.push(item);
      const firstName = getFirstNameOnly(item.memberName, item.type);
      if (firstName && !group.names.includes(firstName)) {
        group.names.push(firstName);
      }
    });

    return Array.from(groupedMap.values());
  };

  const tabFilteredShifts = shifts.filter((s) => {
    if (activeTab === "duty") {
      return s.type !== "attend" && s.type !== "photo" && s.type !== "leave" && s.type !== "general";
    } else {
      return s.type === "attend" || s.type === "photo" || s.type === "leave" || s.type === "general";
    }
  });

  const safeMonthNum = (currentMonth ?? 9) + 1;
  const currentMonthPrefix = `${currentYear}-${safeMonthNum.toString().padStart(2, "0")}`;
  const monthShifts = tabFilteredShifts.filter((s) => s.date && s.date.startsWith(currentMonthPrefix));

  const totalAttend = monthShifts.filter((s) => s.type === "attend").length;
  const totalPhoto = monthShifts.filter((s) => s.type === "photo").length;
  const totalLeave = monthShifts.filter((s) => s.type === "leave").length;
  const totalGeneral = monthShifts.filter((s) => s.type === "general").length;
  const totalAllShifts = monthShifts.length;

  const memberStats = members.map((m) => {
    const mShifts = monthShifts.filter((s) => s.memberId === m.id);
    return {
      id: m.id,
      name: m.name,
      attendCount: mShifts.filter((s) => s.type === "attend").length,
      photoCount: mShifts.filter((s) => s.type === "photo").length,
      leaveCount: mShifts.filter((s) => s.type === "leave").length,
      totalCount: mShifts.filter((s) => s.type !== "general" && s.type !== "duty").length,
    };
  });

  // กรองตารางเวรตามคน โดยรองรับทั้ง ID และ ชื่อ
  const selectedMemberObj = members.find((m) => m.id === selectedMember);
  const filteredShifts = selectedMember === "all"
    ? tabFilteredShifts
    : tabFilteredShifts.filter((s) => {
        if (s.type === "general") return true;
        if (s.memberId === selectedMember) return true;
        if (selectedMemberObj && s.memberName && (s.memberName.includes(selectedMemberObj.name) || selectedMemberObj.name.includes(s.memberName))) return true;
        return false;
      });

  const sortedAllShifts = [...filteredShifts].sort((a, b) => {
    if (a.date !== b.date) {
      return (a.date || "").localeCompare(b.date || "");
    }
    return (a.startTime || "").localeCompare(b.startTime || "");
  });

  const upcomingShifts = sortedAllShifts.filter((s) => s.date >= todayFormattedDate);

  const shiftsByMonth: { [monthKey: string]: { [dateStr: string]: ShiftItem[] } } = {};
  upcomingShifts.forEach((s) => {
    if (!s.date) return;
    const monthKey = s.date.substring(0, 7);
    if (!shiftsByMonth[monthKey]) {
      shiftsByMonth[monthKey] = {};
    }
    if (!shiftsByMonth[monthKey][s.date]) {
      shiftsByMonth[monthKey][s.date] = [];
    }
    shiftsByMonth[monthKey][s.date].push(s);
  });

  const getTaskStyle = (type: string) => {
    switch (type) {
      case "attend": return "bg-sky-500/10 border-sky-300 text-sky-900";
      case "photo": return "bg-amber-500/15 border-amber-300 text-amber-950";
      case "leave": return "bg-rose-500/15 border-rose-300 text-rose-950";
      case "general": return "bg-emerald-500/15 border-emerald-300 text-emerald-950";
      case "senior_officer": return "bg-amber-200 border-amber-400 text-amber-900 font-semibold";
      case "admin_officer": return "bg-sky-200 border-sky-400 text-sky-900 font-semibold";
      case "assistant_admin": return "bg-emerald-200 border-emerald-400 text-emerald-900 font-semibold";
      case "admin_nco": return "bg-pink-200 border-pink-400 text-pink-900 font-semibold";
      case "sod_nco": return "bg-slate-200 border-slate-400 text-slate-800 font-semibold";
      case "duty": return "bg-purple-200 border-purple-400 text-purple-900 font-semibold";
      default: return "bg-slate-100 border-slate-200 text-slate-800";
    }
  };

  const getTaskBadge = (type: string) => {
    switch (type) {
      case "attend": return <span className="text-[9px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">ร่วมงาน</span>;
      case "photo": return <span className="text-[9px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">ช่างภาพ</span>;
      case "leave": return <span className="text-[9px] font-bold text-rose-800 bg-rose-200 px-1.5 py-0.5 rounded">การลา</span>;
      case "general": return <span className="text-[9px] font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded">ประกาศ</span>;
      case "senior_officer": return <span className="text-[9px] font-bold text-amber-900 bg-amber-300 px-1.5 py-0.5 rounded">เวรผู้ใหญ่</span>;
      case "admin_officer": return <span className="text-[9px] font-bold text-sky-900 bg-sky-300 px-1.5 py-0.5 rounded">นายร้อยอำนวยการ</span>;
      case "assistant_admin": return <span className="text-[9px] font-bold text-emerald-900 bg-emerald-300 px-1.5 py-0.5 rounded">ผู้ช่วยนายร้อยฯ</span>;
      case "admin_nco": return <span className="text-[9px] font-bold text-pink-900 bg-pink-300 px-1.5 py-0.5 rounded">สิบเวรอำนวยการ</span>;
      case "sod_nco": return <span className="text-[9px] font-bold text-slate-800 bg-slate-300 px-1.5 py-0.5 rounded">สิบเวร ศปก.</span>;
      case "duty": return <span className="text-[9px] font-bold text-purple-900 bg-purple-300 px-1.5 py-0.5 rounded">เวรแผนก</span>;
      default: return null;
    }
  };

  const displayMonthName = monthNames[currentMonth ?? 9] || "ตุลาคม";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            ระบบจัดการตาราง กก.ตชด.๒๓
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">ระบบจัดการภารกิจและตารางเวรประจำวันออนไลน์</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRematchShifts}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition shadow-sm"
            title="กดปุ่มนี้เพื่อเชื่อมข้อมูลเก่าเข้ากับรายชื่อกำลังพล"
          >
            <RefreshCw className="w-4 h-4" /> ซ่อมแซมจับคู่รายชื่อเก่า
          </button>

          {activeTab === "volunteer" && (
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                showStats ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <BarChart3 className="w-4 h-4" /> สถิติประจำเดือน
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition shadow-sm"
          >
            <Download className="w-4 h-4" /> ส่งออก Excel
          </button>

          <button
            onClick={() => setIsMemberModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition"
          >
            <Users className="w-4 h-4 text-slate-600" /> กำลังพล ({members.length})
          </button>

          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[180px]"
          >
            <option value="all">กำลังพลทุกนาย</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="max-w-7xl mx-auto mb-6 flex gap-2 border-b border-slate-200 pb-3 items-center justify-between flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("volunteer"); setShiftType("attend"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-xs ${
              activeTab === "volunteer" ? "bg-blue-600 text-white" : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <CalendarIcon className="w-4 h-4" /> 📅 ภารกิจจิตอาสา / งานประจำวัน
          </button>

          <button
            onClick={() => { setActiveTab("duty"); setShiftType("senior_officer"); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-xs ${
              activeTab === "duty" ? "bg-purple-600 text-white" : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> 📋 ตารางเวรประจำวัน
          </button>
        </div>

        {activeTab === "duty" && (
          <label className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition shadow-sm">
            <FileSpreadsheet className="w-4 h-4" /> นำเข้า Excel เวรแผนก
            <input type="file" accept=".xlsx, .xls, .csv" onChange={handleDutyFileUpload} className="hidden" />
          </label>
        )}
      </div>

      <main className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg border border-slate-200 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-base md:text-lg px-2">
              {displayMonthName} {currentYear + 543}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg border border-slate-200 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === "duty" && shiftType === "attend") setShiftType("senior_officer");
              setIsShiftModalOpen(true);
            }}
            className={`flex items-center gap-1.5 text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition shadow-sm ${
              activeTab === "duty" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Plus className="w-4 h-4" /> {activeTab === "duty" ? "ลงตารางเวรประจำวัน" : "ลงตารางงาน"}
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-100/50 text-center text-xs font-semibold text-slate-500 py-2.5">
          <div>อา.</div><div>จ.</div><div>อ.</div><div>พ.</div><div>พฤ.</div><div>ศ.</div><div>ส.</div>
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-50/20">
          {daysArray.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[110px] md:min-h-[140px] bg-slate-50/40" />;
            }

            const formattedDay = day < 10 ? `0${day}` : `${day}`;
            const mNum = (currentMonth ?? 9) + 1;
            const formattedMonth = mNum < 10 ? `0${mNum}` : `${mNum}`;
            const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

            const dayShifts = filteredShifts.filter((s) => s.date === dateStr);
            const groupedDayShifts = groupShiftsByTitle(dayShifts);
            const isToday = dateStr === todayFormattedDate;

            return (
              <div key={day} className={`p-1.5 md:p-2 min-h-[110px] md:min-h-[140px] transition ${isToday ? "bg-blue-50/40" : "bg-white"}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-semibold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white" : "text-slate-600"}`}>
                    {day}
                  </span>
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[110px]">
                  {groupedDayShifts.map((group, gIdx) => (
                    <div
                      key={gIdx}
                      onClick={() =>
                        setActiveGroupDetail({
                          date: dateStr,
                          title: group.title,
                          type: group.type,
                          startTime: group.startTime,
                          endTime: group.endTime,
                          items: group.items,
                        })
                      }
                      className={`text-[11px] p-1.5 rounded-md border cursor-pointer transition ${getTaskStyle(group.type)}`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        {getTaskBadge(group.type)}
                        {group.type !== "general" && group.startTime && (
                          <span className="text-[9px] opacity-75">{formatThaiTime(group.startTime)}</span>
                        )}
                      </div>
                      <div className="font-bold truncate leading-tight">
                        {group.type === "general" ? group.title : group.names.join(", ")}
                      </div>
                      {activeTab === "volunteer" && group.type !== "general" && (
                        <div className="text-[10px] opacity-90 truncate">{group.title}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <section className="max-w-7xl mx-auto mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-blue-600" />
            {activeTab === "duty" ? "📋 รายการเวรประจำวัน (ซ่อนวันที่ผ่านไปแล้ว)" : "📅 รายการภารกิจจิตอาสา (ซ่อนวันที่ผ่านไปแล้ว)"}
          </h2>

          {Object.keys(shiftsByMonth).length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">ไม่มีรายการที่กำลังจะมาถึงในเร็วๆ นี้</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(shiftsByMonth).map(([monthKey, daysMap]) => {
                const isExpanded = !!expandedMonths[monthKey];
                const totalMonthShifts = Object.values(daysMap).reduce((acc, items) => acc + items.length, 0);

                return (
                  <div key={monthKey} className="border border-slate-200 rounded-xl overflow-hidden transition">
                    <button
                      onClick={() => toggleMonthExpansion(monthKey)}
                      className="w-full bg-slate-50 hover:bg-slate-100 p-3.5 flex items-center justify-between text-left transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">เดือน {formatMonthYearLabel(monthKey)}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">{totalMonthShifts} รายการ</span>
                      </div>
                      <div className="text-slate-500">{isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 space-y-4 bg-white border-t border-slate-100">
                        {Object.entries(daysMap).map(([dateStr, items]) => (
                          <div key={dateStr} className="border-b border-slate-100 pb-3 last:border-none last:pb-0">
                            <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-2">
                              {formatThaiDateShort(dateStr)}
                            </div>
                            <div className="space-y-2 pl-2">
                              {items.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70 hover:bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs transition">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {getTaskBadge(item.type)}
                                    <span className="font-bold text-slate-900">{item.memberName}</span>
                                    <span className="text-slate-700">- {item.title}</span>
                                    {item.startTime && <span className="text-slate-400 text-[11px]">({formatThaiTime(item.startTime)} - {formatThaiTime(item.endTime)})</span>}
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                                    <button onClick={() => handleOpenEdit(item)} className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg text-xs font-medium transition border border-amber-200">
                                      <Edit3 className="w-3.5 h-3.5" /> แก้ไข
                                    </button>
                                    <button onClick={() => handleDeleteShift(item.id)} className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-xs font-medium transition border border-rose-200">
                                      <Trash2 className="w-3.5 h-3.5" /> ลบ
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {activeTab === "volunteer" && showStats && (
        <section className="max-w-7xl mx-auto space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              สรุปสถิติประจำเดือน {displayMonthName} {currentYear + 543}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl">
                <span className="text-xs text-sky-700 font-medium block">ร่วมงานทั้งหมด</span>
                <span className="text-2xl font-bold text-sky-900">{totalAttend} <span className="text-xs font-normal">ครั้ง</span></span>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl">
                <span className="text-xs text-amber-800 font-medium block">ภารกิจช่างภาพ</span>
                <span className="text-2xl font-bold text-amber-950">{totalPhoto} <span className="text-xs font-normal">ครั้ง</span></span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl">
                <span className="text-xs text-emerald-800 font-medium block">แจ้งงานทั่วไป</span>
                <span className="text-2xl font-bold text-emerald-950">{totalGeneral} <span className="text-xs font-normal">รายการ</span></span>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-3.5 rounded-xl">
                <span className="text-xs text-slate-600 font-medium block">รวมภารกิจทั้งหมด</span>
                <span className="text-2xl font-bold text-slate-900">{totalAllShifts} <span className="text-xs font-normal">รายการ</span></span>
              </div>
            </div>

            <div className="overflow-x-auto">
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

      {activeGroupDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <Info className="w-5 h-5 text-blue-600" /> รายละเอียด
              </h3>
              <button onClick={() => setActiveGroupDetail(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-medium">วันที่</span>
                <span className="font-medium text-slate-700">{formatThaiDateShort(activeGroupDetail.date)}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block font-medium">หัวข้อภารกิจ</span>
                <span className="font-semibold text-slate-900">{activeGroupDetail.title}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1.5 font-medium">ผู้ปฏิบัติหน้าที่ ({activeGroupDetail.items.length} นาย)</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {activeGroupDetail.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                      <div>
                        <div className="font-bold text-slate-800">{item.memberName}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setActiveGroupDetail(null);
                            handleOpenEdit(item);
                          }}
                          className="text-amber-600 hover:text-amber-800 transition p-1"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-1"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && editingShift && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" /> แก้ไขข้อมูล
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateShift} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ประเภท</label>
                <select
                  value={editingShift.type}
                  onChange={(e) => setEditingShift({ ...editingShift, type: e.target.value as any })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="attend">ร่วมงาน</option>
                  <option value="photo">ช่างภาพ</option>
                  <option value="leave">การลา</option>
                  <option value="general">แจ้งงานทั่วไป</option>
                  <option value="senior_officer">🟡 นายร้อยตำรวจเวรผู้ใหญ่</option>
                  <option value="admin_officer">🔵 นายร้อยเวรอำนวยการ</option>
                  <option value="assistant_admin">🟢 ผู้ช่วยนายร้อยเวรอำนวยการ</option>
                  <option value="admin_nco">🩷 สิบเวร อำนวยการ</option>
                  <option value="sod_nco">⚪ สิบเวร ศปก.</option>
                  <option value="duty">🟣 เวรแผนก</option>
                </select>
              </div>

              {editingShift.type !== "general" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">ผู้รับผิดชอบ / กำลังพล</label>
                  <select
                    value={editingShift.memberId}
                    onChange={(e) => setEditingShift({ ...editingShift, memberId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">วันที่</label>
                <input
                  type="date"
                  value={editingShift.date}
                  onChange={(e) => setEditingShift({ ...editingShift, date: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={editingShift.startTime}
                    onChange={(e) => setEditingShift({ ...editingShift, startTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={editingShift.endTime}
                    onChange={(e) => setEditingShift({ ...editingShift, endTime: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">รายละเอียด / หัวข้อภารกิจ</label>
                <input
                  type="text"
                  value={editingShift.title}
                  onChange={(e) => setEditingShift({ ...editingShift, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
                >
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> {activeTab === "duty" ? "ลงตารางเวรประจำวัน" : "ลงตารางงาน"}
              </h2>
              <button onClick={() => setIsShiftModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShift} className="space-y-4">
              {activeTab === "duty" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">ประเภทเวร</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    <option value="senior_officer">🟡 นายร้อยตำรวจเวรผู้ใหญ่</option>
                    <option value="admin_officer">🔵 นายร้อยเวรอำนวยการ</option>
                    <option value="assistant_admin">🟢 ผู้ช่วยนายร้อยเวรอำนวยการ</option>
                    <option value="admin_nco">🩷 สิบเวร อำนวยการ</option>
                    <option value="sod_nco">⚪ สิบเวร ศปก.</option>
                    <option value="duty">🟣 เวรแผนก</option>
                  </select>
                </div>
              )}

              {activeTab === "volunteer" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">ประเภทภารกิจ</label>
                  <select
                    value={shiftType}
                    onChange={(e) => setShiftType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="attend">ร่วมงาน</option>
                    <option value="photo">ช่างภาพ</option>
                    <option value="leave">การลา</option>
                    <option value="general">แจ้งงานทั่วไป</option>
                  </select>
                </div>
              )}

              {shiftType !== "general" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">กำลังพลผู้ปฏิบัติหน้าที่</label>
                  <select
                    value={shiftMemberId}
                    onChange={(e) => setShiftMemberId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">วันที่</label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {activeTab === "volunteer" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">เวลาเริ่ม</label>
                    <input type="time" value={shiftStartTime} onChange={(e) => setShiftStartTime(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">เวลาสิ้นสุด</label>
                    <input type="time" value={shiftEndTime} onChange={(e) => setShiftEndTime(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  {activeTab === "duty" ? "รายละเอียดเวร (เพิ่มเติม)" : "รายละเอียดภารกิจ"}
                </label>
                <input
                  type="text"
                  placeholder={activeTab === "duty" ? "ระบุรายละเอียดเพิ่มเติม (ถ้ามี)" : "เช่น พิธีมอบทุนการศึกษา"}
                  value={shiftTitle}
                  onChange={(e) => setShiftTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={activeTab === "volunteer"}
                />
              </div>

              <button
                type="submit"
                className={`w-full text-white py-2.5 rounded-xl text-sm font-medium transition shadow-sm mt-2 ${
                  activeTab === "duty" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                บันทึกข้อมูล
              </button>
            </form>
          </div>
        </div>
      )}

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
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition shrink-0">
                เพิ่ม
              </button>
            </form>

            <div className="overflow-y-auto flex-1 pr-1 space-y-1.5">
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-sm">
                  <span className="font-medium text-slate-800">{m.name}</span>
                  <button onClick={() => handleDeleteMember(m.id)} className="p-1 text-slate-400 hover:text-rose-500 transition" title="ลบรายชื่อ">
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