import { DataTypes as D } from 'sequelize';

export function defineControlModels(sequelize) {
  const id = { type: D.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true };
  const opts = tableName => ({ tableName, underscored: true, timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
  const GlobalUser = sequelize.define('ControlGlobalUser', {
    id,
    email:{type:D.STRING(150),allowNull:false,unique:true},
    identifier:{type:D.STRING(40),unique:true},
    fullName:{type:D.STRING(120),allowNull:false,field:'full_name'},
    phone:D.STRING(40),
    passwordHash:{type:D.STRING(255),allowNull:false,field:'password_hash'},
    status:{type:D.ENUM('active','blocked','suspended'),allowNull:false,defaultValue:'active'},
    authMethod:{type:D.STRING(40),allowNull:false,defaultValue:'password',field:'auth_method'},
    lastLoginAt:{type:D.DATE,field:'last_login_at'},
    preferredSchoolId:{type:D.INTEGER.UNSIGNED,allowNull:true,field:'preferred_school_id'},
    askSchoolOnLogin:{type:D.BOOLEAN,allowNull:false,defaultValue:true,field:'ask_school_on_login'},
  },opts('global_users'));
  const TenantMembership = sequelize.define('ControlTenantMembership',{id,globalUserId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'global_user_id'},schoolId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'tenant_id'},userId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'user_id'},role:{type:D.STRING(40),allowNull:false},status:{type:D.ENUM('active','suspended','left'),allowNull:false,defaultValue:'active'},joinedAt:{type:D.DATE,allowNull:false,defaultValue:D.NOW,field:'joined_at'},leftAt:{type:D.DATE,field:'left_at'}},{...opts('tenant_memberships'),indexes:[{unique:true,fields:['global_user_id','tenant_id']},{fields:['tenant_id','status']}]});
  const PlatformRole = sequelize.define('ControlPlatformRole',{id,globalUserId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'global_user_id'},role:{type:D.STRING(40),allowNull:false},permissions:{type:D.JSON,allowNull:false}},{...opts('platform_roles'),indexes:[{unique:true,fields:['global_user_id','role']}]});
  const SessionRecord = sequelize.define('ControlSessionRecord',{id,tokenHash:{type:D.STRING(64),allowNull:false,unique:true,field:'token_hash'},globalUserId:{type:D.INTEGER.UNSIGNED,field:'global_user_id'},userId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'user_id'},schoolId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'tenant_id'},ip:D.STRING(64),userAgent:{type:D.STRING(255),field:'user_agent'},lastSeenAt:{type:D.DATE,allowNull:false,defaultValue:D.NOW,field:'last_seen_at'},revokedAt:{type:D.DATE,field:'revoked_at'}},{...opts('session_records'),indexes:[{fields:['global_user_id','revoked_at']}]});
  const Impersonation = sequelize.define('ControlImpersonation',{id,actorGlobalUserId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'actor_global_user_id'},targetUserId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'target_user_id'},schoolId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'tenant_id'},reason:{type:D.STRING(500),allowNull:false},startedAt:{type:D.DATE,allowNull:false,defaultValue:D.NOW,field:'started_at'},endedAt:{type:D.DATE,field:'ended_at'},ip:D.STRING(64)},{...opts('impersonations'),updatedAt:false});
  const TenantDomain = sequelize.define('ControlTenantDomain',{id,schoolId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'tenant_id'},hostname:{type:D.STRING(253),allowNull:false,unique:true},verifiedAt:{type:D.DATE,field:'verified_at'},active:{type:D.BOOLEAN,allowNull:false,defaultValue:true}},opts('tenant_domains'));
  const TenantPlan = sequelize.define('ControlTenantPlan',{id,schoolId:{type:D.INTEGER.UNSIGNED,allowNull:false,unique:true,field:'tenant_id'},code:{type:D.STRING(40),allowNull:false,defaultValue:'standard'},status:{type:D.ENUM('trial','active','past_due','suspended'),allowNull:false,defaultValue:'trial'},limits:{type:D.JSON,allowNull:false},freeStudentLimit:{type:D.INTEGER.UNSIGNED,allowNull:false,defaultValue:10,field:'free_student_limit'},baseMonthlyPrice:{type:D.DECIMAL(12,2),allowNull:false,defaultValue:0,field:'base_monthly_price'},perStudentPrice:{type:D.DECIMAL(12,2),allowNull:false,defaultValue:0,field:'per_student_price'},currency:{type:D.STRING(3),allowNull:false,defaultValue:'CLP'},customPricing:{type:D.BOOLEAN,allowNull:false,defaultValue:false,field:'custom_pricing'}},opts('tenant_plans'));
  const DemoRequest = sequelize.define('ControlDemoRequest',{id,name:{type:D.STRING(120),allowNull:false},email:{type:D.STRING(150),allowNull:false},phone:D.STRING(40),organization:{type:D.STRING(150),allowNull:false},studentCount:{type:D.INTEGER.UNSIGNED,field:'student_count'},message:D.TEXT,status:{type:D.ENUM('new','contacted','converted','closed'),allowNull:false,defaultValue:'new'},convertedSchoolId:{type:D.INTEGER.UNSIGNED,field:'converted_school_id'},sourceIpHash:{type:D.STRING(64),field:'source_ip_hash'}},{...opts('demo_requests'),indexes:[{fields:['status','created_at']},{fields:['email']}]});
  const DatabaseServer = sequelize.define('ControlDatabaseServer',{id,name:{type:D.STRING(100),allowNull:false},host:{type:D.STRING(253),allowNull:false},port:{type:D.INTEGER.UNSIGNED,allowNull:false,defaultValue:3306},username:{type:D.STRING(100),allowNull:false},encryptedPassword:{type:D.TEXT,field:'encrypted_password'},secretSource:{type:D.STRING(80),field:'secret_source'},ssl:{type:D.JSON,allowNull:false},region:D.STRING(80),status:{type:D.ENUM('active','offline','disabled'),allowNull:false,defaultValue:'active'},isDefault:{type:D.BOOLEAN,allowNull:false,defaultValue:false,field:'is_default'},lastCheckedAt:{type:D.DATE,field:'last_checked_at'},lastError:{type:D.STRING(500),field:'last_error'}},{...opts('database_servers'),indexes:[{fields:['status','is_default']}]});
  const Tenant = sequelize.define('ControlTenant',{id,schoolId:{type:D.INTEGER.UNSIGNED,allowNull:false,unique:true,field:'school_id'},name:{type:D.STRING(150),allowNull:false},slug:{type:D.STRING(100),allowNull:false,unique:true},databaseServerId:{type:D.INTEGER.UNSIGNED,allowNull:false,field:'database_server_id'},databaseName:{type:D.STRING(100),allowNull:false,field:'database_name'},status:{type:D.ENUM('active','moving','suspended'),allowNull:false,defaultValue:'active'}},{...opts('tenants'),indexes:[{fields:['database_server_id','status']}]});
  const PlatformSetting = sequelize.define('ControlPlatformSetting',{
    id,
    key:{type:D.STRING(80),allowNull:false,unique:true},
    config:{type:D.JSON,allowNull:false,defaultValue:{}},
    encryptedSecret:{type:D.TEXT,field:'encrypted_secret'},
    updatedBy:{type:D.INTEGER.UNSIGNED,field:'updated_by'},
  },opts('platform_settings'));
  const PlatformBillingOrder = sequelize.define('ControlPlatformBillingOrder', {
    id,
    schoolId: { type: D.INTEGER.UNSIGNED, allowNull: false, field: 'school_id' },
    buyOrder: { type: D.STRING(26), allowNull: false, unique: true, field: 'buy_order' },
    kind: { type: D.ENUM('webpay_plus', 'oneclick_inscription', 'oneclick_charge'), allowNull: false, defaultValue: 'webpay_plus' },
    status: { type: D.ENUM('pending', 'redirected', 'authorized', 'failed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    amount: { type: D.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    months: { type: D.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
    currency: { type: D.STRING(3), allowNull: false, defaultValue: 'CLP' },
    token: D.STRING(120),
    sessionId: { type: D.STRING(120), field: 'session_id' },
    authorizationCode: { type: D.STRING(40), field: 'authorization_code' },
    responseCode: { type: D.INTEGER, field: 'response_code' },
    cardLast4: { type: D.STRING(4), field: 'card_last4' },
    tbkUser: { type: D.STRING(120), field: 'tbk_user' },
    username: D.STRING(150),
    paidAt: { type: D.DATE, field: 'paid_at' },
    createdBy: { type: D.INTEGER.UNSIGNED, field: 'created_by' },
    payload: D.JSON,
  }, { ...opts('platform_billing_orders'), indexes: [{ fields: ['school_id', 'status'] }, { fields: ['token'] }] });
  return {GlobalUser,TenantMembership,PlatformRole,SessionRecord,Impersonation,TenantDomain,TenantPlan,DemoRequest,DatabaseServer,Tenant,PlatformSetting,PlatformBillingOrder};
}
