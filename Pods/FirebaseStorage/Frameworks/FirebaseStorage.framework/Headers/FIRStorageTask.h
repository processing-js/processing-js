// clang-format off
/** @file FIRStorageTask.h
    @brief Firebase SDK
    @copyright Copyright 2016 Google Inc.
    @remarks Use of this SDK is subject to the Google APIs Terms of Service:
    https://developers.google.com/terms/
 */
// clang-format on

#import <Foundation/Foundation.h>

#import "FIRStorageConstants.h"
#import "FIRStorageMetadata.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * A superclass to all FIRStorage*Tasks, including FIRStorageUploadTask
 * and FIRStorageDownloadTask, to provide state transitions, event raising, and common storage
 * or metadata and errors.
 * Callbacks are always fired on the developer specified callback queue.
 * If no queue is specified by the developer, it defaults to the main queue.
 * Currently not thread safe, so only call methods on the main thread.
 */
@interface FIRStorageTask : NSObject

/**
 * An immutable view of the task and associated metadata, progress, error, etc.
 */
@property(strong, readonly, nonatomic, nonnull) FIRStorageTaskSnapshot *snapshot;

@end

/**
 * Defines task operations such as pause, resume, cancel, and enqueue for all tasks.
 * All tasks are required to implement enqueue, which begins the task, and may optionally
 * implement pause, resume, and cancel, which operate on the task to pause, resume, and cancel
 * operations.
 */
@protocol FIRStorageTaskManagement<NSObject>

@required
/**
 * Prepares a task and begins execution.
 */
- (void)enqueue;

@optional
/**
 * Pauses a task currently in progress.
 */
- (void)pause;

/**
 * Cancels a task currently in progress.
 */
- (void)cancel;

/**
 * Resumes a task that is paused.
 */
- (void)resume;

@end

NS_ASSUME_NONNULL_END
