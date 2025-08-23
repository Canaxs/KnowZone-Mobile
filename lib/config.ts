const ENV = {
    development: {
      API_BASE_URL: 'http://192.168.1.105:8080',
      WS_URL: 'http://192.168.1.105:8080/ws'
    },
    production: {
      API_BASE_URL: 'https://your-production-domain.com',
      WS_URL: 'wss://your-production-domain.com/ws'
    }
};

const currentEnv = 'development';

export const config = {
    API_BASE_URL: ENV[currentEnv].API_BASE_URL,
    WS_URL: ENV[currentEnv].WS_URL,
    TIMEOUT: 10000,
};