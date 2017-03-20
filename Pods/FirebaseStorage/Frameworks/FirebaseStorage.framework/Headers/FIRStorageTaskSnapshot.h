// clang-format off
/** @file FIRStorageTaskSnapshot.h
 @brief Firebase SDK
 @copyright Copyright 2016 Google Inc.
 @remarks Use of this SDK is subject to the Google APIs Terms of Service:
 https://developers.google.com/terms/
 */
// clang-format on

#import <Foundation/Foundation.h>

#import "FIRStorageConstants.h"

NS_ASSUME_NONNULL_BEGIN

@class FIRStorageMetadata;
@class FIRStorageReference;
@class FIRStorageTask;

/**
 * FIRStorageTaskSnapshot represents an immutable view of a task.
 * A Snapshot contains a task, storage reference, metadata (if it exists),
 * progress, and an error (if one occurred).
 */
@interface FIRStorageTaskSnapshot : NSObject

/**
 * Subclass of FIRStorageTask this snapshot represents.
 */
@property(readonly, copy, nonatomic) __kindof FIRStorageTask *task;

/**
 * Metadata returned by the task, or nil if no metadata returned.
 */
@property(readonly, copy, nonatomic, nullable) FIRStorageMetadata *metadata;

/**
 * FIRStorageReference this task is operates on.
 */
@property(readonly, copy, nonatomic) FIRStorageReference *reference;

/**
 * NSProgress object which tracks the progess of an upload or download.
 */
@property(readonly, strong, nonatomic, nullable) NSProgress *progress;

/**
 * Error during task execution, or nil if no error occurred.
 */
@property(readonly, copy, nonatomic, nullable) NSError *error;

/**
 * Status of the task.
 */
@property(readonly, nonatomic) FIRStorageTaskStatus status;

@end

NS_ASSUME_NONNULL_END
