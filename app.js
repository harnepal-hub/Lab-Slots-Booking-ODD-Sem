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
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "01:00 PM - 03:00 PM",
    "03:00 PM - 05:00 PM"
];

// Local Storage Fallback Engine
function getLocalBookings() {
    return JSON.parse(localStorage.getItem("gitam_lab_bookings") || "[]");
}

function saveLocalBooking(booking) {
    const current = getLocalBookings();
    current.push(booking);
    localStorage.setItem("gitam_lab_bookings", JSON.stringify(current));
}

// Populate Courses based on Semester
function populateCourses() {
    const sem = document.getElementById("semesterSelect").value;
    const courseSelect = document.getElementById("courseSelect");
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    if (courseData[sem]) {
        courseData[sem].forEach(c => {
            const opt = document.createElement("option");
            opt.value = `${c.code}: ${c.name}`;
            opt.textContent = `${c.code} - ${c.name}`;
            courseSelect.appendChild(opt);
        });
    }
}

// Check Slot Availability
function checkSlotAvailability() {
    const lab = document.getElementById("labSelect").value;
    const date = document.getElementById("bookingDate").value;
    const container = document.getElementById("slotsContainer");
    document.getElementById("selectedSlot").value = "";

    if (!lab || !date) {
        container.innerHTML = '<p class="text-xs text-slate-400 col-span-2 py-2">Select Lab and Date to see availability.</p>';
        return;
    }

    const allBookings = getLocalBookings();
    const bookedSlots = allBookings
        .filter(b => b.lab === lab && b.date === date)
        .map(b => b.slot);

    container.innerHTML = "";
    standardSlots.forEach(slot => {
        const isBooked = bookedSlots.includes(slot);
        const btn = document.createElement("button");
        btn.type = "button";
        
        if (isBooked) {
            btn.className = "slot-btn disabled p-2 text-xs font-medium rounded-md border w-full text-left flex justify-between items-center";
            btn.innerHTML = `<span>${slot}</span> <span class="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-200 uppercase">Filled</span>`;
            btn.disabled = true;
        } else {
            btn.className = "slot-btn p-2 text-xs font-semibold rounded-md border border-emerald-300 bg-emerald-50/50 text-gitam-teal hover:bg-gitam-teal hover:text-white w-full text-center";
            btn.innerText = slot;
            btn.onclick = () => {
                document.querySelectorAll("#slotsContainer button").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                document.getElementById("selectedSlot").value = slot;
            };
        }
        container.appendChild(btn);
    });
}

// Handle Form Submission
document.getElementById("bookingForm").onsubmit = function(e) {
    e.preventDefault();

    const slot = document.getElementById("selectedSlot").value;
    if (!slot) {
        alert("Please click on one of the 2-hour slot buttons to select it.");
        return;
    }

    const newBooking = {
        userName: document.getElementById("userName").value.trim(),
        role: document.getElementById("userRole").value,
        userId: document.getElementById("userId").value.trim(),
        semester: document.getElementById("semesterSelect").value,
        course: document.getElementById("courseSelect").value,
        lab: document.getElementById("labSelect").value,
        date: document.getElementById("bookingDate").value,
        slot: slot,
        timestamp: Date.now()
    };

    saveLocalBooking(newBooking);
    alert(`Slot successfully booked for ${newBooking.lab} on ${newBooking.date} (${newBooking.slot}).`);
    
    document.getElementById("bookingForm").reset();
    document.getElementById("selectedSlot").value = "";
    document.getElementById("courseSelect").innerHTML = '<option value="">Select Semester First</option>';
    document.getElementById("slotsContainer").innerHTML = '<p class="text-xs text-slate-400 col-span-2 py-2">Select Lab and Date to see availability.</p>';
    
    renderScheduleTable();
};

// Render Schedule Table Overview
function renderScheduleTable() {
    const date = document.getElementById("filterDate").value;
    const tbody = document.getElementById("scheduleTableBody");
    tbody.innerHTML = "";

    const allBookings = getLocalBookings();
    const data = allBookings.filter(b => b.date === date);

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-slate-400">No lab slots booked for ${date}</td></tr>`;
        return;
    }

    data.sort((a, b) => a.slot.localeCompare(b.slot));

    data.forEach(b => {
        const row = document.createElement("tr");
        row.className = "transition";
        row.innerHTML = `
            <td class="p-3 border-b font-semibold text-slate-700">${b.slot}</td>
            <td class="p-3 border-b font-bold text-gitam-teal">${b.lab}</td>
            <td class="p-3 border-b">
                <div class="font-semibold text-slate-800">${b.course}</div>
                <div class="text-[11px] text-slate-500">${b.userName} (${b.role} — ${b.userId}) | Sem ${b.semester}</div>
            </td>
            <td class="p-3 border-b text-center">
                <span class="bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Filled</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.onload = function() {
    // Sync filter date with current date input if available
    const today = "2026-07-01";
    document.getElementById("filterDate").value = today;
    renderScheduleTable();
};
