// clang-format off
/** @file FIRStorageDownloadTask.h
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
 * FIRStorageDownloadTask implements resumable downloads from an object in Firebase Storage.
 * Downloads can be returned on completion with a completion handler, and can be monitored
 * by attaching observers, or controlled by calling FIRStorageTask#pause, FIRStorageTask#resume,
 * or FIRStorageTask#cancel.
 * Downloads can currently be returned as NSData in memory, or as an NSURL to a file on disk.
 * Downloads are performed on a background queue, and callbacks are raised on the developer
 * specified callbackQueue in FIRStorage, or the main queue if left unspecified.
 * Currently all uploads must be initiated and managed on the main queue.
 */
@interface FIRStorageDownloadTask : FIRStorageObservableTask<FIRStorageTaskManagement>

@end

NS_ASSUME_NONNULL_END
