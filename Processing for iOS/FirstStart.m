//
//  FirstStart.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 11/28/17.
//  Copyright © 2017 Frederik Riedel. All rights reserved.
//

#import "FirstStart.h"

@implementation FirstStart

+(BOOL)isFirstStart {
    NSString* documentsPath = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString* firstStartFile = [documentsPath stringByAppendingPathComponent:@"firststart.txt"];
    BOOL fileExists = [[NSFileManager defaultManager] fileExistsAtPath:firstStartFile];
    
    if(!fileExists) {
        //first start
        [@"ALREADY INSTALLED" writeToFile:firstStartFile atomically:YES encoding:NSUTF8StringEncoding error:nil];
        return YES;
    }
    return NO;
}

@end
