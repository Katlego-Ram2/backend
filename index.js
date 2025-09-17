const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const pool = require("./db.js");

const AuthRoutes = require("./Auth.js");
const adminRoutes = require('./routes/admin.js');
const aaRouter = require("./routes/aa.js");
const resourcesRouter = require("./routes/resources.js");
const moduleRoutes = require("./routes/moduleRoutes.js");
const adminAuthRoutes = require("./routes/adminAuth.js");
const studentRoutes = require("./routes/student.js");
// const staticsRoutes = require("./routes/stats"); // path to statics.js
const userRoutes = require("./routes/user.js");
const studentLoginRoutes = require("./routes/login.js"); // ✅ Register student login
const admRoutes = require('./routes/adm.js'); // or './routes/adm' if you rename the file
const adminAuth = require('./routes/adminAuth.js');
// In your Express main server file (e.g., app.js or server.js)
const assignmentsRouter = require('./routes/assignments.js');
const calendarRoutes = require("./routes/calendar.js");
const asDisplayAssignmentsRouter = require("./routes/asDisplayAssignments.js");
const statsRoutes = require("./routes/stats.js");
const submitAssignment = require("./routes/submitAssignment.js");
const reportsRoutes = require("./routes/reports.js");
const submissionsRoutes = require("./routes/submissions.js");
const quizRoutes = require("./routes/quiz.js");
const quizSubmitRoutes = require("./routes/quizSubmit.js");
const quizSubmissionsRoutes = require("./routes/quizSubmissions.js");
const adminReportsRouter = require("./routes/adminReports.js");
const usersRoutes = require('./routes/usersRoutes.js');
const fixedQuizRoutes = require("./routes/fixedQuizRoutes.js");
const payRoutes = require("./routes/pay.js");




const app = express();

app.use(express.json());
app.use(cors());

// Static file routes
app.use("/uploads/resources", express.static(path.join(__dirname, "uploads/resources")));
app.use("/uploads", express.static("uploads"));


app.use("/api/user", userRoutes); // Route registrations
app.use("/auth", AuthRoutes);
app.use("/admin", adminRoutes);
app.use("/api", resourcesRouter);
app.use("/api", moduleRoutes);
app.use("/api", submitAssignment); 
app.use("/api/quiz", quizSubmitRoutes);
app.use(adminAuthRoutes);
app.use("/api", aaRouter);
app.use("/api/student", studentRoutes);       // ✅ Student features
app.use("/api/student", studentLoginRoutes);  // ✅ Student login endpoint
app.use('/api/adm', admRoutes); 
app.use('/admin', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/adm', adminAuth);
app.use('/api', assignmentsRouter);
app.use("/api/calendar", calendarRoutes);
app.use("/api/asDisplayAssignments", asDisplayAssignmentsRouter);
app.use("/admin", statsRoutes);
app.use("/api", reportsRoutes);
app.use("/api/submissions", submissionsRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/quizzes", quizSubmissionsRoutes);
app.use("/api/admin", adminReportsRouter);
app.use('/api', usersRoutes);
app.use("/api/fixed-quiz", fixedQuizRoutes);
app.use("/api/paypal", payRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/assignments", require("./routes/asUploadAssignments.js"));
// Server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
