import { DataTypes } from 'sequelize';

const migrations = [
  {
    id: '20260914_material_description',
    async up({ queryInterface, transaction }) {
      const tables = await queryInterface.showAllTables({ transaction });
      if (!tables.includes('teaching_materials')) return;
      const columns = await queryInterface.describeTable('teaching_materials');
      if (!columns.description) await queryInterface.addColumn('teaching_materials', 'description', { type: DataTypes.TEXT, allowNull: true }, { transaction });
    },
  },
  {
    id: '2026-09-13-control-plane-v1',
    async up({ queryInterface }) {
      // Tables and indexes are declared by Sequelize models and created by sync
      // before this additive baseline is recorded.
      await queryInterface.sequelize.query('SELECT 1');
    },
  },
  {
    id: '2026-09-13-database-routing-v1',
    async up({ queryInterface, transaction }) {
      const tables = await queryInterface.showAllTables({ transaction });
      if (!tables.map(value => String(value).toLowerCase()).includes('tenants')) return;
      const columns = await queryInterface.describeTable('tenants', { transaction });
      if (!columns.name) await queryInterface.addColumn('tenants', 'name', { type: DataTypes.STRING(150), allowNull: true }, { transaction });
    },
  },
  {
    id: '2026-09-13-tenant-pricing-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('tenant_plans')) return;
      const columns = await queryInterface.describeTable('tenant_plans', { transaction });
      const additions = {
        free_student_limit: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 10 },
        base_monthly_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        per_student_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'CLP' },
        custom_pricing: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      };
      for (const [column, definition] of Object.entries(additions)) if (!columns[column]) await queryInterface.addColumn('tenant_plans', column, definition, { transaction });
    },
  },
  {
    id: '2026-09-13-classroom-forum-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('forums')) return;
      const columns = await queryInterface.describeTable('forums', { transaction });
      if (!columns.pinned) await queryInterface.addColumn('forums', 'pinned', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, { transaction });
    },
  },
  {
    id: '2026-09-13-mineduc-annual-results-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      for (const [table, additions] of Object.entries({
        schools: { rbd: { type: DataTypes.STRING(12), allowNull: true, unique: true } },
        students: {
          national_id: { type: DataTypes.STRING(20), allowNull: true },
          identifier_type: { type: DataTypes.ENUM('rut', 'ipe'), allowNull: false, defaultValue: 'rut' },
        },
        subjects: { affects_promotion: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true } },
      })) {
        if (!tables.includes(table)) continue;
        const columns = await queryInterface.describeTable(table, { transaction });
        for (const [column, definition] of Object.entries(additions)) if (!columns[column]) await queryInterface.addColumn(table, column, definition, { transaction });
      }
    },
  },
  {
    id: '2026-09-13-global-user-identifier-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('global_users')) return;
      const columns = await queryInterface.describeTable('global_users', { transaction });
      if (!columns.identifier) {
        await queryInterface.addColumn('global_users', 'identifier', {
          type: DataTypes.STRING(40),
          allowNull: true,
        }, { transaction });
      }
      const indexes = await queryInterface.showIndex('global_users', { transaction });
      const hasUniqueIdentifier = indexes.some(index =>
        index.unique && index.fields?.length === 1 && index.fields[0]?.attribute === 'identifier'
      );
      if (!hasUniqueIdentifier) {
        await queryInterface.addIndex('global_users', ['identifier'], {
          name: 'global_users_identifier_unique',
          unique: true,
          transaction,
        });
      }
    },
  },
  {
    id: '2026-09-13-sige-foundation-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (tables.includes('users')) {
        const columns = await queryInterface.describeTable('users', { transaction });
        for (const column of ['can_view_sige', 'can_configure_sige', 'can_sync_sige', 'can_view_sige_logs']) {
          if (!columns[column]) await queryInterface.addColumn('users', column, { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, { transaction });
        }
      }
      if (tables.includes('attendance')) {
        const columns = await queryInterface.describeTable('attendance', { transaction });
        const additions = {
          arrival_time: { type: DataTypes.TIME, allowNull: true },
          late_minutes: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
          late_reason: { type: DataTypes.STRING(500), allowNull: true },
          late_justification: { type: DataTypes.STRING(1000), allowNull: true },
          late_observation: { type: DataTypes.STRING(1000), allowNull: true },
        };
        for (const [column, definition] of Object.entries(additions)) {
          if (!columns[column]) await queryInterface.addColumn('attendance', column, definition, { transaction });
        }
      }
    },
  },
  {
    id: '2026-09-14-school-logo-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('schools')) return;
      const columns = await queryInterface.describeTable('schools', { transaction });
      if (!columns.logo_key) await queryInterface.addColumn('schools', 'logo_key', { type: DataTypes.STRING(255), allowNull: true }, { transaction });
    },
  },
  {
    id: '2026-09-14-school-sidebar-logo-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('schools')) return;
      const columns = await queryInterface.describeTable('schools', { transaction });
      if (!columns.show_logo_in_sidebar) {
        await queryInterface.addColumn('schools', 'show_logo_in_sidebar', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-14-guardian-rut-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (tables.includes('guardians')) {
        const columns = await queryInterface.describeTable('guardians', { transaction });
        if (!columns.national_id) await queryInterface.addColumn('guardians', 'national_id', { type: DataTypes.STRING(20), allowNull: true }, { transaction });
      }
      if (tables.includes('admission_applications')) {
        const columns = await queryInterface.describeTable('admission_applications', { transaction });
        if (!columns.guardian_rut) await queryInterface.addColumn('admission_applications', 'guardian_rut', { type: DataTypes.STRING(20), allowNull: true }, { transaction });
      }
    },
  },
  {
    id: '2026-09-14-job-title-hierarchy-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('job_titles')) return;
      const columns = await queryInterface.describeTable('job_titles', { transaction });
      if (!columns.hierarchy) {
        await queryInterface.addColumn('job_titles', 'hierarchy', {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-15-forum-settings-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('courses')) return;
      const columns = await queryInterface.describeTable('courses', { transaction });
      if (!columns.allow_guardians_reply_forum) {
        await queryInterface.addColumn('courses', 'allow_guardians_reply_forum', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }, { transaction });
      }
      if (!columns.forum_guidelines) {
        await queryInterface.addColumn('courses', 'forum_guidelines', {
          type: DataTypes.TEXT,
          allowNull: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-15-school-education-stages-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('schools')) return;
      const columns = await queryInterface.describeTable('schools', { transaction });
      if (!columns.education_stages) {
        await queryInterface.addColumn('schools', 'education_stages', {
          type: DataTypes.JSON,
          allowNull: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-15-school-sidebar-collapsible-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('schools')) return;
      const columns = await queryInterface.describeTable('schools', { transaction });
      if (!columns.sidebar_collapsible) {
        await queryInterface.addColumn('schools', 'sidebar_collapsible', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-15-school-sidebar-panel-collapsible-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('schools')) return;
      const columns = await queryInterface.describeTable('schools', { transaction });
      if (!columns.sidebar_panel_collapsible) {
        await queryInterface.addColumn('schools', 'sidebar_panel_collapsible', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-15-school-sidebar-colors-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('schools')) return;
      const columns = await queryInterface.describeTable('schools', { transaction });
      if (!columns.sidebar_bg_color) {
        await queryInterface.addColumn('schools', 'sidebar_bg_color', {
          type: DataTypes.STRING(7),
          allowNull: true,
          defaultValue: '#0e2535',
        }, { transaction });
      }
      if (!columns.sidebar_text_color) {
        await queryInterface.addColumn('schools', 'sidebar_text_color', {
          type: DataTypes.STRING(7),
          allowNull: true,
          defaultValue: '#f3f7fb',
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-15-school-sidebar-font-size-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map(value => String(value).toLowerCase());
      if (!tables.includes('schools')) return;
      const columns = await queryInterface.describeTable('schools', { transaction });
      if (!columns.sidebar_font_size) {
        await queryInterface.addColumn('schools', 'sidebar_font_size', {
          type: DataTypes.DECIMAL(4, 1),
          allowNull: true,
          defaultValue: 14.7,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-15-user-team-active-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map((value) => String(value).toLowerCase());
      if (!tables.includes('users')) return;
      const columns = await queryInterface.describeTable('users', { transaction });
      if (!columns.team_active) {
        await queryInterface.addColumn('users', 'team_active', {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        }, { transaction });
        // Cuentas ya inactivas quedan fuera del equipo activo.
        await queryInterface.sequelize.query(
          'UPDATE users SET team_active = FALSE WHERE active = FALSE',
          { transaction }
        );
      }
    },
  },
  {
    id: '2026-09-15-tenant-membership-unique-school-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map((value) => String(value).toLowerCase());
      if (!tables.includes('tenant_memberships')) return;
      // Conservar la membresía más reciente por (global_user_id, tenant_id).
      await queryInterface.sequelize.query(`
        DELETE t1 FROM tenant_memberships t1
        INNER JOIN tenant_memberships t2
          ON t1.global_user_id = t2.global_user_id
         AND t1.tenant_id = t2.tenant_id
         AND t1.id < t2.id
      `, { transaction });
      const indexes = await queryInterface.showIndex('tenant_memberships', { transaction });
      const names = new Set(indexes.map((item) => String(item.name || '')));
      // Quitar índice antiguo que permitía varias filas del mismo colegio.
      for (const name of names) {
        if (name.includes('global_user') && name.includes('tenant') && name.includes('user')) {
          await queryInterface.removeIndex('tenant_memberships', name, { transaction }).catch(() => {});
        }
      }
      if (![...names].some((name) => name === 'tenant_memberships_global_tenant_unique')) {
        await queryInterface.addIndex('tenant_memberships', ['global_user_id', 'tenant_id'], {
          unique: true,
          name: 'tenant_memberships_global_tenant_unique',
          transaction,
        });
      }
    },
  },
  {
    id: '2026-09-16-communication-recipient-count-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map((value) => String(value).toLowerCase());
      if (!tables.includes('communications')) return;
      const columns = await queryInterface.describeTable('communications', { transaction });
      if (!columns.recipient_count) {
        await queryInterface.addColumn('communications', 'recipient_count', {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-16-employee-work-modality-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map((value) => String(value).toLowerCase());
      if (!tables.includes('employees')) return;
      const columns = await queryInterface.describeTable('employees', { transaction });
      if (!columns.work_modality) {
        await queryInterface.addColumn('employees', 'work_modality', {
          type: DataTypes.STRING(40),
          allowNull: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-16-forum-students-create-off-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map((value) => String(value).toLowerCase());
      if (!tables.includes('courses')) return;
      const columns = await queryInterface.describeTable('courses', { transaction });
      if (!columns.allow_students_create_forum) return;
      await queryInterface.sequelize.query(
        'UPDATE courses SET allow_students_create_forum = 0 WHERE allow_students_create_forum <> 0',
        { transaction },
      );
    },
  },
  {
    id: '2026-09-16-user-signature-key-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map((value) => String(value).toLowerCase());
      if (!tables.includes('users')) return;
      const columns = await queryInterface.describeTable('users', { transaction });
      if (!columns.signature_key) {
        await queryInterface.addColumn('users', 'signature_key', {
          type: DataTypes.STRING(255),
          allowNull: true,
        }, { transaction });
      }
    },
  },
  {
    id: '2026-09-16-school-city-v1',
    async up({ queryInterface, transaction }) {
      const tables = (await queryInterface.showAllTables({ transaction })).map((value) => String(value).toLowerCase());
      if (!tables.includes('schools')) return;
      const columns = await queryInterface.describeTable('schools', { transaction });
      if (!columns.city) {
        await queryInterface.addColumn('schools', 'city', {
          type: DataTypes.STRING(120),
          allowNull: true,
        }, { transaction });
      }
    },
  },
];

export async function runMigrations(sequelize) {
  const Migration = sequelize.define('SchemaMigration', {
    id: { type: DataTypes.STRING(100), primaryKey: true },
    appliedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW, field: 'applied_at' },
  }, { tableName: 'schema_migrations', timestamps: false });
  await Migration.sync();
  for (const migration of migrations) {
    if (await Migration.count({ where: { id: migration.id } })) continue;
    await sequelize.transaction(async transaction => {
      await migration.up({ queryInterface: sequelize.getQueryInterface(), transaction });
      await Migration.create({ id: migration.id }, { transaction });
    });
  }
}
