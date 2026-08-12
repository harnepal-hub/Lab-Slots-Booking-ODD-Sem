// --- 1. ODD SEMESTER CURRICULUM DATA ---
const courseData = {
    "I": [
        { code: "AAR111", name: "Introduction to Art and Architecture" },
        { code: "AAR113", name: "Basic Design & Visual Arts I" },
        { code: "AAR115", name: "Architectural Drawing and Graphics I" },
        { code: "AAR121", name: "Sketching Workshop" },
        { code: "ACE101", name: "Engineering Mechanics" },
        { code: "AMT111", name: "Mathematics for Architects" },
        { code: "AEG111", name: "Technical Communication" },
        { code: "ENT1051", name: "Fundamentals of Entrepreneurship" }
    ],
    "III": [
        { code: "ACE201", name: "Theory of Structures I" },
        { code: "AAR201", name: "Climatology in Architecture" },
        { code: "AAR203", name: "History of Western Architecture" },
        { code: "AAR104", name: "Building Materials II" },
        { code: "AAR217", name: "Architectural Design I" },
        { code: "AAR219", name: "Building Construction II" },
        { code: "AAR221", name: "Computer Applications in Architecture I" }
    ],
    "V": [
        { code: "ACE301", name: "Concrete Structures" },
        { code: "AAR301", name: "Architectural Acoustics" },
        { code: "AAR303", name: "Mechanical and Electrical Services" },
        { code: "AAR315", name: "History of Eastern Architecture II" },
        { code: "AAR307", name: "Site Planning & Landscape Design" },
        { code: "AAR319", name: "Architectural Design III" },
        { code: "AAR313", name: "Building Construction IV" },
        { code: "EOE202", name: "German for Beginners" },
        { code: "EOE305", name: "French for Beginners" },
        { code: "EOE317", name: "Personality Development" },
        { code: "PSYC1002", name: "Introduction To Psychology" },
        { code: "LANG1181", name: "Introduction To Spanish" }
    ],
    "VII": [
        { code: "AAR403", name: "Advanced Services" },
        { code: "AAR461", name: "Research Methodology and Seminar" },
        { code: "AAR463", name: "Architectural Design - V" },
        { code: "AAR419", name: "Introduction to Human Settlements & Town Planning" },
        { code: "AAR465", name: "Building Information Modelling" },
        { code: "AAR471", name: "Introduction to Architectural Conservation" },
        { code: "AAR473", name: "Innovative Approaches in Interior Design" },
        { code: "AAR475", name: "Elements of Landscape Architecture" },
        { code: "AAR477", name: "Fundamentals of Circular Economy in Architecture and Construction" },
        { code: "AAR481", name: "Computational Design and Digital Fabrication" },
        { code: "AAR483", name: "Fundamentals of Net zero in Built environment" },
        { code: "AAR485", name: "Building Construction Planning and Scheduling" },
        { code: "AAR487", name: "Urban Design Theory" }
    ],
    "IX": [
        { code: "AAR551", name: "Community Design Theory" },
        { code: "AAR561", name: "Architectural Design - VI (Community Projects Studio)" },
        { code: "AAR563", name: "Dissertation" },
        { code: "AAR565", name: "Architectural Detailing" },
        { code: "AAR571", name: "Architectural Conservation Planning" },
        { code: "AAR573", name: "Fundamentals in Furniture Design" },
        { code: "AAR575", name: "Urban Landscapes" },
        { code: "AAR577", name: "Integrated Applications of Circular Economy in Architecture and Construction" },
        { code: "AAR581", name: "Interactive Design" },
        { code: "AAR583", name: "Sustainable Materials and Construction Techniques" },
        { code: "AAR585", name: "Building Construction Materials and Equipment Management" },
        { code: "AAR587", name: "Urban Infrastructure and Housing" }
    ]
};

const standardSlots = [
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM", // LUNCH
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM"
];

let selectedSlotsArray = [];

// --- 2. FIREBASE PROJECT CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyA4IgmrsJ3v3qzzCtHJbzggBUVkVUqOj0Q",
    authDomain: "gitam-lab-booking.firebaseapp.com",
    databaseURL: "https://gitam-lab-booking-default-rtdb.firebaseio.com",
    projectId: "gitam-lab-booking",
    storageBucket: "gitam-lab-booking.firebasestorage.app",
    messagingSenderId: "795740333591",
    appId: "1:795740333591:web:84fbca920e554112a39e52",
    measurementId: "G-V7XJD4WZ1P"
};

let db = null;
let liveBookingsCache = [];

try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
    } else if (typeof firebase !== 'undefined') {
        db = firebase.database();
    }
} catch (e) {
    console.warn("Firebase fallback active.", e);
}

function setupLiveListener() {
    if (db) {
        db.ref("bookings").on("value", (snapshot) => {
            liveBookingsCache = [];
            snapshot.forEach(child => {
                liveBookingsCache.push(child.val());
            });
            window.checkSlotAvailability();
            window.renderScheduleTable();
            window.renderCalendarGrid();
            window.generateMonthlyMatrix();
        });
    } else {
        liveBookingsCache = JSON.parse(localStorage.getItem("gitam_lab_bookings") || "[]");
    }
}

function getCleanSemKey(semVal) {
    if (!semVal) return "";
    const cleaned = semVal.replace(/Semester|Sem/gi, "").trim();
    if (["I", "III", "V", "VII", "IX"].includes(cleaned)) return cleaned;
    if (semVal.includes("IX")) return "IX";
    if (semVal.includes("VII")) return "VII";
    if (semVal.includes("III")) return "III";
    if (semVal.includes("V")) return "V";
    if (semVal.includes("I")) return "I";
    return "";
}

function normalizeDateISO(dateVal) {
    if (!dateVal) return "";
    if (dateVal.includes("/")) {
        const parts = dateVal.split("/");
        if (parts.length === 3) {
            if (parts[0].length === 4) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
    }
    return dateVal;
}

window.switchTab = function(tabId) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
    
    const targetContent = document.getElementById(tabId);
    const targetTabBtn = document.getElementById(`tab-${tabId}`);

    if (targetContent) targetContent.classList.remove("hidden");
    if (targetTabBtn) targetTabBtn.classList.add("active");

    if (tabId === 'calendarGridTab') window.renderCalendarGrid();
    if (tabId === 'matrixTab') window.generateMonthlyMatrix();
    if (tabId === 'dailyTab') window.renderScheduleTable();
};

window.handleSemesterChange = function() {
    const rawSem = document.getElementById("semesterSelect").value;
    const semKey = getCleanSemKey(rawSem);
    const secContainer = document.getElementById("sectionContainer");

    if (["I", "III", "V"].includes(semKey)) {
        secContainer.classList.remove("hidden");
    } else {
        secContainer.classList.add("hidden");
    }

    window.populateCourses();
    window.checkSlotAvailability();
};

window.populateCourses = function() {
    const rawSem = document.getElementById("semesterSelect").value;
    const semKey = getCleanSemKey(rawSem);
    const courseSelect = document.getElementById("courseSelect");
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    if (courseData[semKey]) {
        courseData[semKey].forEach(c => {
            const opt = document.createElement("option");
            opt.value = `${c.code}: ${c.name}`;
            opt.textContent = `${c.code} - ${c.name}`;
            courseSelect.appendChild(opt);
        });
    } else {
        courseSelect.innerHTML = '<option value="">Select Semester First</option>';
    }
};

window.checkSlotAvailability = function() {
    const lab = document.getElementById("labSelect").value;
    const rawDate = document.getElementById("bookingDate").value;
    const date = normalizeDateISO(rawDate);
    const container = document.getElementById("slotsContainer");
    selectedSlotsArray = [];

    if (!lab && !date) {
        container.innerHTML = '<p class="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200 col-span-2 sm:col-span-4">⚠️ Please select both a <strong>Lab Facility</strong> and a <strong>Booking Date</strong> above to view slots.</p>';
        return;
    }
    if (!lab) {
        container.innerHTML = '<p class="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200 col-span-2 sm:col-span-4">⚠️ Please select a <strong>Lab Facility</strong> above.</p>';
        return;
    }
    if (!date) {
        container.innerHTML = '<p class="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200 col-span-2 sm:col-span-4">⚠️ Please pick a <strong>Booking Date</strong> above.</p>';
        return;
    }

    const bookedSlots = liveBookingsCache
        .filter(b => b.lab === lab && normalizeDateISO(b.date) === date)
        .map(b => b.slot);

    container.innerHTML = "";
    standardSlots.forEach(slot => {
        const isLunch = (slot === "12:00 PM - 01:00 PM");
        const isBooked = bookedSlots.includes(slot);
        const btn = document.createElement("button");
        btn.type = "button";
        
        if (isLunch) {
            btn.className = "slot-btn p-2 text-xs font-bold rounded-md border border-slate-300 bg-slate-100 text-slate-400 w-full text-center cursor-not-allowed";
            btn.innerHTML = `<span>12-1 PM</span> <span class="text-[9px] block text-slate-400 font-semibold">LUNCH BREAK</span>`;
            btn.disabled = true;
        } else if (isBooked) {
            btn.className = "slot-btn disabled p-2 text-xs font-medium rounded-md border w-full text-left flex justify-between items-center";
            btn.innerHTML = `<span class="truncate">${slot}</span> <span class="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded border border-red-200 uppercase">FILLED</span>`;
            btn.disabled = true;
        } else {
            btn.className = "slot-btn p-2 text-xs font-semibold rounded-md border border-emerald-300 bg-emerald-50/60 text-gitam-teal hover:bg-gitam-teal hover:text-white w-full text-center cursor-pointer transition";
            btn.innerText = slot;
            btn.onclick = () => {
                if (selectedSlotsArray.includes(slot)) {
                    selectedSlotsArray = selectedSlotsArray.filter(s => s !== slot);
                    btn.classList.remove("selected");
                } else {
                    selectedSlotsArray.push(slot);
                    btn.classList.add("selected");
                }
            };
        }
        container.appendChild(btn);
    });
};

window.renderScheduleTable = function() {
    const rawDate = document.getElementById("filterDate").value;
    const date = normalizeDateISO(rawDate);
    const tbody = document.getElementById("scheduleTableBody");
    tbody.innerHTML = "";

    if (!date) return;

    const data = liveBookingsCache.filter(b => normalizeDateISO(b.date) === date);

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-400">No lab slots booked for ${date}</td></tr>`;
        return;
    }

    data.sort((a, b) => a.slot.localeCompare(b.slot));

    data.forEach(b => {
        const sectionBadge = b.section ? ` (Sec ${b.section})` : '';
        const row = document.createElement("tr");
        row.className = "transition";
        row.innerHTML = `
            <td class="p-3 border-b font-semibold text-slate-700">${b.slot}</td>
            <td class="p-3 border-b font-bold text-gitam-teal">${b.lab}</td>
            <td class="p-3 border-b">
                <div class="font-semibold text-slate-800">${b.course}</div>
                <div class="text-[11px] text-slate-500">${b.userName} (${b.role} — ${b.userId}) | Sem ${b.semester}${sectionBadge}</div>
            </td>
            <td class="p-3 border-b text-center">
                <span class="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Filled</span>
            </td>
        `;
        tbody.appendChild(row);
    });
};

window.renderCalendarGrid = function() {
    const monthVal = document.getElementById("calendarGridMonth").value;
    const labVal = document.getElementById("calendarGridLab").value;
    const gridBody = document.getElementById("calendarGridBody");
    gridBody.innerHTML = "";

    if (!monthVal) return;

    const [year, month] = monthVal.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    const startDayIndex = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const todayISO = "2026-08-11";

    for (let i = 0; i < startDayIndex; i++) {
        const padCell = document.createElement("div");
        padCell.className = "cal-day-cell other-month p-2 border-b border-r border-slate-100";
        gridBody.appendChild(padCell);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dayStr = String(d).padStart(2, "0");
        const dateISO = `${year}-${String(month).padStart(2, "0")}-${dayStr}`;
        const isToday = (dateISO === todayISO);

        const dayCell = document.createElement("div");
        dayCell.className = `cal-day-cell p-2 border-b border-r border-slate-100 flex flex-col justify-between ${isToday ? 'bg-emerald-50/40' : ''}`;

        const dayHeader = document.createElement("div");
        dayHeader.className = "flex justify-between items-center mb-1";
        
        const dateNum = document.createElement("span");
        if (isToday) {
            dateNum.className = "w-5 h-5 bg-gitam-teal text-white rounded-full flex items-center justify-center font-bold text-[11px]";
        } else {
            dateNum.className = "font-bold text-slate-700 text-xs";
        }
        dateNum.innerText = d;

        dayHeader.appendChild(dateNum);
        dayCell.appendChild(dayHeader);

        const dayBookings = liveBookingsCache.filter(b => {
            const matchesDate = normalizeDateISO(b.date) === dateISO;
            const matchesLab = (labVal === "ALL") || (b.lab === labVal);
            return matchesDate && matchesLab;
        });

        const eventsContainer = document.createElement("div");
        eventsContainer.className = "space-y-1 flex-grow overflow-y-auto max-h-[90px]";

        if (dayBookings.length > 0) {
            dayBookings.sort((a,b) => a.slot.localeCompare(b.slot));

            dayBookings.forEach(b => {
                const badge = document.createElement("div");
                badge.className = "bg-emerald-100/80 border border-emerald-300 text-gitam-teal text-[10px] p-1 rounded font-semibold truncate";
                
                const shortTime = b.slot.split(" ")[0];
                const secTag = b.section ? `-${b.section}` : '';
                badge.innerHTML = `<span>${shortTime}</span> <span class="font-bold">${b.lab}</span> <span class="text-[9px] bg-gitam-teal text-white px-1 rounded">S${b.semester}${secTag}</span>`;
                badge.title = `${b.lab} | ${b.course} | ${b.userName} (${b.role})`;
                eventsContainer.appendChild(badge);
            });
        }

        dayCell.appendChild(eventsContainer);
        gridBody.appendChild(dayCell);
    }
};

window.generateMonthlyMatrix = function() {
    const selectedMonth = document.getElementById("matrixMonth").value;
    const tbody = document.getElementById("matrixTableBody");
    tbody.innerHTML = "";

    if (!selectedMonth) return;

    const monthBookings = liveBookingsCache.filter(b => normalizeDateISO(b.date).startsWith(selectedMonth));

    if (monthBookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="p-6 text-center text-slate-400">No bookings recorded for ${selectedMonth}.</td></tr>`;
        return;
    }

    const groupedByDate = {};
    monthBookings.forEach(b => {
        const normDate = normalizeDateISO(b.date);
        if (!groupedByDate[normDate]) {
            groupedByDate[normDate] = {
                "08:00 AM - 09:00 AM": [],
                "09:00 AM - 10:00 AM": [],
                "10:00 AM - 11:00 AM": [],
                "11:00 AM - 12:00 PM": [],
                "01:00 PM - 02:00 PM": [],
                "02:00 PM - 03:00 PM": [],
                "03:00 PM - 04:00 PM": [],
                "04:00 PM - 05:00 PM": []
            };
        }
        if (groupedByDate[normDate][b.slot]) {
            groupedByDate[normDate][b.slot].push(b);
        }
    });

    Object.keys(groupedByDate).sort().forEach(date => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 border-b";

        const s1 = renderConsolidatedSlotCell(groupedByDate[date]["08:00 AM - 09:00 AM"]);
        const s2 = renderConsolidatedSlotCell(groupedByDate[date]["09:00 AM - 10:00 AM"]);
        const s3 = renderConsolidatedSlotCell(groupedByDate[date]["10:00 AM - 11:00 AM"]);
        const s4 = renderConsolidatedSlotCell(groupedByDate[date]["11:00 AM - 12:00 PM"]);
        const s5 = renderConsolidatedSlotCell(groupedByDate[date]["01:00 PM - 02:00 PM"]);
        const s6 = renderConsolidatedSlotCell(groupedByDate[date]["02:00 PM - 03:00 PM"]);
        const s7 = renderConsolidatedSlotCell(groupedByDate[date]["03:00 PM - 04:00 PM"]);
        const s8 = renderConsolidatedSlotCell(groupedByDate[date]["04:00 PM - 05:00 PM"]);

        tr.innerHTML = `
            <td class="p-2 border font-bold text-slate-700 whitespace-nowrap bg-slate-50/50 text-[11px]">${date}</td>
            <td class="p-1.5 border font-medium text-[10px]">${s1}</td>
            <td class="p-1.5 border font-medium text-[10px]">${s2}</td>
            <td class="p-1.5 border font-medium text-[10px]">${s3}</td>
            <td class="p-1.5 border font-medium text-[10px]">${s4}</td>
            <td class="p-1.5 border bg-slate-100 text-center text-[9px] text-slate-400 font-semibold">LUNCH</td>
            <td class="p-1.5 border font-medium text-[10px]">${s5}</td>
            <td class="p-1.5 border font-medium text-[10px]">${s6}</td>
            <td class="p-1.5 border font-medium text-[10px]">${s7}</td>
            <td class="p-1.5 border font-medium text-[10px]">${s8}</td>
        `;
        tbody.appendChild(tr);
    });
};

function renderConsolidatedSlotCell(bookings) {
    if (!bookings || bookings.length === 0) {
        return '<span class="text-slate-300 text-[10px] font-normal italic">Free</span>';
    }

    return bookings.map(b => {
        const secText = b.section ? ` Sec ${b.section}` : '';
        return `<div class="mb-1 p-1 bg-emerald-50 border border-emerald-200 rounded text-[10px]">
            <div class="font-bold text-gitam-teal truncate">${b.lab}</div>
            <div class="text-[9px] text-slate-600 truncate">${b.course.split(':')[0]} (Sem ${b.semester}${secText})</div>
        </div>`;
    }).join("");
}

// 1. STANDARD CSV EXPORT
window.exportToCSV = function() {
    if (liveBookingsCache.length === 0) {
        alert("No booking data available to export.");
        return;
    }

    let csvRows = [];
    csvRows.push(["Date", "Lab Facility", "Time Slot", "Semester", "Section", "Course Code & Name", "User Name", "Role", "ID Number"].join(","));

    liveBookingsCache.forEach(b => {
        const row = [
            `"${b.date || ''}"`,
            `"${b.lab || ''}"`,
            `"${b.slot || ''}"`,
            `"${b.semester || ''}"`,
            `"${b.section || 'N/A'}"`,
            `"${(b.course || '').replace(/"/g, '""')}"`,
            `"${(b.userName || '').replace(/"/g, '""')}"`,
            `"${b.role || ''}"`,
            `"${b.userId || ''}"`
        ].join(",");
        csvRows.push(row);
    });

    triggerBlobDownload(csvRows.join("\n"), `GITAM_Lab_Timetable_Export_${new Date().toISOString().slice(0,10)}.csv`);
};

// 2. NEW: GROUPED & CLUBBED CSV EXPORT (Date-Wise, Continuous Time Merged)
window.exportGroupedCSV = function() {
    if (liveBookingsCache.length === 0) {
        alert("No booking data available to export.");
        return;
    }

    // Sort by Date -> Lab -> Semester -> Section -> Time Slot
    const copy = [...liveBookingsCache].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (a.lab !== b.lab) return a.lab.localeCompare(b.lab);
        if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
        if ((a.section || '') !== (b.section || '')) return (a.section || '').localeCompare(b.section || '');
        return a.slot.localeCompare(b.slot);
    });

    const timeToMin = (timeStr) => {
        // e.g. "08:00 AM" -> minutes
        const [time, period] = timeStr.split(" ");
        let [h, m] = time.split(":").map(Number);
        if (period === "PM" && h < 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
        return h * 60 + m;
    };

    const minToTimeStr = (totalMins) => {
        let h = Math.floor(totalMins / 60);
        let m = totalMins % 60;
        const period = h >= 12 ? "PM" : "AM";
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
    };

    const clubbedRecords = [];

    copy.forEach(booking => {
        if (!booking.slot || !booking.slot.includes("-")) {
            clubbedRecords.push(booking);
            return;
        }

        const [startStr, endStr] = booking.slot.split(" - ").map(s => s.trim());
        const startMin = timeToMin(startStr);
        const endMin = timeToMin(endStr);

        // Try to merge with the last entry in clubbedRecords if matching same session & contiguous time
        if (clubbedRecords.length > 0) {
            const last = clubbedRecords[clubbedRecords.length - 1];
            const isSameDate = last.date === booking.date;
            const isSameLab = last.lab === booking.lab;
            const isSameSem = last.semester === booking.semester;
            const isSameSec = (last.section || '') === (booking.section || '');
            const isSameCourse = last.course === booking.course;
            const isContiguous = last._endMin === startMin;

            if (isSameDate && isSameLab && isSameSem && isSameSec && isSameCourse && isContiguous) {
                last._endMin = endMin;
                last.slot = `${minToTimeStr(last._startMin)} - ${minToTimeStr(endMin)}`;
                return;
            }
        }

        clubbedRecords.push({
            ...booking,
            _startMin: startMin,
            _endMin: endMin,
            slot: `${minToTimeStr(startMin)} - ${minToTimeStr(endMin)}`
        });
    });

    let csvRows = [];
    csvRows.push(["Date", "Lab Facility", "Duration / Slot", "Semester", "Section", "Course Code & Name", "User Name", "Role", "ID Number"].join(","));

    clubbedRecords.forEach(b => {
        const row = [
            `"${b.date || ''}"`,
            `"${b.lab || ''}"`,
            `"${b.slot || ''}"`,
            `"${b.semester || ''}"`,
            `"${b.section || 'N/A'}"`,
            `"${(b.course || '').replace(/"/g, '""')}"`,
            `"${(b.userName || '').replace(/"/g, '""')}"`,
            `"${b.role || ''}"`,
            `"${b.userId || ''}"`
        ].join(",");
        csvRows.push(row);
    });

    triggerBlobDownload(csvRows.join("\n"), `GITAM_Lab_Timetable_Clubbed_${new Date().toISOString().slice(0,10)}.csv`);
};

function triggerBlobDownload(csvString, fileName) {
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Auto Initialization
document.addEventListener("DOMContentLoaded", () => {
    const todayISO = "2026-08-11";
    
    document.getElementById("filterDate").value = todayISO;
    document.getElementById("bookingDate").value = todayISO;

    const semSelect = document.getElementById("semesterSelect");
    const labSelect = document.getElementById("labSelect");
    const dateInput = document.getElementById("bookingDate");
    const filterDateInput = document.getElementById("filterDate");

    semSelect.addEventListener("change", window.handleSemesterChange);
    semSelect.addEventListener("input", window.handleSemesterChange);
    
    labSelect.addEventListener("change", window.checkSlotAvailability);
    dateInput.addEventListener("change", window.checkSlotAvailability);
    dateInput.addEventListener("input", window.checkSlotAvailability);
    
    filterDateInput.addEventListener("change", window.renderScheduleTable);

    document.getElementById("calendarGridMonth").addEventListener("change", window.renderCalendarGrid);
    document.getElementById("calendarGridLab").addEventListener("change", window.renderCalendarGrid);
    document.getElementById("matrixMonth").addEventListener("change", window.generateMonthlyMatrix);
    
    document.getElementById("exportCsvBtn").addEventListener("click", window.exportToCSV);
    document.getElementById("exportGroupedCsvBtn").addEventListener("click", window.exportGroupedCSV);

    document.getElementById("bookingForm").onsubmit = function(e) {
        e.preventDefault();

        if (selectedSlotsArray.length === 0) {
            alert("Please click on at least one available 1-hour slot button.");
            return;
        }

        const rawSem = document.getElementById("semesterSelect").value;
        const semKey = getCleanSemKey(rawSem);
        const sectionVal = ["I", "III", "V"].includes(semKey) ? document.getElementById("sectionSelect").value : null;

        const userName = document.getElementById("userName").value.trim(),
              role = document.getElementById("userRole").value,
              userId = document.getElementById("userId").value.trim(),
              course = document.getElementById("courseSelect").value,
              lab = document.getElementById("labSelect").value,
              rawDate = document.getElementById("bookingDate").value,
              date = normalizeDateISO(rawDate);

        let completed = 0;
        selectedSlotsArray.forEach(slot => {
            const newBooking = {
                userName,
                role,
                userId,
                semester: semKey,
                section: sectionVal,
                course,
                lab,
                date,
                slot,
                timestamp: Date.now()
            };

            if (db) {
                db.ref("bookings").push().set(newBooking, (err) => {
                    completed++;
                    if (completed === selectedSlotsArray.length) {
                        alert(`Successfully booked ${selectedSlotsArray.length} slot(s) for ${lab} on ${date}!`);
                        resetAfterSubmit();
                    }
                });
            } else {
                liveBookingsCache.push(newBooking);
                completed++;
                if (completed === selectedSlotsArray.length) {
                    localStorage.setItem("gitam_lab_bookings", JSON.stringify(liveBookingsCache));
                    alert(`Locally booked ${selectedSlotsArray.length} slot(s) for ${lab} on ${date}!`);
                    resetAfterSubmit();
                }
            }
        });
    };

    function resetAfterSubmit() {
        document.getElementById("bookingForm").reset();
        selectedSlotsArray = [];
        document.getElementById("courseSelect").innerHTML = '<option value="">Select Semester First</option>';
        
        document.getElementById("bookingDate").value = todayISO;
        document.getElementById("filterDate").value = todayISO;

        window.handleSemesterChange();
        window.checkSlotAvailability();
        window.renderScheduleTable();
        window.renderCalendarGrid();
        window.generateMonthlyMatrix();
    }

    window.handleSemesterChange();
    setupLiveListener();
});
