//
//  RunSketchViewController.h
//  Processing for iOS
//
//  Created by Frederik Riedel on 27.06.15.
//  Copyright (c) 2015 Frederik Riedel. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "PDEFile.h"
#import "FileManager.h"
@import CoreMotion;

@import WebKit;

@interface RunSketchViewController : UIViewController<UIWebViewDelegate, WKScriptMessageHandler>
    
    @property(nonatomic,strong) PDEFile *pdeFile;
    @property(nonatomic,strong) WKWebView *sketchWebView;
    
    @property (nonatomic,strong) CMMotionManager* motionManager;
    
    
-(id) initWithPDEFile:(PDEFile *) pdeFile;
    
    @end
