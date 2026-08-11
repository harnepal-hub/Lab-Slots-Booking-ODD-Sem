// --- 7. MONTHLY TIMETABLE MATRIX GENERATOR ---
function generateMonthlyMatrix() {
    const selectedMonth = document.getElementById("matrixMonth").value; // e.g., "2026-07"
    const selectedLab = document.getElementById("matrixLab").value;
    const tbody = document.getElementById("matrixTableBody");
    tbody.innerHTML = "";

    const allBookings = getLocalBookings();
    
    // Filter bookings by month and lab
    const monthBookings = allBookings.filter(b => {
        const matchesMonth = b.date.startsWith(selectedMonth);
        const matchesLab = (selectedLab === "ALL") || (b.lab === selectedLab);
        return matchesMonth && matchesLab;
    });

    if (monthBookings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-400">No bookings recorded for ${selectedMonth} (${selectedLab}).</td></tr>`;
        return;
    }

    // Group bookings by Date + Lab combination
    const grouped = {};
    monthBookings.forEach(b => {
        const key = `${b.date}__${b.lab}`;
        if (!grouped[key]) {
            grouped[key] = { date: b.date, lab: b.lab, slots: {} };
        }
        grouped[key].slots[b.slot] = b;
    });

    // Render Matrix Rows
    Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date)).forEach(row => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50";

        const slot1 = row.slots["08:00 AM - 10:00 AM"] ? formatSlotCell(row.slots["08:00 AM - 10:00 AM"]) : '<span class="text-slate-300">Free</span>';
        const slot2 = row.slots["10:00 AM - 12:00 PM"] ? formatSlotCell(row.slots["10:00 AM - 12:00 PM"]) : '<span class="text-slate-300">Free</span>';
        const slot3 = row.slots["01:00 PM - 03:00 PM"] ? formatSlotCell(row.slots["01:00 PM - 03:00 PM"]) : '<span class="text-slate-300">Free</span>';
        const slot4 = row.slots["03:00 PM - 05:00 PM"] ? formatSlotCell(row.slots["03:00 PM - 05:00 PM"]) : '<span class="text-slate-300">Free</span>';

        tr.innerHTML = `
            <td class="p-2 border font-bold text-slate-700 whitespace-nowrap">${row.date}</td>
            <td class="p-2 border font-semibold text-gitam-teal whitespace-nowrap">${row.lab}</td>
            <td class="p-2 border">${slot1}</td>
            <td class="p-2 border">${slot2}</td>
            <td class="p-2 border bg-slate-100 text-center text-[10px] text-slate-400 font-semibold">LUNCH</td>
            <td class="p-2 border">${slot3}</td>
            <td class="p-2 border">${slot4}</td>
        `;
        tbody.appendChild(tr);
    });
}

function formatSlotCell(b) {
    return `<div class="bg-emerald-50 border border-emerald-200 p-1 rounded">
        <div class="font-bold text-gitam-teal">${b.course.split(':')[0]}</div>
        <div class="text-[10px] text-slate-600">${b.userName} (${b.role})</div>
    </div>`;
}

// --- 8. EXPORT TIMETABLE TO CSV / EXCEL ---
function exportToCSV() {
    const allBookings = getLocalBookings();
    if (allBookings.length === 0) {
        alert("No booking data available to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Lab Facility,Time Slot,Semester,Course Code & Name,User Name,Role,ID Number\n";

    allBookings.forEach(b => {
        const row = [
            `"${b.date}"`,
            `"${b.lab}"`,
            `"${b.slot}"`,
            `"${b.semester}"`,
            `"${b.course.replace(/"/g, '""')}"`,
            `"${b.userName.replace(/"/g, '""')}"`,
            `"${b.role}"`,
            `"${b.userId}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GITAM_Lab_Timetable_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Automatically populate the monthly matrix on page load
const originalOnload = window.onload;
window.onload = function() {
    if (originalOnload) originalOnload();
    generateMonthlyMatrix();
};
