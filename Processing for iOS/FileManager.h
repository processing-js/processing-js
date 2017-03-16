//
//  FileManager.h
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface FileManager : NSObject

+(NSString *) documentsDirectory;
+(NSString *) containerFile;
+(NSArray *) syntaxHighlighterDictionary;

@end
