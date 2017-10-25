//
//  SketchController.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 10/25/17.
//  Copyright © 2017 Frederik Riedel. All rights reserved.
//

#import "SketchController.h"


@implementation SketchController

+(void)loadSketches:(void (^)(NSArray<PDESketch*>* sketches))callback {
    if (![self haveSketchesBeenUpdated]) {
        // start update routine
        [self updateFilesToNewFolderStructure];
        if (![self haveSketchesBeenUpdated]) {
            NSLog(@"Error occured while updating to new folder structure.");
        }
    }
    
    NSMutableArray<PDESketch*>* pdeSketches = [NSMutableArray array];
    NSArray *filePathsArray = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:[[self documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"sketches"]]  error:nil];
    for (NSString* sketchFolder in filePathsArray) {
        NSString* sketchName = [sketchFolder lastPathComponent];
        if (![sketchName isEqualToString:@".DS_Store"]) {
            PDESketch* sketch = [[PDESketch alloc] initWithSketchName:sketchName];
            [pdeSketches addObject:sketch];
        }
    }
    callback(pdeSketches.copy);
}

+(void)updateFilesToNewFolderStructure {
    NSArray<NSString*>* legacyFiles = [self legacyItemsFromMenuFile];
    for (NSString* legacyFileName in legacyFiles) {
        NSString* currentPath = [[self documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.pde",legacyFileName]];
        NSString* movePath =  [[self documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"sketches/%@/%@.pde",legacyFileName,legacyFileName]];
        NSString* moveFolder = [[self documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"sketches/%@/data",legacyFileName]];
        NSError* error;
        [[NSFileManager defaultManager] createDirectoryAtPath:moveFolder withIntermediateDirectories:YES attributes:nil error:nil];
        [[NSFileManager defaultManager] moveItemAtPath:currentPath toPath:movePath error:&error];
        if (error) {
            NSLog(@"Error occured while copying the files: %@",error.description);
        }
    }
}

+(NSArray<NSString*>*)legacyItemsFromMenuFile {
    NSMutableArray* legacyFiles = [[NSMutableArray alloc] init];
    
    NSString *programmCodesPath = [[self documentsDirectory] stringByAppendingPathComponent:@"menu.txt"];
    NSString *programmCodesString = [NSString stringWithContentsOfFile:programmCodesPath encoding:NSUTF8StringEncoding error:NULL];
    
    for(NSString *fileName in [programmCodesString componentsSeparatedByString:@"\n"]) {
        if(![fileName isEqualToString:@""]) {
            [legacyFiles addObject:fileName];
        }
    }
    return legacyFiles.copy;
}

+(BOOL)haveSketchesBeenUpdated {
    NSArray *filePathsArray = [[NSFileManager defaultManager] contentsOfDirectoryAtPath:[self documentsDirectory]  error:nil];
    for (NSString* file in filePathsArray) {
        if ([file.pathExtension isEqualToString:@"pde"]) {
            return NO;
        }
    }
    return YES;
}

+(void)deleteSketchWithName:(NSString*)sketchName {
    [[NSFileManager defaultManager] removeItemAtPath:[[self documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"sketches/%@",sketchName]] error:nil];
}

+(void)savePDESketch:(PDESketch*)sketch {
    NSString* sketchPath = [[self documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"sketches/%@/data",sketch.sketchName]];
    if (![[NSFileManager defaultManager] fileExistsAtPath:sketchPath]) {
        [[NSFileManager defaultManager] createDirectoryAtPath:sketchPath withIntermediateDirectories:YES attributes:nil error:nil];
        NSLog(@"Created new folder for new sketch");
    }
    
}

+(NSString*)documentsDirectory {
    NSArray* paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString* documentsDirectory = [paths objectAtIndex:0];
    NSLog(@"%@",documentsDirectory);
    return documentsDirectory;
}

@end
