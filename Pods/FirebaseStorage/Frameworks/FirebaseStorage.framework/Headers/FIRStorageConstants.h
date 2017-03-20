// clang-format off
/** @file FIRStorageConstants.h
    @brief Firebase SDK
    @copyright Copyright 2016 Google Inc.
    @remarks Use of this SDK is subject to the Google APIs Terms of Service:
    https://developers.google.com/terms/
 */
// clang-format on

#import <Foundation/Foundation.h>

@class FIRStorageDownloadTask;
@class FIRStorageMetadata;
@class FIRStorageTaskSnapshot;
@class FIRStorageUploadTask;

NS_ASSUME_NONNULL_BEGIN

/**
 * NSString typedef representing a task listener handle.
 */
typedef NSString *FIRStorageHandle;

/**
 * Block typedef typically used when downloading data.
 * @param data The data returned by the download, or nil if no data available or download failed.
 * @param error The error describing failure, if one occurred.
 */
typedef void (^FIRStorageVoidDataError)(NSData *_Nullable data, NSError *_Nullable error);

/**
 * Block typedef typically used when performing "binary" async operations such as delete,
 * where the operation either succeeds without an error or fails with an error.
 * @param error The error describing failure, if one occurred.
 */
typedef void (^FIRStorageVoidError)(NSError *_Nullable error);

/**
 * Block typedef typically used when retrieving metadata.
 * @param metadata The metadata returned by the operation, if metadata exists.
 */
typedef void (^FIRStorageVoidMetadata)(FIRStorageMetadata *_Nullable metadata);

/**
 * Block typedef typically used when retrieving metadata with the possibility of an error.
 * @param metadata The metadata returned by the operation, if metadata exists.
 * @param error The error describing failure, if one occurred.
 */
typedef void (^FIRStorageVoidMetadataError)(FIRStorageMetadata *_Nullable metadata,
                                            NSError *_Nullable error);

/**
 * Block typedef typically used to asynchronously return a storage task snapshot.
 * @param snapshot The returned task snapshot.
 */
typedef void (^FIRStorageVoidSnapshot)(FIRStorageTaskSnapshot *snapshot);

/**
 * Block typedef typically used when retrieving a download URL.
 * @param URL The download URL associated with the operation.
 * @param error The error describing failure, if one occurred.
 */
typedef void (^FIRStorageVoidURLError)(NSURL *_Nullable URL, NSError *_Nullable error);

/**
 * Enum representing the upload and download task status.
 */
typedef NS_ENUM(NSInteger, FIRStorageTaskStatus) {
  /**
   * Unknown task status.
   */
  FIRStorageTaskStatusUnknown,

  /**
   * Task is being resumed.
   */
  FIRStorageTaskStatusResume,

  /**
   * Task reported a progress event.
   */
  FIRStorageTaskStatusProgress,

  /**
   * Task is paused.
   */
  FIRStorageTaskStatusPause,

  /**
   * Task has completed successfully.
   */
  FIRStorageTaskStatusSuccess,

  /**
   * Task has failed and is unrecoverable.
   */
  FIRStorageTaskStatusFailure
};

/**
 * Firebase Storage error domain.
 */
FOUNDATION_EXPORT NSString *const FIRStorageErrorDomain;

/**
 * Enum representing the errors raised by Firebase Storage.
 */
typedef NS_ENUM(NSInteger, FIRStorageErrorCode) {
  /** An unknown error occurred. */
  FIRStorageErrorCodeUnknown = -13000,

  /** No object exists at the desired reference. */
  FIRStorageErrorCodeObjectNotFound = -13010,

  /** No bucket is configured for Firebase Storage. */
  FIRStorageErrorCodeBucketNotFound = -13011,

  /** No project is configured for Firebase Storage. */
  FIRStorageErrorCodeProjectNotFound = -13012,

  /**
   * Quota on your Firebase Storage bucket has been exceeded.
   * If you're on the free tier, upgrade to a paid plan.
   * If you're on a paid plan, reach out to Firebase support.
   */
  FIRStorageErrorCodeQuotaExceeded = -13013,

  /** User is unauthenticated. Authenticate and try again. */
  FIRStorageErrorCodeUnauthenticated = -13020,

  /**
   * User is not authorized to perform the desired action.
   * Check your rules to ensure they are correct.
   */
  FIRStorageErrorCodeUnauthorized = -13021,

  /**
   * The maximum time limit on an operation (upload, download, delete, etc.) has been exceeded.
   * Try uploading again.
   */
  FIRStorageErrorCodeRetryLimitExceeded = -13030,

  /**
   * File on the client does not match the checksum of the file received by the server.
   * Try uploading again.
   */
  FIRStorageErrorCodeNonMatchingChecksum = -13031,

  /**
   * Size of the downloaded file exceeds the amount of memory allocated for the download.
   * Increase memory cap and try downloading again.
   */
  FIRStorageErrorCodeDownloadSizeExceeded = -13032,

  /** User cancelled the operation. */
  FIRStorageErrorCodeCancelled = -13040
};

NS_ASSUME_NONNULL_END
