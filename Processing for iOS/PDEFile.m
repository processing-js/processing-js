//
//  PDEFile.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import "PDEFile.h"
#import "PDESketch.h"

@implementation PDEFile

-(id)initWithFileName:(NSString *) fileName partOfSketch:(PDESketch*) sketch {
    self= [super init];
    
    if(self) {
        self.fileName = fileName;
        self.sketch = sketch;
    }
    
    return self;
}

-(NSString*)filePath {
    return [[FileManager documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"/sketches/%@/%@.pde",self.sketch.sketchName,self.fileName]];
}

-(NSString *)loadCode {
    if([[NSFileManager defaultManager] fileExistsAtPath:[self filePath]]) {
        NSString *programmCode = [NSString stringWithContentsOfFile:[self filePath] encoding:NSUTF8StringEncoding error:NULL];
        
        return programmCode;
    }

    return [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource: self.fileName ofType: @"pde"] usedEncoding:nil error:nil];
}

-(void)saveCode:(NSString *) code {
    [code writeToFile:[self filePath] atomically:YES encoding:NSUTF8StringEncoding error:nil];
}

@end
