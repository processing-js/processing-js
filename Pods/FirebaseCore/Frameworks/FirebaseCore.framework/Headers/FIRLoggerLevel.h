/**
 * The log levels used by internal logging.
 */
typedef NS_ENUM(NSInteger, FIRLoggerLevel) {
  FIRLoggerLevelError = 3 /*ASL_LEVEL_ERR*/,
  FIRLoggerLevelWarning = 4 /*ASL_LEVEL_WARNING*/,
  FIRLoggerLevelNotice = 5 /*ASL_LEVEL_NOTICE*/,
  FIRLoggerLevelInfo = 6 /*ASL_LEVEL_INFO*/,
  FIRLoggerLevelDebug = 7 /*ASL_LEVEL_DEBUG*/,
  FIRLoggerLevelMin = FIRLoggerLevelError,
  FIRLoggerLevelMax = FIRLoggerLevelDebug
};
