//
//  PDEFile.m
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import "PDEFile.h"

@implementation PDEFile

-(id) initWithFileName:(NSString *) fileName {
    self= [super init];
    
    if(self) {
        self.fileName = fileName;
    }
    
    
    return self;
}

-(NSString *) loadCode {
    
    NSString *programmCodeDateiPfad = [[FileManager documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.pde",self.fileName]];

    
    
    if([[NSFileManager defaultManager] fileExistsAtPath:programmCodeDateiPfad]) {
        NSString *programmCode = [NSString stringWithContentsOfFile:programmCodeDateiPfad encoding:NSUTF8StringEncoding error:NULL];
        
        return programmCode;
    }
    
    
    
    return [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource: self.fileName ofType: @"pde"] usedEncoding:nil error:nil];
}

-(void) saveCode:(NSString *) code {
    NSString *programmCodeDateiPfad = [[FileManager documentsDirectory] stringByAppendingPathComponent:[NSString stringWithFormat:@"%@.pde",self.fileName]];
    [code writeToFile:programmCodeDateiPfad atomically:YES encoding:NSUTF8StringEncoding error:nil];
}

@end
