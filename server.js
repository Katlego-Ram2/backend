const path = require("path");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const pool = require("./db");

const AuthRoutes = require("./Auth");
const adminRoutes = require('./routes/admin');
const aaRouter = require("./routes/aa");
const resourcesRouter = require("./routes/resources");
const moduleRoutes = require("./routes/moduleRoutes");
const adminAuthRoutes = require("./routes/adminAuth");
const studentRoutes = require("./routes/student");
// const staticsRoutes = require("./routes/stats"); // path to statics.js
const userRoutes = require("./routes/user");
const studentLoginRoutes = require("./routes/login"); // ✅ Register student login
const admRoutes = require('./routes/adm'); // or './routes/adm' if you rename the file
const adminAuth = require('./routes/adminAuth');
// In your Express main server file (e.g., app.js or server.js)
const assignmentsRouter = require('./routes/assignments');
const calendarRoutes = require("./routes/calendar");
const asDisplayAssignmentsRouter = require("./routes/asDisplayAssignments");
const statsRoutes = require("./routes/stats");
const submitAssignment = require("./routes/submitAssignment");
const reportsRoutes = require("./routes/reports");
const submissionsRoutes = require("./routes/submissions");
const quizRoutes = require("./routes/quiz");
const quizSubmitRoutes = require("./routes/quizSubmit");
const quizSubmissionsRoutes = require("./routes/quizSubmissions.js");
const adminReportsRouter = require("./routes/adminReports");
const usersRoutes = require('./routes/usersRoutes');
const fixedQuizRoutes = require("./routes/fixedQuizRoutes");



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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/assignments", require("./routes/asUploadAssignments"));
// Server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
