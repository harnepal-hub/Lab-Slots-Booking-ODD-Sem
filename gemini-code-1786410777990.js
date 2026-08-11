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

// --- 2. FIREBASE CONFIGURATION ---
// Replace the values below with your credentials from the Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// --- 3. DYNAMIC COURSE DROPDOWN ---
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

// --- 4. CHECK & LOCK OCCUPIED SLOTS IN REALTIME ---
function checkSlotAvailability() {
    const lab = document.getElementById("labSelect").value;
    const date = document.getElementById("bookingDate").value;
    const container = document.getElementById("slotsContainer");
    document.getElementById("selectedSlot").value = "";

    if (!lab || !date) {
        container.innerHTML = '<p class="text-xs text-slate-400 col-span-2 py-2">Select Lab and Date to see available slots.</p>';
        return;
    }

    // Realtime lookup for existing bookings on selected lab and date
    db.ref("bookings").orderByChild("date").equalTo(date).on("value", (snapshot) => {
        const bookedSlots = [];
        snapshot.forEach((child) => {
            const b = child.val();
            if (b.lab === lab) {
                bookedSlots.push(b.slot);
            }
        });

        container.innerHTML = "";
        standardSlots.forEach(slot => {
            const isBooked = bookedSlots.includes(slot);
            const btn = document.createElement("button");
            btn.type = "button";
            
            if (isBooked) {
                btn.className = "slot-btn disabled p-2 text-xs font-medium rounded-lg border w-full text-left flex justify-between items-center";
                btn.innerHTML = `<span>${slot}</span> <span class="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Filled</span>`;
                btn.disabled = true;
            } else {
                btn.className = "slot-btn p-2 text-xs font-semibold rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-600 hover:text-white w-full text-center";
                btn.innerText = slot;
                btn.onclick = () => {
                    document.querySelectorAll("#slotsContainer button").forEach(b => b.classList.remove("selected"));
                    btn.classList.add("selected");
                    document.getElementById("selectedSlot").value = slot;
                };
            }
            container.appendChild(btn);
        });
    });
}

// --- 5. FORM SUBMISSION LISTENER ---
document.getElementById("bookingForm").onsubmit = function(e) {
    e.preventDefault();

    const slot = document.getElementById("selectedSlot").value;
    if (!slot) {
        alert("Please select an available slot.");
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

    // Save directly to Firebase Database
    const newRef = db.ref("bookings").push();
    newRef.set(newBooking, (error) => {
        if (error) {
            alert("Error saving booking: " + error.message);
        } else {
            alert(`Success! ${newBooking.lab} booked for ${newBooking.date} (${newBooking.slot}).`);
            document.getElementById("bookingForm").reset();
            document.getElementById("selectedSlot").value = "";
            document.getElementById("courseSelect").innerHTML = '<option value="">Select Semester First</option>';
            checkSlotAvailability();
            renderScheduleTable();
        }
    });
};

// --- 6. RENDER TIMETABLE OVERVIEW ---
function renderScheduleTable() {
    const date = document.getElementById("filterDate").value;
    const tbody = document.getElementById("scheduleTableBody");

    db.ref("bookings").orderByChild("date").equalTo(date).on("value", (snapshot) => {
        tbody.innerHTML = "";
        const data = [];
        snapshot.forEach(c => { data.push(c.val()); });

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400">No slots booked for ${date}</td></tr>`;
            return;
        }

        data.sort((a, b) => a.slot.localeCompare(b.slot));

        data.forEach(b => {
            const row = document.createElement("tr");
            row.className = "hover:bg-slate-50";
            row.innerHTML = `
                <td class="p-3 border-b font-medium text-slate-700">${b.slot}</td>
                <td class="p-3 border-b font-semibold text-indigo-900">${b.lab}</td>
                <td class="p-3 border-b">
                    <div class="font-medium text-slate-800">${b.course}</div>
                    <div class="text-[11px] text-slate-500">${b.userName} (${b.role} - ${b.userId}) | Sem ${b.semester}</div>
                </td>
                <td class="p-3 border-b">
                    <span class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Filled</span>
                </td>
            `;
            tbody.appendChild(row);
        });
    });
}

// Initial table load
window.onload = function() {
    renderScheduleTable();
};