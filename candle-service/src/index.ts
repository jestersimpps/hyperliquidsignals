import { CandleService } from './services/candleService.js';

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down candle service...');
  process.exit(0);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Start the service
const service = new CandleService();
service.start().catch((error) => {
  console.error('Failed to start candle service:', error);
  process.exit(1);
});
