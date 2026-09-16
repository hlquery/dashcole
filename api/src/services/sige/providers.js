import { SigeNotConfiguredError } from './errors.js';

export class SigeAuthProvider {
  async authenticate(_integration) { throw new SigeNotConfiguredError(); }
  async refresh(_context) { throw new SigeNotConfiguredError(); }
}

export class NullSigeAuthProvider extends SigeAuthProvider {
  async authenticate(_integration) { throw new SigeNotConfiguredError(); }
  async refresh(_context) { throw new SigeNotConfiguredError(); }
}

export class SigeProvider {
  constructor(authProvider) {
    this.authProvider = authProvider;
    this.capabilities = Object.freeze({
      students: Object.freeze({ read: false, write: false }),
      courses: Object.freeze({ read: false, write: false }),
      enrollments: Object.freeze({ read: false, write: false }),
      attendance: Object.freeze({ read: false, write: false }),
      grades: Object.freeze({ read: false, write: false }),
    });
  }
  async testConnection(_integration) { throw new SigeNotConfiguredError(); }
}

export class UnconfiguredSigeProvider extends SigeProvider {
  constructor(authProvider = new NullSigeAuthProvider()) { super(authProvider); }
}

export class SigeStudentService {
  constructor(syncService) { this.syncService = syncService; }
  sync(schoolId, studentId, actorId) { return this.syncService.syncStudent(schoolId, studentId, actorId); }
}
export class SigeCourseService {
  constructor(syncService) { this.syncService = syncService; }
  sync(schoolId, courseId, actorId) { return this.syncService.syncCourse(schoolId, courseId, actorId); }
}
export class SigeEnrollmentService {
  constructor(syncService) { this.syncService = syncService; }
  sync(schoolId, enrollmentId, actorId) { return this.syncService.syncEnrollment(schoolId, enrollmentId, actorId); }
}
export class SigeAttendanceService {
  constructor(syncService) { this.syncService = syncService; }
  sync(schoolId, date, actorId) { return this.syncService.syncAttendance(schoolId, date, actorId); }
}
export class SigeGradeService {
  constructor(syncService) { this.syncService = syncService; }
  sync(schoolId, entityId, actorId) { return this.syncService.syncGrades(schoolId, entityId, actorId); }
}
