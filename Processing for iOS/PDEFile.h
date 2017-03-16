//
//  PDEFile.h
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "FileManager.h"

@interface PDEFile : NSObject

@property(nonatomic,strong) NSString *fileName;
@property(nonatomic,strong) NSDate *lastEdited;

-(id) initWithFileName:(NSString *) fileName;
-(NSString *) loadCode;
-(void) saveCode:(NSString *) code;

@end
