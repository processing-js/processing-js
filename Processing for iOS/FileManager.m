//
//  FileManager.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import "FileManager.h"

@implementation FileManager

static NSString *documentsDirectory;
static NSString *container;
static NSArray *syntaxHighlighter;

+(NSString *) documentsDirectory {
    if(!documentsDirectory) {
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        documentsDirectory = [paths objectAtIndex:0];
    }
    
    return documentsDirectory;
}

+(NSString *) containerFile {
    if(!container) {
        
        NSString *filePath = [[NSBundle mainBundle] pathForResource:@"container" ofType:@"html"];
        
        if (filePath) {
            container = [NSString stringWithContentsOfFile:filePath encoding:NSUTF8StringEncoding error:nil];
        }
        
    }
    
    return container;
}

+(NSArray *) syntaxHighlighterDictionary {
    if(!syntaxHighlighter) {
        NSString *path = [[NSBundle mainBundle] pathForResource:@"syntax highlighting"
                                                         ofType:@"plist"];
        syntaxHighlighter = [[NSArray alloc]
                              initWithContentsOfFile:path];
    }
    
    return syntaxHighlighter;
}



@end
