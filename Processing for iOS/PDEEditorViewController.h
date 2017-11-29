//
//  EditorViewController.h
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PDEFile.h"
#import "PDESketch.h"
#import "RunSketchViewController.h"

@interface PDEEditorViewController : UIViewController<UITextViewDelegate>

-(instancetype)initWithPDESketch:(PDESketch*)pdeSketch;

@property(nonatomic,strong) PDESketch* pdeSketch;
@property (strong, nonatomic) IBOutlet UITextView *editor;


@end
