// clang-format off
/** @file FIRStorageUploadTask.h
    @brief Firebase SDK
    @copyright Copyright 2016 Google Inc.
    @remarks Use of this SDK is subject to the Google APIs Terms of Service:
    https://developers.google.com/terms/
 */
// clang-format on

#import <Foundation/Foundation.h>

#import "FIRStorageObservableTask.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * FIRStorageUploadTask implements resumable uploads to a file in Firebase Storage.
 * Uploads can be returned on completion with a completion callback, and can be monitored
 * by attaching observers, or controlled by calling FIRStorageTask#pause, FIRStorageTask#resume,
 * or FIRStorageTask#cancel.
 * Uploads can take NSData in memory, or an NSURL to a file on disk.
 * Uploads are performed on a background queue, and callbacks are raised on the developer
 * specified callbackQueue in FIRStorage, or the main queue if left unspecified.
 * Currently all uploads must be initiated and managed on the main queue.
 */
@interface FIRStorageUploadTask : FIRStorageObservableTask<FIRStorageTaskManagement>

@end

NS_ASSUME_NONNULL_END
