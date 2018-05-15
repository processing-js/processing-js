//
//  PDESketch.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 10/25/17.
//  Copyright © 2017 Frederik Riedel. All rights reserved.
//

#import "PDESketch.h"
#import "SketchController.h"

@implementation PDESketch

-(instancetype)initWithSketchName:(NSString*)sketchName {
    self = [super init];
    if (!self) {
        return nil;
    }
    
    self.sketchName = sketchName;
    return self;
}

-(NSArray<PDEFile *> *)pdeFiles {
    NSArray *filePathsArray = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:[[SketchController documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"sketches/%@",self.sketchName]]  error:nil];
    NSMutableArray* pdeFiles = [NSMutableArray array];
    for (NSString* pdeFileName in filePathsArray) {
        if ([pdeFileName.pathExtension isEqualToString:@"pde"]) {
            PDEFile* pdeFile = [[PDEFile alloc] initWithFileName:pdeFileName.stringByDeletingPathExtension partOfSketch:self];
            [pdeFiles addObject:pdeFile];
        }
    }
    
    if (!pdeFiles.count) {
        // check main bundle if we can copy the associated sample file
    }
    
    return pdeFiles.copy;
}

-(NSString*)filePath {
    return [NSString stringWithFormat:@"%@/sketches/%@",[FileManager documentsDirectory],self.sketchName];
}

@end
