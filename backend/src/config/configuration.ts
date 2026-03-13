/**
 * 配置文件 - 项目配置项
 */

export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true',
  },

  database: {
    type: process.env.DB_TYPE || 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'xianglixtangqin',
    autoSync: process.env.DB_AUTO_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },

  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || (2 * 1024 * 1024).toString(), 10), // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'aliyun',
    accessKeyId: process.env.SMS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.SMS_ACCESS_KEY_SECRET || '',
    signName: process.env.SMS_SIGN_NAME || '',
    templateCode: {
      register: process.env.SMS_TEMPLATE_CODE_REGISTER || '',
      login: process.env.SMS_TEMPLATE_CODE_LOGIN || '',
      resetPassword: process.env.SMS_TEMPLATE_CODE_RESET_PASSWORD || '',
    },
  },

  map: {
    provider: process.env.MAP_PROVIDER || 'amap',
    apiKey: process.env.MAP_API_KEY || '',
  },

  carpool: {
    maxDistance: parseInt(process.env.CARPOL_MAX_DISTANCE || '20', 10), // km
    maxPricePerPerson: parseInt(process.env.CARPOL_MAX_PRICE_PER_PERSON || '50', 10), // yuan
    bookingBeforeHours: parseInt(process.env.CARPOL_BOOKING_BEFORE_HOURS || '2', 10),
  },
});