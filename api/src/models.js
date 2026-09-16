import { definePayrollModels } from './payroll-models.js';
import { DataTypes } from 'sequelize';

const id = { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true };
const scoped = () => ({
  id,
  schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'school_id' },
  createdBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'created_by' },
});
const options = (tableName, timestamps = true) => ({
  tableName,
  timestamps,
  underscored: true,
  createdAt: timestamps ? 'created_at' : false,
  updatedAt: timestamps ? 'updated_at' : false,
});

export function defineModels(sequelize) {
  const School = sequelize.define('School', {
    id,
    name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    rbd: { type: DataTypes.STRING(12), unique: true },
    address: DataTypes.STRING(255),
    city: { type: DataTypes.STRING(120), allowNull: true },
    phone: DataTypes.STRING(40),
    email: DataTypes.STRING(150),
    website: DataTypes.STRING(255),
    monthlyFee: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'monthly_fee' },
    schoolType: { type: DataTypes.ENUM('subvencionado', 'particular', 'publico'), allowNull: false, defaultValue: 'subvencionado', field: 'school_type' },
    originBank: { type: DataTypes.STRING(80), field: 'origin_bank' },
    originAccountType: { type: DataTypes.STRING(20), field: 'origin_account_type' },
    originAccountNumberEncrypted: { type: DataTypes.TEXT, field: 'origin_account_number_encrypted' },
    companyRut: { type: DataTypes.STRING(20), field: 'company_rut' },
    companyName: { type: DataTypes.STRING(150), field: 'company_name' },
    logoKey: { type: DataTypes.STRING(255), field: 'logo_key' },
    showLogoInSidebar: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'show_logo_in_sidebar' },
    sidebarCollapsible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'sidebar_collapsible' },
    sidebarPanelCollapsible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'sidebar_panel_collapsible' },
    sidebarBgColor: { type: DataTypes.STRING(7), allowNull: true, defaultValue: '#0e2535', field: 'sidebar_bg_color' },
    sidebarTextColor: { type: DataTypes.STRING(7), allowNull: true, defaultValue: '#f3f7fb', field: 'sidebar_text_color' },
    sidebarFontSize: { type: DataTypes.DECIMAL(4, 1), allowNull: true, defaultValue: 14.7, field: 'sidebar_font_size' },
    educationStages: { type: DataTypes.JSON, allowNull: true, field: 'education_stages' },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, options('schools'));
  const Campus = sequelize.define('Campus', {
    ...scoped(), name: { type: DataTypes.STRING(120), allowNull: false }, address: DataTypes.STRING(255),
  }, options('campuses'));
  const AcademicYear = sequelize.define('AcademicYear', {
    ...scoped(),
    name: { type: DataTypes.STRING(40), allowNull: false },
    startsOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'starts_on' },
    endsOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'ends_on' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, options('academic_years'));
  const User = sequelize.define('User', {
    ...scoped(),
    username: { type: DataTypes.STRING(150), allowNull: false },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    fullName: { type: DataTypes.STRING(120), allowNull: false, field: 'full_name' },
    role: { type: DataTypes.ENUM('super_admin', 'school_admin', 'director', 'manager', 'monitor', 'utp', 'finance', 'agente_finanzas', 'teacher', 'inspector', 'warehouse', 'guardian', 'student'), allowNull: false },
    canManageUsers: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_manage_users' },
    canManageGrades: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_manage_grades' },
    canViewReports: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_view_reports' },
    canManageSchool: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_manage_school' },
    canManageHr: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_manage_hr' },
    canManageFinance: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_manage_finance' },
    canApproveLeave: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_approve_leave' },
    canViewSige: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_view_sige' },
    canConfigureSige: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_configure_sige' },
    canSyncSige: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_sync_sige' },
    canViewSigeLogs: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'can_view_sige_logs' },
    avatarKey: { type: DataTypes.STRING(255), field: 'avatar_key' },
    signatureKey: { type: DataTypes.STRING(255), field: 'signature_key' },
    phone: DataTypes.STRING(40),
    whatsappOptIn: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'whatsapp_opt_in' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    teamActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'team_active' },
  }, { ...options('users'), indexes: [{ unique: true, fields: ['school_id', 'username'] }] });
  const Employee = sequelize.define('Employee', {
    ...scoped(), fullName: { type: DataTypes.STRING(120), field: 'full_name' },
    userId: { type: DataTypes.INTEGER.UNSIGNED, field: 'user_id' },
    campusId: { type: DataTypes.INTEGER.UNSIGNED, field: 'campus_id' },
    position: { type: DataTypes.STRING(100), allowNull: false },
    contractType: { type: DataTypes.STRING(60), field: 'contract_type' },
    workModality: { type: DataTypes.STRING(40), field: 'work_modality', allowNull: true },
    hiredOn: { type: DataTypes.DATEONLY, field: 'hired_on' },
    monthlySalary: { type: DataTypes.DECIMAL(12, 2), field: 'monthly_salary' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    endedOn: { type: DataTypes.DATEONLY, field: 'ended_on' },
    payrollProfile: { type: DataTypes.JSON, field: 'payroll_profile' },
    bank: { type: DataTypes.STRING(80) },
    accountType: { type: DataTypes.STRING(20), field: 'account_type' },
    accountNumberEncrypted: { type: DataTypes.TEXT, field: 'account_number_encrypted' },
    holderRut: { type: DataTypes.STRING(20), field: 'holder_rut' },
    email: { type: DataTypes.STRING(150) },
    paymentMethod: { type: DataTypes.STRING(20), field: 'payment_method', defaultValue: 'transferencia' },
  }, options('employees'));
  const JobTitle = sequelize.define('JobTitle', {
    ...scoped(),
    name: { type: DataTypes.STRING(100), allowNull: false },
    hierarchy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, { ...options('job_titles'), indexes: [{ unique: true, fields: ['school_id', 'name'] }] });
  const LeaveRequest = sequelize.define('LeaveRequest', {
    ...scoped(),
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'employee_id' },
    requestedByUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'requested_by_user_id' },
    type: {
      type: DataTypes.ENUM('vacation', 'permission', 'medical', 'personal', 'bereavement', 'training', 'other'),
      allowNull: false,
      defaultValue: 'vacation',
    },
    startsOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'starts_on' },
    endsOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'ends_on' },
    days: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    reason: { type: DataTypes.STRING(500), allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'retracted'),
      allowNull: false,
      defaultValue: 'pending',
    },
    reviewedByUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'reviewed_by_user_id' },
    reviewedAt: { type: DataTypes.DATE, allowNull: true, field: 'reviewed_at' },
    reviewerNotes: { type: DataTypes.STRING(500), allowNull: true, field: 'reviewer_notes' },
  }, {
    ...options('leave_requests'),
    indexes: [
      { fields: ['school_id', 'status', 'created_at'] },
      { fields: ['school_id', 'requested_by_user_id'] },
      { fields: ['school_id', 'employee_id'] },
    ],
  });
  LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId' });
  Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId' });
  LeaveRequest.belongsTo(User, { foreignKey: 'requestedByUserId', as: 'requester' });
  LeaveRequest.belongsTo(User, { foreignKey: 'reviewedByUserId', as: 'reviewer' });
  const Student = sequelize.define('Student', {
    ...scoped(),
    userId: { type: DataTypes.INTEGER.UNSIGNED, field: 'user_id' },
    firstName: { type: DataTypes.STRING(80), allowNull: false, field: 'first_name' },
    lastName: { type: DataTypes.STRING(80), allowNull: false, field: 'last_name' },
    email: DataTypes.STRING(150),
    nationalId: { type: DataTypes.STRING(20), field: 'national_id' },
    identifierType: { type: DataTypes.ENUM('rut', 'ipe'), allowNull: false, defaultValue: 'rut', field: 'identifier_type' },
    avatarKey: { type: DataTypes.STRING(255), field: 'avatar_key' },
    avatarColor: { type: DataTypes.STRING(20), defaultValue: '#DDEEFF', field: 'avatar_color' },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, options('students'));
  const Guardian = sequelize.define('Guardian', {
    ...scoped(),
    userId: { type: DataTypes.INTEGER.UNSIGNED, field: 'user_id' },
    fullName: { type: DataTypes.STRING(120), allowNull: false, field: 'full_name' },
    email: DataTypes.STRING(150),
    phone: DataTypes.STRING(40),
    nationalId: { type: DataTypes.STRING(20), field: 'national_id' },
  }, options('guardians'));
  const StudentGuardian = sequelize.define('StudentGuardian', {
    studentId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, field: 'student_id' },
    guardianId: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, field: 'guardian_id' },
    relationship: DataTypes.STRING(40),
  }, options('student_guardians', false));
  const Subject = sequelize.define('Subject', {
    ...scoped(), name: { type: DataTypes.STRING(100), allowNull: false }, code: DataTypes.STRING(30),
    sigeSubjectCode: { type: DataTypes.STRING(20), field: 'sige_subject_code' },
    affectsPromotion: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'affects_promotion' },
  }, options('subjects'));
  const Course = sequelize.define('Course', {
    ...scoped(),
    campusId: { type: DataTypes.INTEGER.UNSIGNED, field: 'campus_id' },
    academicYearId: { type: DataTypes.INTEGER.UNSIGNED, field: 'academic_year_id' },
    subjectId: { type: DataTypes.INTEGER.UNSIGNED, field: 'subject_id' },
    name: { type: DataTypes.STRING(80), allowNull: false },
    section: { type: DataTypes.STRING(10), allowNull: false },
    subject: { type: DataTypes.STRING(80), allowNull: false },
    teacher: { type: DataTypes.TEXT, allowNull: true },
    headTeacher: { type: DataTypes.TEXT, allowNull: true, field: 'head_teacher' },
    color: { type: DataTypes.STRING(20), defaultValue: '#0067b2' },
    monthlyFee: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'monthly_fee' },
    allowStudentsCreateForum: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'allow_students_create_forum' },
    allowStudentsReplyForum: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'allow_students_reply_forum' },
    allowGuardiansReplyForum: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'allow_guardians_reply_forum' },
    forumGuidelines: { type: DataTypes.TEXT, allowNull: true, field: 'forum_guidelines' },
    sigeTeachingTypeCode: { type: DataTypes.STRING(20), field: 'sige_teaching_type_code' },
    sigeGradeCode: { type: DataTypes.STRING(10), field: 'sige_grade_code' },
    sigeEvaluationDecreeCode: { type: DataTypes.STRING(40), field: 'sige_evaluation_decree_code' },
    sigeStudyPlanCode: { type: DataTypes.STRING(40), field: 'sige_study_plan_code' },
  }, { ...options('courses'), indexes: [{ unique: true, fields: ['school_id', 'name', 'section', 'subject'] }] });
  const CourseSchedule = sequelize.define('CourseSchedule', { ...scoped(), courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' }, day: { type: DataTypes.INTEGER, allowNull: false }, startsAt: { type: DataTypes.TIME, allowNull: false, field: 'starts_at' }, endsAt: { type: DataTypes.TIME, allowNull: false, field: 'ends_at' }, room: DataTypes.STRING(80) }, options('course_schedules'));
  CourseSchedule.belongsTo(Course, { foreignKey: 'courseId', onDelete: 'CASCADE' });
  const TeachingMaterial = sequelize.define('TeachingMaterial', {
    ...scoped(),
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    originalName: { type: DataTypes.STRING(255), allowNull: false, field: 'original_name' },
    mimeType: { type: DataTypes.STRING(120), allowNull: false, field: 'mime_type' },
    storageKey: { type: DataTypes.STRING(500), allowNull: false, field: 'storage_key' },
    size: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  }, options('teaching_materials'));
  const CourseLink = sequelize.define('CourseLink', {
    ...scoped(),
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    url: { type: DataTypes.STRING(2000), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, options('course_links'));
  const Assignment = sequelize.define('Assignment', {
    ...scoped(), courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    instructions: { type: DataTypes.TEXT, allowNull: false },
    dueAt: { type: DataTypes.DATE, allowNull: false, field: 'due_at' },
    originalName: { type: DataTypes.STRING(255), field: 'original_name' },
    mimeType: { type: DataTypes.STRING(120), field: 'mime_type' },
    storageKey: { type: DataTypes.STRING(500), field: 'storage_key' },
    size: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  }, options('assignments'));
  const Submission = sequelize.define('Submission', {
    ...scoped(), assignmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'assignment_id' },
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
    text: DataTypes.TEXT, originalName: { type: DataTypes.STRING(255), field: 'original_name' },
    storageKey: { type: DataTypes.STRING(500), field: 'storage_key' },
    feedback: DataTypes.TEXT,
  }, { ...options('submissions'), indexes: [{ unique: true, fields: ['assignment_id', 'student_id'] }] });
  const Forum = sequelize.define('Forum', {
    ...scoped(), courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    closed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    pinned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, options('forums'));
  const ForumPost = sequelize.define('ForumPost', {
    ...scoped(), forumId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'forum_id' },
    authorName: { type: DataTypes.STRING(120), allowNull: false, field: 'author_name' },
    text: { type: DataTypes.TEXT, allowNull: false },
  }, options('forum_posts'));
  const Enrollment = sequelize.define('Enrollment', {
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'school_id' },
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    status: { type: DataTypes.STRING(30), defaultValue: 'active' },
  }, { ...options('enrollments'), indexes: [{ unique: true, fields: ['student_id', 'course_id'] }] });
  const Grade = sequelize.define('Grade', {
    ...scoped(),
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    assessment: { type: DataTypes.STRING(120), allowNull: false },
    score: { type: DataTypes.DECIMAL(4, 2), allowNull: false },
    maxScore: { type: DataTypes.DECIMAL(4, 2), defaultValue: 7, field: 'max_score' },
    weight: { type: DataTypes.DECIMAL(5, 2), defaultValue: 25 },
    gradedAt: { type: DataTypes.DATEONLY, allowNull: false, field: 'graded_at' },
    feedback: DataTypes.STRING(500),
  }, options('grades'));
  const Attendance = sequelize.define('Attendance', {
    ...scoped(),
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    attendedOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'attended_on' },
    status: { type: DataTypes.ENUM('present', 'absent', 'late'), defaultValue: 'present' },
    arrivalTime: { type: DataTypes.TIME, field: 'arrival_time' },
    lateMinutes: { type: DataTypes.INTEGER.UNSIGNED, field: 'late_minutes' },
    lateReason: { type: DataTypes.STRING(500), field: 'late_reason' },
    lateJustification: { type: DataTypes.STRING(1000), field: 'late_justification' },
    lateObservation: { type: DataTypes.STRING(1000), field: 'late_observation' },
  }, { ...options('attendance'), indexes: [{ unique: true, fields: ['student_id', 'course_id', 'attended_on'] }] });

  const ClassSession = sequelize.define('ClassSession', {
    ...scoped(), courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    heldOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'held_on' }, content: DataTypes.TEXT,
    observations: DataTypes.TEXT, closedAt: { type: DataTypes.DATE, field: 'closed_at' },
  }, options('class_sessions'));
  const Observation = sequelize.define('Observation', {
    ...scoped(),
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, field: 'course_id' },
    kind: { type: DataTypes.ENUM('positive', 'negative', 'general'), defaultValue: 'general' },
    detail: { type: DataTypes.TEXT, allowNull: false },
    attachmentName: { type: DataTypes.STRING(255), field: 'attachment_name' },
    attachmentKey: { type: DataTypes.STRING(255), field: 'attachment_key' },
  }, options('observations'));
  const Invoice = sequelize.define('Invoice', {
    supplierId: { type: DataTypes.INTEGER.UNSIGNED, field: 'supplier_id' },
    ...scoped(), studentId: { type: DataTypes.INTEGER.UNSIGNED, field: 'student_id' },
    number: { type: DataTypes.STRING(50), allowNull: false }, amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    dueOn: { type: DataTypes.DATEONLY, field: 'due_on' }, status: { type: DataTypes.STRING(30), defaultValue: 'pending' },
    attachmentName: { type: DataTypes.STRING(255), field: 'attachment_name' },
    attachmentKey: { type: DataTypes.STRING(255), field: 'attachment_key' },
  }, options('invoices'));
  const Payment = sequelize.define('Payment', {
    ...scoped(), invoiceId: { type: DataTypes.INTEGER.UNSIGNED, field: 'invoice_id' },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }, paidAt: { type: DataTypes.DATE, allowNull: false, field: 'paid_at' },
    method: DataTypes.STRING(40),
  }, options('payments'));
  const Supplier = sequelize.define('Supplier', {
    ...scoped(), name: { type: DataTypes.STRING(150), allowNull: false },
    taxId: { type: DataTypes.STRING(30), field: 'tax_id' }, email: DataTypes.STRING(150),
  }, options('suppliers'));
  const Expense = sequelize.define('Expense', {
    ...scoped(), supplierId: { type: DataTypes.INTEGER.UNSIGNED, field: 'supplier_id' },
    concept: { type: DataTypes.STRING(180), allowNull: false }, amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    spentOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'spent_on' },
    costCenter: { type: DataTypes.STRING(80), field: 'cost_center' },
  }, options('expenses'));
  const FundingSource = sequelize.define('FundingSource', {
    ...scoped(),
    code: { type: DataTypes.STRING(40), allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    description: DataTypes.STRING(255),
    fiscalYear: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'fiscal_year' },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    requiresPmeAction: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'requires_pme_action' },
    requiresPieClassification: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'requires_pie_classification' },
    allowsProration: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'allows_proration' },
    metadataJson: { type: DataTypes.JSON, field: 'metadata_json' },
  }, { ...options('funding_sources'), indexes: [{ unique: true, fields: ['school_id', 'fiscal_year', 'code'] }] });
  const AccountabilityEntry = sequelize.define('AccountabilityEntry', {
    ...scoped(),
    period: { type: DataTypes.DATEONLY, allowNull: false },
    movementType: { type: DataTypes.ENUM('income', 'expense'), allowNull: false, field: 'movement_type' },
    fundingSource: { type: DataTypes.STRING(100), allowNull: false, field: 'funding_source' },
    category: { type: DataTypes.STRING(100), allowNull: false },
    pmeAction: { type: DataTypes.STRING(180), field: 'pme_action' },
    pieCategory: { type: DataTypes.STRING(120), field: 'pie_category' },
    documentType: { type: DataTypes.STRING(60), allowNull: false, field: 'document_type' },
    documentNumber: { type: DataTypes.STRING(80), allowNull: false, field: 'document_number' },
    counterparty: { type: DataTypes.STRING(160), allowNull: false },
    counterpartyTaxId: { type: DataTypes.STRING(20), field: 'counterparty_tax_id' },
    description: { type: DataTypes.STRING(500), allowNull: false },
    amount: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    status: { type: DataTypes.ENUM('draft', 'verified'), allowNull: false, defaultValue: 'draft' },
    complianceStatus: { type: DataTypes.ENUM('compatible', 'requiere_revision', 'incompatible_segun_regla', 'sin_clasificar'), allowNull: false, defaultValue: 'sin_clasificar', field: 'compliance_status' },
    complianceIssues: { type: DataTypes.JSON, field: 'compliance_issues' },
    reconciled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  }, { ...options('accountability_entries'), indexes: [{ fields: ['school_id', 'period'] }] });
  const InventoryItem = sequelize.define('InventoryItem', {
    ...scoped(), campusId: { type: DataTypes.INTEGER.UNSIGNED, field: 'campus_id' },
    name: { type: DataTypes.STRING(150), allowNull: false }, sku: DataTypes.STRING(60),
    stock: { type: DataTypes.INTEGER, defaultValue: 0 }, minimumStock: { type: DataTypes.INTEGER, defaultValue: 0, field: 'minimum_stock' },
    responsible: DataTypes.STRING(120),
  }, options('inventory_items'));
  const Incident = sequelize.define('Incident', {
    ...scoped(), studentId: { type: DataTypes.INTEGER.UNSIGNED, field: 'student_id' },
    occurredOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'occurred_on' },
    severity: { type: DataTypes.STRING(30), defaultValue: 'medium' }, detail: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.STRING(30), defaultValue: 'open' },
  }, options('incidents'));
  const Citation = sequelize.define('Citation', {
    ...scoped(),
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
    guardianId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'guardian_id' },
    scheduledOn: { type: DataTypes.DATEONLY, allowNull: false, field: 'scheduled_on' },
    scheduledTime: { type: DataTypes.STRING(5), allowNull: false, field: 'scheduled_time' },
    location: { type: DataTypes.STRING(180), allowNull: false, defaultValue: 'Dirección del colegio' },
    reason: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'), allowNull: false, defaultValue: 'scheduled' },
    emailStatus: { type: DataTypes.STRING(20), allowNull: true, field: 'email_status' },
  }, { ...options('citations'), indexes: [{ fields: ['school_id', 'scheduled_on'] }, { fields: ['school_id', 'guardian_id'] }] });
  const Communication = sequelize.define('Communication', {
    ...scoped(), channel: { type: DataTypes.ENUM('notification', 'email', 'message', 'whatsapp'), defaultValue: 'email' },
    audience: { type: DataTypes.ENUM('all', 'students', 'guardians', 'teachers', 'managers', 'student', 'guardian', 'course'), allowNull: false, defaultValue: 'all' },
    targetStudentId: { type: DataTypes.INTEGER.UNSIGNED, field: 'target_student_id' },
    targetGuardianId: { type: DataTypes.INTEGER.UNSIGNED, field: 'target_guardian_id' },
    courseId: { type: DataTypes.INTEGER.UNSIGNED, field: 'course_id' },
    recipientCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: 'recipient_count' },
    subject: { type: DataTypes.STRING(180), allowNull: false }, body: { type: DataTypes.TEXT, allowNull: false },
    sentAt: { type: DataTypes.DATE, field: 'sent_at' },
  }, options('communications'));
  const UserNotification = sequelize.define('UserNotification', {
    ...scoped(),
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
    studentId: { type: DataTypes.INTEGER.UNSIGNED, field: 'student_id' },
    gradeId: { type: DataTypes.INTEGER.UNSIGNED, field: 'grade_id' },
    subject: { type: DataTypes.STRING(180), allowNull: false },
    body: { type: DataTypes.STRING(500), allowNull: false },
  }, { ...options('user_notifications'), indexes: [{ fields: ['school_id', 'user_id'] }] });
  const Document = sequelize.define('Document', {
    employeeId: { type: DataTypes.INTEGER.UNSIGNED, field: 'employee_id' },
    userId: { type: DataTypes.INTEGER.UNSIGNED, field: 'user_id' },
    ...scoped(), studentId: { type: DataTypes.INTEGER.UNSIGNED, field: 'student_id' },
    kind: { type: DataTypes.STRING(60), allowNull: false }, name: { type: DataTypes.STRING(180), allowNull: false },
    storageKey: { type: DataTypes.STRING(500), allowNull: false, field: 'storage_key' },
  }, options('documents'));
  const MailDelivery = sequelize.define('MailDelivery', {
    ...scoped(), dedupeKey: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'dedupe_key' },
    template: { type: DataTypes.STRING(40), allowNull: false }, recipient: { type: DataTypes.STRING(150), allowNull: false },
    payload: DataTypes.JSON, status: { type: DataTypes.ENUM('pending', 'sent', 'failed'), allowNull: false, defaultValue: 'pending' },
    attempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    error: DataTypes.STRING(255), sentAt: { type: DataTypes.DATE, field: 'sent_at' },
  }, { ...options('mail_deliveries'), indexes: [{ fields: ['status', 'attempts'] }] });
  const WhatsappDelivery = sequelize.define('WhatsappDelivery', { ...scoped(), communicationId: { type:DataTypes.INTEGER.UNSIGNED, allowNull:false, field:'communication_id' }, userId: { type:DataTypes.INTEGER.UNSIGNED, allowNull:false, field:'user_id' }, recipient: { type:DataTypes.STRING(40), allowNull:false }, payload:DataTypes.JSON, status: { type:DataTypes.STRING(20),allowNull:false,defaultValue:'pending' }, externalId: { type:DataTypes.STRING(255),field:'external_id' }, error:DataTypes.STRING(255) }, {...options('whatsapp_deliveries'),indexes:[{unique:true,fields:['communication_id','recipient']}]});
  const AuditLog = sequelize.define('AuditLog', {
    ...scoped(), action: { type: DataTypes.STRING(80), allowNull: false },
    entity: { type: DataTypes.STRING(80), allowNull: false },
    entityId: { type: DataTypes.INTEGER.UNSIGNED, field: 'entity_id' }, payload: DataTypes.JSON,
  }, { ...options('audit_logs'), updatedAt: false });
  const GlobalUser = sequelize.define('GlobalUser', {
    id,
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    identifier: { type: DataTypes.STRING(40), unique: true },
    fullName: { type: DataTypes.STRING(120), allowNull: false, field: 'full_name' },
    phone: DataTypes.STRING(40),
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    status: { type: DataTypes.ENUM('active', 'blocked', 'suspended'), allowNull: false, defaultValue: 'active' },
    authMethod: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'password', field: 'auth_method' },
    lastLoginAt: { type: DataTypes.DATE, field: 'last_login_at' },
  }, options('global_users'));
  const TenantMembership = sequelize.define('TenantMembership', {
    id,
    globalUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'global_user_id' },
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'tenant_id' },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
    role: { type: DataTypes.STRING(40), allowNull: false },
    status: { type: DataTypes.ENUM('active', 'suspended', 'left'), allowNull: false, defaultValue: 'active' },
    joinedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'joined_at' },
    leftAt: { type: DataTypes.DATE, field: 'left_at' },
  }, { ...options('tenant_memberships'), indexes: [{ unique: true, fields: ['global_user_id', 'tenant_id'] }, { fields: ['tenant_id', 'status'] }] });
  const PlatformRole = sequelize.define('PlatformRole', {
    id,
    globalUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'global_user_id' },
    role: { type: DataTypes.STRING(40), allowNull: false },
    permissions: { type: DataTypes.JSON, allowNull: false },
  }, { ...options('platform_roles'), indexes: [{ unique: true, fields: ['global_user_id', 'role'] }] });
  const SessionRecord = sequelize.define('SessionRecord', {
    id,
    tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'token_hash' },
    globalUserId: { type: DataTypes.INTEGER.UNSIGNED, field: 'global_user_id' },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'user_id' },
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'tenant_id' },
    ip: DataTypes.STRING(64),
    userAgent: { type: DataTypes.STRING(255), field: 'user_agent' },
    lastSeenAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'last_seen_at' },
    revokedAt: { type: DataTypes.DATE, field: 'revoked_at' },
  }, { ...options('session_records'), indexes: [{ fields: ['global_user_id', 'revoked_at'] }] });
  const Impersonation = sequelize.define('Impersonation', {
    id,
    actorGlobalUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'actor_global_user_id' },
    targetUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'target_user_id' },
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'tenant_id' },
    reason: { type: DataTypes.STRING(500), allowNull: false },
    startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'started_at' },
    endedAt: { type: DataTypes.DATE, field: 'ended_at' },
    ip: DataTypes.STRING(64),
  }, { ...options('impersonations'), updatedAt: false });
  const AdmissionApplication = sequelize.define('AdmissionApplication', {
    ...scoped(),
    studentFirstName: { type: DataTypes.STRING(80), allowNull: false, field: 'student_first_name' },
    studentLastName: { type: DataTypes.STRING(80), allowNull: false, field: 'student_last_name' },
    studentRut: { type: DataTypes.STRING(20), field: 'student_rut' },
    guardianName: { type: DataTypes.STRING(120), allowNull: false, field: 'guardian_name' },
    guardianEmail: { type: DataTypes.STRING(150), allowNull: false, field: 'guardian_email' },
    guardianPhone: { type: DataTypes.STRING(40), field: 'guardian_phone' },
    guardianRut: { type: DataTypes.STRING(20), field: 'guardian_rut' },
    requestedLevel: { type: DataTypes.STRING(80), allowNull: false, field: 'requested_level' },
    answers: { type: DataTypes.JSON, allowNull: false },
    status: { type: DataTypes.ENUM('received', 'interview', 'evaluated', 'waiting', 'accepted', 'rejected'), allowNull: false, defaultValue: 'received' },
    reviewerNotes: { type: DataTypes.TEXT, field: 'reviewer_notes' },
  }, { ...options('admission_applications'), indexes: [{ fields: ['school_id', 'status', 'created_at'] }] });
  const PlanningUnit = sequelize.define('PlanningUnit', {
    ...scoped(),
    courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'course_id' },
    title: { type: DataTypes.STRING(180), allowNull: false },
    unitType: { type: DataTypes.ENUM('regular', 'diagnostic'), allowNull: false, defaultValue: 'regular', field: 'unit_type' },
    objectives: { type: DataTypes.JSON, allowNull: false },
    activities: { type: DataTypes.JSON, allowNull: false },
    adaptations: DataTypes.TEXT,
    status: { type: DataTypes.ENUM('draft', 'review', 'approved'), allowNull: false, defaultValue: 'draft' },
    startsOn: { type: DataTypes.DATEONLY, field: 'starts_on' },
    endsOn: { type: DataTypes.DATEONLY, field: 'ends_on' },
  }, { ...options('planning_units'), indexes: [{ fields: ['school_id', 'course_id', 'status'] }] });
  const PlanningComment = sequelize.define('PlanningComment', {
    ...scoped(),
    unitId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'unit_id' },
    body: { type: DataTypes.STRING(2000), allowNull: false },
  }, options('planning_comments'));
  const AnnualResult = sequelize.define('AnnualResult', {
    ...scoped(),
    academicYearId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'academic_year_id' },
    studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'student_id' },
    courseName: { type: DataTypes.STRING(80), allowNull: false, field: 'course_name' },
    section: { type: DataTypes.STRING(10), allowNull: false },
    identifierType: { type: DataTypes.ENUM('rut', 'ipe'), allowNull: false, field: 'identifier_type' },
    nationalId: { type: DataTypes.STRING(20), allowNull: false, field: 'national_id' },
    subjectResults: { type: DataTypes.JSON, allowNull: false, field: 'subject_results' },
    annualAverage: { type: DataTypes.DECIMAL(3, 1), allowNull: false, field: 'annual_average' },
    attendancePercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'attendance_percentage' },
    finalStatus: { type: DataTypes.ENUM('promoted', 'not_promoted', 'withdrawn'), allowNull: false, field: 'final_status' },
    decisionBasis: { type: DataTypes.TEXT, field: 'decision_basis' },
    decisionNotes: { type: DataTypes.TEXT, field: 'decision_notes' },
    decisionBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'decision_by' },
    decisionAt: { type: DataTypes.DATE, field: 'decision_at' },
    regulationVersion: { type: DataTypes.STRING(80), allowNull: false, defaultValue: 'decreto-67-2018', field: 'regulation_version' },
    finalizedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'finalized_by' },
    finalizedAt: { type: DataTypes.DATE, allowNull: false, field: 'finalized_at' },
    actaClosedAt: { type: DataTypes.DATE, field: 'acta_closed_at' },
    actaClosedBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'acta_closed_by' },
  }, { ...options('annual_results'), indexes: [{ unique: true, fields: ['school_id', 'academic_year_id', 'student_id'] }, { fields: ['school_id', 'academic_year_id', 'course_name', 'section'] }] });
  const CourseClosure = sequelize.define('CourseClosure', {
    ...scoped(),
    academicYearId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'academic_year_id' },
    courseName: { type: DataTypes.STRING(80), allowNull: false, field: 'course_name' },
    section: { type: DataTypes.STRING(10), allowNull: false },
    stage: {
      type: DataTypes.ENUM('preparation', 'teacher_ready', 'utp_approved', 'director_approved', 'closed'),
      allowNull: false,
      defaultValue: 'preparation',
    },
    teacherReadyAt: { type: DataTypes.DATE, field: 'teacher_ready_at' },
    teacherReadyBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'teacher_ready_by' },
    teacherComment: { type: DataTypes.STRING(1000), field: 'teacher_comment' },
    utpApprovedAt: { type: DataTypes.DATE, field: 'utp_approved_at' },
    utpApprovedBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'utp_approved_by' },
    utpComment: { type: DataTypes.STRING(1000), field: 'utp_comment' },
    directorApprovedAt: { type: DataTypes.DATE, field: 'director_approved_at' },
    directorApprovedBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'director_approved_by' },
    directorComment: { type: DataTypes.STRING(1000), field: 'director_comment' },
    closedAt: { type: DataTypes.DATE, field: 'closed_at' },
    closedBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'closed_by' },
    reopenReason: { type: DataTypes.STRING(2000), field: 'reopen_reason' },
  }, {
    ...options('course_closures'),
    indexes: [{ unique: true, fields: ['school_id', 'academic_year_id', 'course_name', 'section'] }],
  });
  const ContactMessage = sequelize.define('ContactMessage', {
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, field: 'school_id' },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    organization: DataTypes.STRING(150),
    subject: { type: DataTypes.STRING(180), allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM('new', 'read', 'closed'), allowNull: false, defaultValue: 'new' },
    sourceIpHash: { type: DataTypes.STRING(64), field: 'source_ip_hash' },
  }, { ...options('contact_messages'), indexes: [{ fields: ['status', 'created_at'] }] });
  const TenantDomain = sequelize.define('TenantDomain', {
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'tenant_id' },
    hostname: { type: DataTypes.STRING(253), allowNull: false, unique: true },
    verifiedAt: { type: DataTypes.DATE, field: 'verified_at' },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, options('tenant_domains'));
  const TenantPlan = sequelize.define('TenantPlan', {
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true, field: 'tenant_id' },
    code: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'standard' },
    status: { type: DataTypes.ENUM('trial', 'active', 'past_due', 'suspended'), allowNull: false, defaultValue: 'trial' },
    limits: { type: DataTypes.JSON, allowNull: false },
    freeStudentLimit: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 10, field: 'free_student_limit' },
    baseMonthlyPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'base_monthly_price' },
    perStudentPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, field: 'per_student_price' },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'CLP' },
    customPricing: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'custom_pricing' },
  }, options('tenant_plans'));
  const DemoRequest = sequelize.define('DemoRequest', {
    id,
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    phone: DataTypes.STRING(40),
    organization: { type: DataTypes.STRING(150), allowNull: false },
    studentCount: { type: DataTypes.INTEGER.UNSIGNED, field: 'student_count' },
    message: DataTypes.TEXT,
    status: { type: DataTypes.ENUM('new', 'contacted', 'converted', 'closed'), allowNull: false, defaultValue: 'new' },
    convertedSchoolId: { type: DataTypes.INTEGER.UNSIGNED, field: 'converted_school_id' },
    sourceIpHash: { type: DataTypes.STRING(64), field: 'source_ip_hash' },
  }, { ...options('demo_requests'), indexes: [{ fields: ['status', 'created_at'] }, { fields: ['email'] }] });
  const DatabaseServer = sequelize.define('DatabaseServer', {
    id, name: { type: DataTypes.STRING(100), allowNull: false }, host: { type: DataTypes.STRING(253), allowNull: false },
    port: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3306 }, username: { type: DataTypes.STRING(100), allowNull: false },
    encryptedPassword: { type: DataTypes.TEXT, field: 'encrypted_password' }, secretSource: { type: DataTypes.STRING(80), field: 'secret_source' },
    ssl: { type: DataTypes.JSON, allowNull: false }, region: DataTypes.STRING(80),
    status: { type: DataTypes.ENUM('active', 'offline', 'disabled'), allowNull: false, defaultValue: 'active' },
    isDefault: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_default' },
    lastCheckedAt: { type: DataTypes.DATE, field: 'last_checked_at' }, lastError: { type: DataTypes.STRING(500), field: 'last_error' },
  }, { ...options('database_servers'), indexes: [{ fields: ['status', 'is_default'] }] });
  const Tenant = sequelize.define('Tenant', {
    id, schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true, field: 'school_id' }, name: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    databaseServerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'database_server_id' },
    databaseName: { type: DataTypes.STRING(100), allowNull: false, field: 'database_name' },
    status: { type: DataTypes.ENUM('active', 'moving', 'suspended'), allowNull: false, defaultValue: 'active' },
  }, { ...options('tenants'), indexes: [{ fields: ['database_server_id', 'status'] }] });
  const PlatformSetting = sequelize.define('PlatformSetting', {
    id,
    key: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    config: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    encryptedSecret: { type: DataTypes.TEXT, field: 'encrypted_secret' },
    updatedBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'updated_by' },
  }, options('platform_settings'));
  const PlatformBillingOrder = sequelize.define('PlatformBillingOrder', {
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'school_id' },
    buyOrder: { type: DataTypes.STRING(26), allowNull: false, unique: true, field: 'buy_order' },
    kind: { type: DataTypes.ENUM('webpay_plus', 'oneclick_inscription', 'oneclick_charge'), allowNull: false, defaultValue: 'webpay_plus' },
    status: { type: DataTypes.ENUM('pending', 'redirected', 'authorized', 'failed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    amount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    months: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'CLP' },
    token: DataTypes.STRING(120),
    sessionId: { type: DataTypes.STRING(120), field: 'session_id' },
    authorizationCode: { type: DataTypes.STRING(40), field: 'authorization_code' },
    responseCode: { type: DataTypes.INTEGER, field: 'response_code' },
    cardLast4: { type: DataTypes.STRING(4), field: 'card_last4' },
    tbkUser: { type: DataTypes.STRING(120), field: 'tbk_user' },
    username: DataTypes.STRING(150),
    paidAt: { type: DataTypes.DATE, field: 'paid_at' },
    createdBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'created_by' },
    payload: DataTypes.JSON,
  }, { ...options('platform_billing_orders'), indexes: [{ fields: ['school_id', 'status'] }, { fields: ['token'] }] });
  const SigeIntegration = sequelize.define('SigeIntegration', {
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true, field: 'school_id' },
    rbd: { type: DataTypes.STRING(12), allowNull: false },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    connectionStatus: { type: DataTypes.ENUM('not_configured', 'configured', 'testing', 'connected', 'error', 'disabled'), allowNull: false, defaultValue: 'not_configured', field: 'connection_status' },
    authType: { type: DataTypes.STRING(40), field: 'auth_type' },
    credentialsEncrypted: { type: DataTypes.TEXT, field: 'credentials_encrypted' },
    lastSyncAt: { type: DataTypes.DATE, field: 'last_sync_at' },
    lastSuccessfulSyncAt: { type: DataTypes.DATE, field: 'last_successful_sync_at' },
    lastError: { type: DataTypes.STRING(1000), field: 'last_error' },
  }, options('sige_integrations'));
  const mappingFields = localField => ({
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'school_id' },
    [localField]: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: localField.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`) },
    externalId: { type: DataTypes.STRING(160), field: 'external_id' },
    syncStatus: { type: DataTypes.ENUM('local_only', 'pending', 'syncing', 'synced', 'error'), allowNull: false, defaultValue: 'local_only', field: 'sync_status' },
    lastSyncedAt: { type: DataTypes.DATE, field: 'last_synced_at' },
    lastAttemptAt: { type: DataTypes.DATE, field: 'last_attempt_at' },
    lastError: { type: DataTypes.STRING(1000), field: 'last_error' },
    payloadHash: { type: DataTypes.STRING(64), field: 'payload_hash' },
    remotePayloadHash: { type: DataTypes.STRING(64), field: 'remote_payload_hash' },
  });
  const SigeStudentMapping = sequelize.define('SigeStudentMapping', mappingFields('studentId'), { ...options('sige_student_mappings'), indexes: [{ unique: true, fields: ['school_id', 'student_id'] }, { fields: ['school_id', 'sync_status'] }] });
  const SigeCourseMapping = sequelize.define('SigeCourseMapping', mappingFields('courseId'), { ...options('sige_course_mappings'), indexes: [{ unique: true, fields: ['school_id', 'course_id'] }, { fields: ['school_id', 'sync_status'] }] });
  const SigeEnrollmentMapping = sequelize.define('SigeEnrollmentMapping', mappingFields('enrollmentId'), { ...options('sige_enrollment_mappings'), indexes: [{ unique: true, fields: ['school_id', 'enrollment_id'] }, { fields: ['school_id', 'sync_status'] }] });
  const SigeSyncJob = sequelize.define('SigeSyncJob', {
    ...scoped(),
    jobType: { type: DataTypes.ENUM('SIGE_SYNC_STUDENT', 'SIGE_SYNC_COURSE', 'SIGE_SYNC_ENROLLMENT', 'SIGE_SYNC_ATTENDANCE', 'SIGE_SYNC_GRADES'), allowNull: false, field: 'job_type' },
    entityType: { type: DataTypes.ENUM('student', 'course', 'enrollment', 'attendance', 'grades'), allowNull: false, field: 'entity_type' },
    entityId: { type: DataTypes.INTEGER.UNSIGNED, field: 'entity_id' },
    dedupeKey: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'dedupe_key' },
    status: { type: DataTypes.ENUM('pending', 'running', 'succeeded', 'failed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    attempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    maxAttempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 3, field: 'max_attempts' },
    payload: { type: DataTypes.JSON, allowNull: false },
    result: DataTypes.JSON,
    error: DataTypes.STRING(1000),
    scheduledAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'scheduled_at' },
    startedAt: { type: DataTypes.DATE, field: 'started_at' },
    finishedAt: { type: DataTypes.DATE, field: 'finished_at' },
  }, { ...options('sige_sync_jobs'), indexes: [{ fields: ['school_id', 'status', 'scheduled_at'] }] });
  const SigeSyncLog = sequelize.define('SigeSyncLog', {
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'school_id' },
    entityType: { type: DataTypes.STRING(40), allowNull: false, field: 'entity_type' },
    entityId: { type: DataTypes.INTEGER.UNSIGNED, field: 'entity_id' },
    operation: { type: DataTypes.STRING(80), allowNull: false },
    direction: { type: DataTypes.ENUM('inbound', 'outbound'), allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'success', 'error', 'skipped'), allowNull: false },
    requestPayload: { type: DataTypes.JSON, field: 'request_payload' },
    responsePayload: { type: DataTypes.JSON, field: 'response_payload' },
    httpStatus: { type: DataTypes.INTEGER.UNSIGNED, field: 'http_status' },
    errorCode: { type: DataTypes.STRING(80), field: 'error_code' },
    errorMessage: { type: DataTypes.STRING(1000), field: 'error_message' },
    attempt: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    startedAt: { type: DataTypes.DATE, allowNull: false, field: 'started_at' },
    finishedAt: { type: DataTypes.DATE, field: 'finished_at' },
  }, { ...options('sige_sync_logs'), updatedAt: false, indexes: [{ fields: ['school_id', 'status', 'created_at'] }] });
  const SigeConflict = sequelize.define('SigeConflict', {
    ...scoped(),
    entityType: { type: DataTypes.STRING(40), allowNull: false, field: 'entity_type' },
    entityId: { type: DataTypes.INTEGER.UNSIGNED, field: 'entity_id' },
    conflictType: { type: DataTypes.ENUM('LOCAL_NEWER', 'REMOTE_NEWER', 'BOTH_CHANGED', 'REMOTE_NOT_FOUND', 'LOCAL_NOT_FOUND'), allowNull: false, field: 'conflict_type' },
    localPayload: { type: DataTypes.JSON, field: 'local_payload' },
    remotePayload: { type: DataTypes.JSON, field: 'remote_payload' },
    status: { type: DataTypes.ENUM('open', 'resolved', 'dismissed'), allowNull: false, defaultValue: 'open' },
    resolvedBy: { type: DataTypes.INTEGER.UNSIGNED, field: 'resolved_by' },
    resolvedAt: { type: DataTypes.DATE, field: 'resolved_at' },
  }, { ...options('sige_conflicts'), indexes: [{ fields: ['school_id', 'status', 'conflict_type'] }] });
  const SchoolIntegration = sequelize.define('SchoolIntegration', {
    id,
    schoolId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: 'school_id' },
    provider: { type: DataTypes.STRING(40), allowNull: false },
    config: { type: DataTypes.JSON, allowNull: false },
    encryptedSecret: { type: DataTypes.TEXT, field: 'encrypted_secret' },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  }, { ...options('school_integrations'), indexes: [{ unique: true, fields: ['school_id', 'provider'] }] });
  const PageVisit = sequelize.define('PageVisit', {
    id,
    route: { type: DataTypes.STRING(500), allowNull: false },
    sessionHash: { type: DataTypes.STRING(64), allowNull: false, field: 'session_hash' },
    referrerHost: { type: DataTypes.STRING(253), field: 'referrer_host' },
    sourceApp: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'web', field: 'source_app' },
  }, { ...options('page_visits'), indexes: [{ fields: ['created_at'] }] });

  School.hasMany(Campus, { foreignKey: 'schoolId' });
  School.hasMany(User, { foreignKey: 'schoolId' });
  User.hasOne(Employee, { foreignKey: 'userId' });
  Employee.belongsTo(User, { foreignKey: 'userId' });
  School.hasMany(Student, { foreignKey: 'schoolId' });
  User.hasOne(Student, { foreignKey: 'userId' });
  Student.belongsTo(User, { foreignKey: 'userId' });
  User.hasOne(Guardian, { foreignKey: 'userId' });
  Guardian.belongsTo(User, { foreignKey: 'userId' });
  Student.belongsToMany(Guardian, { through: StudentGuardian, foreignKey: 'studentId' });
  Guardian.belongsToMany(Student, { through: StudentGuardian, foreignKey: 'guardianId' });
  Student.belongsToMany(Course, { through: Enrollment, foreignKey: 'studentId' });
  Course.belongsToMany(Student, { through: Enrollment, foreignKey: 'courseId' });
  Student.hasMany(Grade, { foreignKey: 'studentId' });
  Course.hasMany(Grade, { foreignKey: 'courseId' });
  Course.hasMany(TeachingMaterial, { foreignKey: 'courseId' });
  Course.hasMany(CourseLink, { foreignKey: 'courseId' });
  Student.hasMany(Attendance, { foreignKey: 'studentId' });
  Course.hasMany(Attendance, { foreignKey: 'courseId' });
  Invoice.hasMany(Payment, { foreignKey: 'invoiceId' });
  Supplier.hasMany(Expense, { foreignKey: 'supplierId' });
  GlobalUser.hasMany(TenantMembership, { foreignKey: 'globalUserId' });
  TenantMembership.belongsTo(GlobalUser, { foreignKey: 'globalUserId' });
  School.hasMany(TenantMembership, { foreignKey: 'schoolId' });
  GlobalUser.hasMany(PlatformRole, { foreignKey: 'globalUserId' });
  Course.hasMany(PlanningUnit, { foreignKey: 'courseId' });
  PlanningUnit.hasMany(PlanningComment, { foreignKey: 'unitId', onDelete: 'CASCADE' });
  School.hasMany(TenantDomain, { foreignKey: 'schoolId' });
  School.hasOne(TenantPlan, { foreignKey: 'schoolId' });
  School.hasMany(SchoolIntegration, { foreignKey: 'schoolId' });
  School.hasOne(SigeIntegration, { foreignKey: 'schoolId' });

  return {
    ...definePayrollModels(sequelize),
    WhatsappDelivery,
    School, Campus, AcademicYear, User, Employee, JobTitle, Student, Guardian, StudentGuardian,
    Subject, Course, CourseSchedule, TeachingMaterial, CourseLink, Assignment, Submission, Forum, ForumPost, Enrollment, Grade, Attendance, ClassSession, Observation,
    Invoice, Payment, Supplier, Expense, FundingSource, AccountabilityEntry, InventoryItem, Incident, Citation, Communication, UserNotification,
    Document, AuditLog, MailDelivery, GlobalUser, TenantMembership, PlatformRole, SessionRecord, Impersonation,
    AdmissionApplication, PlanningUnit, PlanningComment, AnnualResult, CourseClosure, ContactMessage, LeaveRequest,
    TenantDomain, TenantPlan, DemoRequest, DatabaseServer, Tenant, PlatformSetting, PlatformBillingOrder, SchoolIntegration,
    SigeIntegration, SigeStudentMapping, SigeCourseMapping, SigeEnrollmentMapping, SigeSyncJob, SigeSyncLog, SigeConflict,
    PageVisit,
  };
}
